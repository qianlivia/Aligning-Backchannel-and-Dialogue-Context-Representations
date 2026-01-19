import os
import math
import torch
from datasets import load_dataset
from transformers import (
    AutoTokenizer, AutoModelForCausalLM,
    BitsAndBytesConfig, get_cosine_schedule_with_warmup
)
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
from accelerate import Accelerator
from torch.utils.data import DataLoader
from dataclasses import dataclass
from typing import List, Dict
from tqdm import tqdm

# ================== Global config ==================
TRAIN_DATA_FILE = "llm/data/lm_train.txt"
TEST_DATA_FILE  = "llm/data/lm_test.txt"

EPOCHS    = 10          # max epochs; early stopping will usually stop earlier
LR        = 2e-4
LORA_R, LORA_ALPHA, LORA_DROPOUT = 32, 64, 0.05

PATIENCE  = 2           # epochs with no val improvement before stopping
MIN_DELTA = 0.0         # require at least this much improvement in loss

accelerator = Accelerator(mixed_precision="bf16")  # 3090 supports bf16
device = accelerator.device

# Per-model config, tuned for a 3090 with 4-bit QLoRA
MODEL_CONFIGS = [
    { # Not used
        "name": "gemma2-9b",
        "model_id": "google/gemma-2-9b",
        "output_prefix": "gemma2-9b",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 16,
    },
    {
        "name": "llama3.1-8b",
        "model_id": "meta-llama/Llama-3.1-8B",
        "output_prefix": "llama3.1-8b",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 16,
    },
    {
        "name": "mistral-7b-v0.3",
        "model_id": "mistralai/Mistral-7B-v0.3",
        "output_prefix": "mistral-7b-v0.3",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 8,
    },
    { # Not used
        "name": "gemma3-12b",
        "model_id": "google/gemma-3-12b-pt",
        "output_prefix": "gemma3-12b",
        "max_len": 1024,
        "batch": 1,
        "grad_acc": 16,
    },
    {
        "name": "qwen2.5-7b",
        "model_id": "Qwen/Qwen2.5-7B",
        "output_prefix": "qwen2.5-7b",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 16,
    },
    { # Not used
        "name": "llama-3.2-3b",
        "model_id": "meta-llama/Llama-3.2-3B",
        "output_prefix": "llama3.2-3b",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 16,
    },
    {
        "name": "gemma3-4b",
        "model_id": "google/gemma-3-4b-pt",
        "output_prefix": "gemma3-4b",
        "max_len": 1024,
        "batch": 2,
        "grad_acc": 16,
    },
]

# ================== Load dataset once ==================
dataset_train = load_dataset("text", data_files=TRAIN_DATA_FILE, split="train")
dataset_test  = load_dataset("text", data_files=TEST_DATA_FILE, split="train")

accelerator.print(f"{len(dataset_train)} training examples") # type: ignore
accelerator.print(f"{len(dataset_test)} test examples") # type: ignore
accelerator.print(f"First train example: {dataset_train[0]}") # type: ignore


# ================== Collator ==================
@dataclass
class Collator:
    tokenizer: AutoTokenizer
    max_len: int
    def __call__(self, batch: List[Dict]):
        texts = [ex["text"] for ex in batch]
        toks = self.tokenizer(
            texts,
            max_length=self.max_len,
            truncation=True,
            padding=True,
            return_tensors="pt",
        ) # type: ignore
        labels = toks["input_ids"].clone()
        labels[toks["attention_mask"] == 0] = -100
        return {
            "input_ids": toks["input_ids"],
            "attention_mask": toks["attention_mask"],
            "labels": labels,
        }


# ================== Validation (token-weighted) ==================
def validate_model(model, test_dataloader):
    model.eval()
    total_nll = 0.0     # sum of loss * token_count
    total_tokens = 0    # sum of non-ignored tokens

    with torch.no_grad():
        for batch in tqdm(
            test_dataloader,
            desc="Validating",
            disable=not accelerator.is_main_process
        ):
            outputs = model(**batch)
            loss = outputs.loss                  # mean over non-ignored tokens
            labels = batch["labels"]
            token_count = (labels != -100).sum()  # tensor

            nll_per_batch = loss.detach() * token_count

            # Reduce across processes (no-op on single GPU, but future-proof)
            global_nll_sum = accelerator.reduce(nll_per_batch, reduction="sum")
            global_token_sum = accelerator.reduce(token_count, reduction="sum")

            total_nll += global_nll_sum.item() # type: ignore
            total_tokens += global_token_sum.item() # type: ignore

    avg_loss = total_nll / total_tokens if total_tokens > 0 else 0.0
    return avg_loss


