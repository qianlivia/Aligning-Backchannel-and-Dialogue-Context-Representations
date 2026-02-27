import subprocess
import sys
import time
import torch
import os
from queue import Queue
from threading import Thread

# --- Configuration ---
TARGET_SCRIPT = "extraction/extract_embeddings.py"

# Argument choices
models = [
    # Fine-tuned models
    "liviaq/gemma3-4b-fisher",
    "liviaq/llama3.1-8b-fisher",
    "liviaq/qwen2.5-7b-fisher",
    "liviaq/mistral-7b-v0.3-fisher",
    
    # Base models
    "google/gemma-3-4b-pt",
    "meta-llama/Llama-3.1-8B",
    "Qwen/Qwen2.5-7B",
    "mistralai/Mistral-7B-v0.3",
]

past_turns_options = [1, 3, 5]

# How many jobs to run on a single GPU at once? 
# Keep at 1 unless you have huge VRAM.
JOBS_PER_GPU = 1

def get_available_gpus():
    """Detects available GPUs using PyTorch."""
    count = torch.cuda.device_count()
    if count == 0:
        print("No GPUs detected! Falling back to CPU (running 1 worker).")
        return ["cpu"]
    print(f"Detected {count} GPU(s).")
    gpus = [str(i) for i in range(count)]
    print(f"Using GPU order: {gpus}")
    return gpus

def worker(gpu_id, task_queue, worker_id):
    """
    A worker thread that pulls tasks from the queue and runs them on a specific GPU.
    """
    # Create logs directory
    os.makedirs("logs", exist_ok=True)

    while not task_queue.empty():
        try:
            model, turns = task_queue.get_nowait()
        except Exception:
            break # Queue is empty

        # Create a safe filename for the log
        safe_model_name = model.replace("/", "_")
        log_filename = f"logs/{safe_model_name}_turns-{turns}_new.log"

        print(f"[Worker {worker_id} @ GPU {gpu_id}] Starting: {model} (Turns: {turns})")
        print(f"   └── Logging to: {log_filename}")
        
        # Construct command
        command = [
            sys.executable, 
            "-u",
            TARGET_SCRIPT,
            "--model", model, 
            "--num_past_turns", str(turns)
        ]

        # Set environment variable to isolate this process to the specific GPU
        env = subprocess.os.environ.copy() # type: ignore
        if gpu_id != "cpu":
            # This forces the script to only see the assigned GPU
            env["CUDA_VISIBLE_DEVICES"] = gpu_id

        try:
            start_time = time.time()
            
            # Open log file to write stdout/stderr (progress bars)
            with open(log_filename, "w") as f:
                result = subprocess.run(command, env=env, stdout=f, stderr=f, text=True)
            
            elapsed = time.time() - start_time

            if result.returncode == 0:
                print(f"✅ [Worker {worker_id} @ GPU {gpu_id}] Finished: {model} (Turns: {turns}) in {elapsed:.1f}s")
            else:
                print(f"❌ [Worker {worker_id} @ GPU {gpu_id}] FAILED: {model} (Turns: {turns}) - Check {log_filename}")

        except Exception as e:
            print(f"!!! [Worker {worker_id}] Exception: {e}")
        
        task_queue.task_done()

def run_parallel():
    # 1. Prepare the queue
    task_queue = Queue()
    total_tasks = 0
    for model in models:
        for turns in past_turns_options:
            task_queue.put((model, turns))
            total_tasks += 1
    
    print(f"Loaded {total_tasks} tasks into the queue.\n")

    # 2. Detect Resources
    gpus = get_available_gpus()
    
    # 3. Create Workers
    threads = []
    worker_id = 0
    
    # Create N workers per GPU
    for gpu in gpus:
        for _ in range(JOBS_PER_GPU): 
            worker_id += 1
            t = Thread(target=worker, args=(gpu, task_queue, worker_id))
            t.start()
            threads.append(t)
            time.sleep(2) # Stagger start times slightly

    # 4. Wait for completion
    for t in threads:
        t.join()

    print("\nAll experiments completed.")

if __name__ == "__main__":
    run_parallel()