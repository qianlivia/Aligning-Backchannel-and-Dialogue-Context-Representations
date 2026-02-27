"""
Grid-sweep launcher for joint_contrastive.contrastive with:
- per-config checkpoint + log files
- parallel execution
- CSV summary (return codes + parsed best metrics)
- automatic retry on CUDA OOM by stepping down batch size (optionally embedding size)

How to run:
  python -m joint_contrastive.sweep_contrastive --gpus 0,1,2 --max_workers 4
"""

from __future__ import annotations

import argparse
import csv
import itertools
import os
import re
import subprocess
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Union
from concurrent.futures import ThreadPoolExecutor, as_completed

NUM_TURNS = 5 # NOTE: Change this to match the number of turns in your data files
DATA_FILENAMES = [
    f"llama3.1-8b-fisher_embeddings_{NUM_TURNS}turns",
    f"mistral-7b-v0.3-fisher_embeddings_{NUM_TURNS}turns",
    f"qwen2.5-7b-fisher_embeddings_{NUM_TURNS}turns",
    f"gemma3-4b-bc-split-1_embeddings_{NUM_TURNS}turns",
    
    "google/gemma-3-4b-pt_embeddings_5turns",
    "meta-llama/Llama-3.1-8B_embeddings_5turns",
    "mistralai/Mistral-7B-v0.3_embeddings_5turns",
    "Qwen/Qwen2.5-7B_embeddings_5turns",
]
NUM_CONTEXT_LAYERS = [1, 2, 3, 4]
EMBEDDING_SIZES = [64, 128, 256]
BATCH_SIZES = [1024, 2048, 4096, 8192]
MODES = ["text", "combined"]


