import math
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from tqdm import tqdm
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--model", type=str, default="liviaq/llama3.1-8b-fisher", help="Model name or path", choices=[
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
    ])
parser.add_argument("--num", type=int, default=20, help="Number of past turns to use")
args = parser.parse_args()

num_past_turns = args.num

MODEL_PATH = args.model
CONTEXT_FILE = f"llm/data/past_turns_test_context_bc/test_set_context_{num_past_turns}.txt"
TARGET_FILE = f"llm/data/past_turns_test_context_bc/test_set_bc_{num_past_turns}.txt"

BATCH_SIZE = 1

def tokenize(tokenizer, texts):
    return tokenizer(texts, return_tensors="pt")

def build_batch(tokenizer, context, target):
    """
    Build:
      input_ids, attention_mask
      labels_full: -100 for context tokens; target tokens kept
      labels_first: only the first target token kept; all else -100
    """
    # Important: keep a single boundary space
    full_text = context.rstrip() + " " + target.strip()
    ctx_text  = context.rstrip()

    # Tokenize full and context-only
    enc_full = tokenize(tokenizer, full_text)
    enc_ctx  = tokenize(tokenizer, ctx_text)

    input_ids = enc_full["input_ids"]
    attention_mask = enc_full["attention_mask"]

    labels_full = torch.full_like(input_ids, -100)
    labels_first = torch.full_like(input_ids, -100)
    total_len = input_ids.size(1) # sequence length

    ctx_len = int(enc_ctx["attention_mask"].sum().item())  # number of context tokens (incl boundary space)
    seq_len = int(attention_mask.sum().item())             # non-pad tokens
    pad_left = total_len - seq_len
    tgt_start = pad_left + ctx_len
    tgt_end = pad_left + seq_len
    assert tgt_start < tgt_end, "Target must have at least one token!"
    print(f"ctx_len={ctx_len}, seq_len={seq_len}, pad_left={pad_left}, tgt_start={tgt_start}, tgt_end={tgt_end}")

    # Mask context and padding for full-target labels
    labels_full[0, tgt_start:tgt_end] = input_ids[0, tgt_start:tgt_end]

    # Start from full mask, then unmask only the first target token (if any)
    labels_first[0, tgt_start] = input_ids[0, tgt_start]
    decoded_target = tokenizer.decode(input_ids[0, tgt_start:tgt_end]).strip()
    assert decoded_target == target.strip(), "Decoded target does not match original target!"
    print(f"Decoded target: '{decoded_target}'")

    return input_ids, attention_mask, labels_full, labels_first

def summed_nll(shift_logits, shift_labels):
    """
    Cross-entropy summed over all non-masked tokens.
    """
    loss_fct = torch.nn.CrossEntropyLoss(ignore_index=-100, reduction="sum")
    return loss_fct(
        shift_logits.view(-1, shift_logits.size(-1)),
        shift_labels.view(-1)
    )

def main():
    bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16,
                         bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True)

    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)

    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        quantization_config=bnb,
        dtype=torch.bfloat16,
        device_map="auto",
    )
    model.eval()
    model_device = next(model.parameters()).device

    with open(CONTEXT_FILE, "r", encoding="utf-8") as f:
        contexts = [line.rstrip("\n") for line in f]
    with open(TARGET_FILE, "r", encoding="utf-8") as f:
        targets = [line.rstrip("\n") for line in f]

    assert len(contexts) == len(targets), "Context and target files must align line-by-line."

    total_full_nll = 0.0
    total_full_tokens = 0

    total_first_nll = 0.0
    total_first_tokens = 0

    for start in tqdm(range(len(contexts))):
        batch_ctx = contexts[start]
        batch_tgt = targets[start]

        input_ids, attention_mask, labels_full, labels_first = \
            build_batch(tokenizer, batch_ctx, batch_tgt)

        input_ids = input_ids.to(model_device)
        attention_mask = attention_mask.to(model_device)
        labels_full = labels_full.to(model_device)
        labels_first = labels_first.to(model_device)

        with torch.inference_mode():
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)
            logits = outputs.logits
            
        shift_logits = logits[..., :-1, :].contiguous()
        shift_labels_full = labels_full[..., 1:].contiguous().to(shift_logits.device)
        shift_labels_first = labels_first[..., 1:].contiguous().to(shift_logits.device)
        
        # Full-target tokens
        full_nll = summed_nll(shift_logits, shift_labels_full).item()
        full_tok = int((shift_labels_full != -100).sum().item())
        total_full_nll += full_nll
        total_full_tokens += full_tok

        # First-token-only
        first_nll = summed_nll(shift_logits, shift_labels_first).item()
        first_tok = int((shift_labels_first != -100).sum().item())
        assert(first_tok == 1)  # one first token per example
        total_first_nll += first_nll
        total_first_tokens += first_tok

    # Token-weighted losses and perplexities
    full_loss = total_full_nll / max(1, total_full_tokens)
    full_ppl = math.exp(full_loss)

    first_loss = total_first_nll / max(1, total_first_tokens)
    first_ppl = math.exp(first_loss)

    print(f"Examples: {len(contexts)}")
    print(f"Full-target scored tokens: {total_full_tokens}")
    print(f"First-token scored tokens: {total_first_tokens}")
    print()
    print(f"Full-target token-weighted loss: {full_loss:.6f}")
    print(f"Full-target token-weighted perplexity: {full_ppl:.6f}")
    print()
    print(f"First-token-only token-weighted loss: {first_loss:.6f}")
    print(f"First-token-only token-weighted perplexity: {first_ppl:.6f}")

if __name__ == "__main__":
    torch.set_printoptions(threshold=float("inf"))
    main()