# ================== Train one model ==================
def train_one_model(
    model_id: str,
    output_prefix: str,
    max_len: int,
    batch_size: int,
    grad_acc: int,
):
    accelerator.print(f"\n===== Training {model_id} =====")

    # --- Tokenizer ---
    tokenizer = AutoTokenizer.from_pretrained(model_id, use_fast=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    collator = Collator(tokenizer, max_len)
    train_dl = DataLoader(dataset_train, batch_size=batch_size, shuffle=True,  collate_fn=collator) # type: ignore
    test_dl  = DataLoader(dataset_test,  batch_size=batch_size, shuffle=False, collate_fn=collator) # type: ignore

    # --- 4-bit QLoRA model ---
    bnb_cfg = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.bfloat16,
        bnb_4bit_use_double_quant=True,
    )

    model = AutoModelForCausalLM.from_pretrained(
        model_id,
        quantization_config=bnb_cfg,
        device_map={"": accelerator.process_index},  # single-GPU: index 0
    )
    model.config.use_cache = False
    model.gradient_checkpointing_enable()
    model = prepare_model_for_kbit_training(model)

    # LoRA adapters (same target modules for Gemma / LLaMA / Mistral)
    lora_cfg = LoraConfig(
        r=LORA_R,
        lora_alpha=LORA_ALPHA,
        lora_dropout=LORA_DROPOUT,
        bias="none",
        task_type="CAUSAL_LM",
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
    )
    model = get_peft_model(model, lora_cfg)

    # --- Optimizer + scheduler ---
    optimizer = torch.optim.AdamW(model.parameters(), lr=LR)
    num_update_steps_per_epoch = math.ceil(len(train_dl) / grad_acc)
    t_total = num_update_steps_per_epoch * EPOCHS
    warmup = int(0.03 * t_total)
    scheduler = get_cosine_schedule_with_warmup(optimizer, warmup, t_total)

    # --- Prepare with Accelerate ---
    model, optimizer, train_dl, test_dl, scheduler = accelerator.prepare(
        model, optimizer, train_dl, test_dl, scheduler
    )

    # --- Training loop with early stopping ---
    model.train()
    global_step = 0

    best_val_loss = float("inf")
    patience_counter = 0
    last_val_loss = None
    last_val_ppl = None

    for epoch in range(EPOCHS):
        epoch_pbar = tqdm(
            enumerate(train_dl),
            total=len(train_dl),
            desc=f"Epoch {epoch+1}/{EPOCHS}",
            disable=not accelerator.is_main_process,
        )

        for step, batch in epoch_pbar:
            outputs = model(**batch)
            loss = outputs.loss / grad_acc
            accelerator.backward(loss)

            if (step + 1) % grad_acc == 0:
                optimizer.step()
                scheduler.step()
                optimizer.zero_grad()
                global_step += 1

                current_loss = (loss.detach().float() * grad_acc).item()
                if accelerator.is_main_process:
                    gpu_mem = (
                        torch.cuda.memory_allocated() / 1e9
                        if torch.cuda.is_available()
                        else 0
                    )
                    gpu_mem_reserved = (
                        torch.cuda.memory_reserved() / 1e9
                        if torch.cuda.is_available()
                        else 0
                    )
                    epoch_pbar.set_postfix(
                        {
                            "loss": f"{current_loss:.4f}",
                            "step": global_step,
                            "all": f"{gpu_mem:.1f}",
                            "res": f"{gpu_mem_reserved:.1f}",
                        }
                    )

        # ===== Validation step after each epoch =====
        accelerator.wait_for_everyone()
        val_loss = validate_model(model, test_dl)
        val_ppl = math.exp(val_loss)
        last_val_loss, last_val_ppl = val_loss, val_ppl

        if accelerator.is_main_process:
            print(
                f"[{model_id}] Epoch {epoch+1} "
                f"validation loss: {val_loss:.4f} | ppl: {val_ppl:.2f}"
            )

            # ---- Early stopping logic ----
            if val_loss < best_val_loss - MIN_DELTA:
                print("  New best validation loss. Resetting patience and saving 'best' checkpoint.")
                best_val_loss = val_loss
                patience_counter = 0

                best_dir = f"{output_prefix}-best"
                os.makedirs(best_dir, exist_ok=True)
                accelerator.unwrap_model(model).save_pretrained(best_dir)
                tokenizer.save_pretrained(best_dir)
                print(f"[{model_id}] Saved BEST LoRA adapter to: {best_dir}")
            else:
                patience_counter += 1
                print(f"  No improvement. Patience {patience_counter}/{PATIENCE}")
                if patience_counter >= PATIENCE:
                    print("  Early stopping triggered.")

        accelerator.wait_for_everyone()
        if patience_counter >= PATIENCE:
            break

        # (Optional) per-epoch checkpoint, separate from "best"
        if accelerator.is_main_process:
            save_dir = f"{output_prefix}-epoch{epoch+1}"
            os.makedirs(save_dir, exist_ok=True)
            accelerator.unwrap_model(model).save_pretrained(save_dir)
            tokenizer.save_pretrained(save_dir)
            print(f"[{model_id}] Saved LoRA adapter to: {save_dir}")

        model.train()

    return last_val_loss, last_val_ppl


# ================== Run all models sequentially ==================
if __name__ == "__main__":
    all_results = {}

    for cfg in MODEL_CONFIGS:
        val_loss, val_ppl = train_one_model(
            cfg["model_id"],
            cfg["output_prefix"],
            cfg["max_len"],
            cfg["batch"],
            cfg["grad_acc"],
        )
        if accelerator.is_main_process:
            all_results[cfg["name"]] = {"val_loss": val_loss, "val_ppl": val_ppl}
            print(f"\n=== Results for {cfg['name']} ===")
            print(f"  val_loss: {val_loss:.4f}")
            print(f"  val_ppl:  {val_ppl:.2f}")

        # Free VRAM between models
        torch.cuda.empty_cache()

    if accelerator.is_main_process:
        print("\n===== Summary over all models =====")
        for name, res in all_results.items():
            print(f"{name}: loss={res['val_loss']:.4f}, ppl={res['val_ppl']:.2f}")