def _slug(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


@dataclass(frozen=True)
class Job:
    data_filename: str
    num_context_layers: int
    embedding_size: int
    batch_size: int
    mode: str

    def ckpt_name(self) -> str:
        return (
            f"df={_slug(self.data_filename)}"
            f"__mode={self.mode}"
            f"__ctx={self.num_context_layers}"
            f"__emb={self.embedding_size}"
            f"__bs={self.batch_size}"
            f".pth"
        )

    def log_name(self) -> str:
        return self.ckpt_name().replace(".pth", ".log")


@dataclass
class JobResult:
    # identity
    data_filename: str
    num_context_layers: int
    embedding_size: int
    batch_size: int
    mode: str

    # execution
    gpu: str
    attempts: int
    final_returncode: int
    status: str  # OK / FAIL / SKIPPED

    # paths
    ckpt_path: str
    log_path: str

    # parsed metrics (best observed)
    best_val_loss: Optional[float] = None
    best_val_top10: Optional[float] = None
    best_val_top25: Optional[float] = None
    best_val_top50: Optional[float] = None

    # parsed test metrics (from end-of-log test print)
    best_test_loss: Optional[float] = None
    best_test_top10: Optional[float] = None
    best_test_top25: Optional[float] = None
    best_test_top50: Optional[float] = None

    best_triadic: Optional[float] = None
    best_epoch: Optional[int] = None


def build_jobs() -> List[Job]:
    return [
        Job(df, ctx, emb, bs, mode)
        for df, ctx, emb, bs, mode in itertools.product(
            DATA_FILENAMES, NUM_CONTEXT_LAYERS, EMBEDDING_SIZES, BATCH_SIZES, MODES
        )
    ]


# ---- log parsing ----
EPOCH_RE = re.compile(
    r"Epoch\s*\[(\d+)\s*/\s*(\d+)\]"
    r".*?Train-Loss:\s*([0-9]*\.?[0-9]+)"
    r".*?Val-Loss:\s*([0-9]*\.?[0-9]+)"
    r".*?Val-Top10%:\s*([0-9]*\.?[0-9]+)"
    r".*?Val-Top25%:\s*([0-9]*\.?[0-9]+)"
    r".*?Val-Top50%:\s*([0-9]*\.?[0-9]+)"
    r".*?Triadic:\s*([0-9]*\.?[0-9]+)"
)

# Matches a variety of "Test ..." summary formats, e.g.:
# "Test-Loss: 0.123, Test-Top10%: 0.45, Test-Top25%: 0.67, Test-Top50%: 0.89"
# or "Test Loss: 0.123 ... Test Top10%: 0.45 ..."
TEST_RE = re.compile(
    r"Test[-\s]*Loss:\s*([0-9]*\.?[0-9]+)"
    r".*?Test[-\s]*Top10%:\s*([0-9]*\.?[0-9]+)"
    r".*?Test[-\s]*Top25%:\s*([0-9]*\.?[0-9]+)"
    r".*?Test[-\s]*Top50%:\s*([0-9]*\.?[0-9]+)",
    re.IGNORECASE,
)


def parse_best_metrics_from_log(log_path: Path) -> Union[Dict[str, Optional[float]], Dict[str, None]]:
    """
    Parses:
      - best epoch metrics chosen by (val_top10, -val_loss, -triadic)
      - test metrics from the LAST matching "Test-..." line in the log (if present)
    """
    empty: Dict[str, Optional[float]] = {
        "best_val_loss": None,
        "best_val_top10": None,
        "best_val_top25": None,
        "best_val_top50": None,
        "best_test_loss": None,
        "best_test_top10": None,
        "best_test_top25": None,
        "best_test_top50": None,
        "best_triadic": None,
        "best_epoch": None,
    }
    if not log_path.exists():
        return empty

    best = None  # tuple: (key, epoch, val_loss, top10, top25, top50, triadic)
    last_test = None  # tuple: (test_loss, t10, t25, t50)

    with open(log_path, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            m = EPOCH_RE.search(line)
            if m:
                epoch = int(m.group(1))
                val_loss = float(m.group(4))
                top10 = float(m.group(5))
                top25 = float(m.group(6))
                top50 = float(m.group(7))
                triadic = float(m.group(8))

                key = (top10, -val_loss, -triadic)  # prefer higher top10, lower loss, higher triadic
                if best is None or key > best[0]:
                    best = (key, epoch, val_loss, top10, top25, top50, triadic)

            t = TEST_RE.search(line)
            if t:
                last_test = (
                    float(t.group(1)),
                    float(t.group(2)),
                    float(t.group(3)),
                    float(t.group(4)),
                )

    if best is None:
        out = empty
    else:
        _, epoch, val_loss, top10, top25, top50, triadic = best
        out: Dict[str, Optional[float]] = {
            "best_val_loss": val_loss,
            "best_val_top10": top10,
            "best_val_top25": top25,
            "best_val_top50": top50,
            "best_test_loss": None,
            "best_test_top10": None,
            "best_test_top25": None,
            "best_test_top50": None,
            "best_triadic": triadic,
            "best_epoch": epoch,
        }

    if last_test is not None:
        test_loss, t10, t25, t50 = last_test
        out["best_test_loss"] = test_loss
        out["best_test_top10"] = t10
        out["best_test_top25"] = t25
        out["best_test_top50"] = t50

    return out


# ---- OOM detection ----
OOM_PATTERNS = [
    re.compile(r"CUDA out of memory", re.IGNORECASE),
    re.compile(r"out of memory", re.IGNORECASE),
    re.compile(r"cublas.*alloc", re.IGNORECASE),
]


def log_shows_oom(log_path: Path) -> bool:
    if not log_path.exists():
        return False
    try:
        txt = log_path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return False
    return any(p.search(txt) for p in OOM_PATTERNS)


def next_smaller(value: int, allowed_desc: List[int]) -> Optional[int]:
    """allowed_desc must be sorted descending. Returns the next smaller allowed value or None."""
    for v in allowed_desc:
        if v < value:
            return v
    return None


# ---- execution ----
def run_one_attempt(
    *,
    job: Job,
    ckpt_path: Path,
    log_path: Path,
    gpu_id: Optional[str],
    python_exe: str,
    extra_env: Dict[str, str],
    dry_run: bool,
) -> int:
    cmd = [
        python_exe,
        "-m",
        "joint_contrastive.contrastive",
        "--data_filename",
        job.data_filename,
        "--num_context_layers",
        str(job.num_context_layers),
        "--embedding_size",
        str(job.embedding_size),
        "--batch_size",
        str(job.batch_size),
        "--mode",
        job.mode,
        "--save_filename",
        str(ckpt_path),
    ]

    env = os.environ.copy()
    env.update(extra_env)
    if gpu_id is not None and gpu_id != "":
        env["CUDA_VISIBLE_DEVICES"] = gpu_id

    if dry_run:
        print("DRY RUN:", " ".join(cmd), f"(CUDA_VISIBLE_DEVICES={env.get('CUDA_VISIBLE_DEVICES','')})")
        return 0

    ckpt_path.parent.mkdir(parents=True, exist_ok=True)
    log_path.parent.mkdir(parents=True, exist_ok=True)

    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"# started: {datetime.now().isoformat()}\n")
        f.write(f"# cmd: {' '.join(cmd)}\n")
        f.write(f"# CUDA_VISIBLE_DEVICES={env.get('CUDA_VISIBLE_DEVICES','')}\n\n")
        f.flush()

        proc = subprocess.run(
            cmd,
            stdout=f,
            stderr=subprocess.STDOUT,
            env=env,
            cwd=str(Path.cwd()),
        )

        f.write(f"\n# finished: {datetime.now().isoformat()}\n")
        f.write(f"# returncode: {proc.returncode}\n")

    return proc.returncode


def run_job_with_retries(
    job: Job,
    ckpt_dir: Path,
    log_dir: Path,
    gpu_id: Optional[str],
    python_exe: str,
    extra_env: Dict[str, str],
    dry_run: bool,
    skip_existing: bool,
    retry_on_oom: bool,
    oom_max_retries: int,
    oom_reduce_embedding: bool,
) -> JobResult:
    initial_ckpt = ckpt_dir / job.ckpt_name()
    initial_log = log_dir / job.log_name()
    gpu_label = gpu_id if gpu_id is not None else ""

    if skip_existing and initial_ckpt.exists():
        metrics = parse_best_metrics_from_log(initial_log)
        return JobResult(
            **asdict(job),  # type: ignore
            gpu=gpu_label,
            attempts=0,
            final_returncode=0,
            status="SKIPPED",
            ckpt_path=str(initial_ckpt),
            log_path=str(initial_log),
            **metrics,
        )

    allowed_bs_desc = sorted(BATCH_SIZES, reverse=True)
    allowed_emb_desc = sorted(EMBEDDING_SIZES, reverse=True)

    current = job
    attempts = 0
    last_rc = 1
    status = "FAIL"
    final_ckpt = initial_ckpt
    final_log = initial_log

    while True:
        attempts += 1
        final_ckpt = ckpt_dir / current.ckpt_name()
        final_log = log_dir / current.log_name()

        rc = run_one_attempt(
            job=current,
            ckpt_path=final_ckpt,
            log_path=final_log,
            gpu_id=gpu_id,
            python_exe=python_exe,
            extra_env=extra_env,
            dry_run=dry_run,
        )
        last_rc = rc

        if dry_run:
            status = "OK"
            break

        if rc == 0:
            status = "OK"
            break

        if retry_on_oom and log_shows_oom(final_log) and attempts <= oom_max_retries:
            new_bs = next_smaller(current.batch_size, allowed_bs_desc)
            if new_bs is not None:
                current = Job(
                    data_filename=current.data_filename,
                    num_context_layers=current.num_context_layers,
                    embedding_size=current.embedding_size,
                    batch_size=new_bs,
                    mode=current.mode,
                )
                continue

            if oom_reduce_embedding:
                new_emb = next_smaller(current.embedding_size, allowed_emb_desc)
                if new_emb is not None:
                    current = Job(
                        data_filename=current.data_filename,
                        num_context_layers=current.num_context_layers,
                        embedding_size=new_emb,
                        batch_size=max(BATCH_SIZES),
                        mode=current.mode,
                    )
                    continue

        status = "FAIL"
        break

    metrics = parse_best_metrics_from_log(final_log)
    return JobResult(
        **asdict(current),  # type: ignore
        gpu=gpu_label,
        attempts=attempts,
        final_returncode=last_rc,
        status=status,
        ckpt_path=str(final_ckpt),
        log_path=str(final_log),
        **metrics,
    )


def write_csv_summary(csv_path: Path, results: List[JobResult]) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    fields = list(asdict(results[0]).keys()) if results else []
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in results:
            w.writerow(asdict(r))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--max_workers", type=int, default=1, help="Max concurrent runs.")
    ap.add_argument(
        "--gpus",
        type=str,
        default="",
        help="Comma-separated GPU ids (e.g. '0,1,2'). If provided, jobs are assigned round-robin.",
    )
    ap.add_argument("--ckpt_dir", type=str, default=f"sweeps_w_test_sets_{NUM_TURNS}turns/contrastive_ckpts")
    ap.add_argument("--log_dir", type=str, default=f"sweeps_w_test_sets_{NUM_TURNS}turns/contrastive_logs")
    ap.add_argument("--summary_csv", type=str, default=f"sweeps_w_test_sets_{NUM_TURNS}turns/contrastive_summary.csv")
    ap.add_argument("--python", type=str, default="python3")
    ap.add_argument("--skip_existing", action="store_true")

    ap.add_argument("--retry_on_oom", action="store_true", help="Retry failed jobs if log suggests CUDA OOM.")
    ap.add_argument("--oom_max_retries", type=int, default=6, help="Max retries per job on OOM.")
    ap.add_argument(
        "--oom_reduce_embedding",
        action="store_true",
        help="If batch size hits minimum and still OOM, step down embedding size.",
    )

    ap.add_argument("--dry_run", action="store_true")
    args = ap.parse_args()

    ckpt_dir = Path(args.ckpt_dir)
    log_dir = Path(args.log_dir)
    summary_csv = Path(args.summary_csv)

    gpu_list = [g.strip() for g in args.gpus.split(",") if g.strip()] if args.gpus else []
    jobs = build_jobs()

    total = len(jobs)
    print(f"Total jobs: {total}")
    if gpu_list:
        print(f"GPUs: {gpu_list} (round-robin assignment)")
    print(f"max_workers: {args.max_workers}")
    print(f"ckpt_dir: {ckpt_dir}")
    print(f"log_dir: {log_dir}")
    print(f"summary_csv: {summary_csv}")

    extra_env = {"TOKENIZERS_PARALLELISM": "false"}

    results: List[JobResult] = []

    with ThreadPoolExecutor(max_workers=args.max_workers) as ex:
        future_to_job: Dict = {}
        for idx, job in enumerate(jobs):
            gpu_id = gpu_list[idx % len(gpu_list)] if gpu_list else None
            fut = ex.submit(
                run_job_with_retries,
                job,
                ckpt_dir,
                log_dir,
                gpu_id,
                args.python,
                extra_env,
                args.dry_run,
                args.skip_existing,
                args.retry_on_oom,
                args.oom_max_retries,
                args.oom_reduce_embedding,
            )
            future_to_job[fut] = job

        done = 0
        for fut in as_completed(future_to_job):
            res = fut.result()
            results.append(res)
            done += 1
            print(f"[{done}/{total}] {res.status} – {Path(res.ckpt_path).name} (gpu={res.gpu}, attempts={res.attempts})")

    results.sort(key=lambda r: (r.data_filename, r.mode, r.num_context_layers, r.embedding_size, r.batch_size))
    write_csv_summary(summary_csv, results)
    print(f"CSV summary written to: {summary_csv}")
    print(f"Done. Failures: {sum(r.status == 'FAIL' for r in results)} / {len(results)}")


if __name__ == "__main__":
    main()
