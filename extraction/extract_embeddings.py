import argparse
from peft import PeftModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
import torch
from tqdm import tqdm
import pickle
from pathlib import Path

# mapping = [
#     "file",
#     "name",
#     "start",
#     "end",
#     "channel",
#     "sex",
#     "embedding",
#     "emb_mean",
#     "bc",
#     "context",
#     "context_text",
#     "context_embedding",
#     "context_acoustic",
#     "context_gte_all",
#     "context_gte_last",
# ]

def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=str, default="llama3.1-8b-best", help="Model name or path", choices=[
        "gemma3-4b-bc-split-1",
        "llama3.1-8b-best",
        "qwen2.5-7b-best",
        "mistral-7b-v0.3-best",
        
        "meta-llama/Llama-3.1-8B",
        "mistralai/Mistral-7B-v0.3",
        "Qwen/Qwen2.5-7B",
        "google/gemma-3-4b-pt",
        ])
    parser.add_argument("--num_past_turns", type=int, default=5, choices = [1, 3, 5],
                        help="Number of past turns to include in context")
    args = parser.parse_args()
    return args


def create_embeddings(args, input_file: str, output_file: str) -> None:
    Path(output_file).parent.mkdir(parents=True, exist_ok=True)
    
    MODEL_PATH = args.model
    tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
    
    bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_compute_dtype=torch.bfloat16,
                         bnb_4bit_quant_type="nf4", bnb_4bit_use_double_quant=True)
    
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_PATH,
        dtype=torch.bfloat16,
        device_map="auto",
        # quantization_config=bnb
    )

    # Load the LoRA adapter
    # model = PeftModel.from_pretrained(model, MODEL_PATH)

    device = torch.device("cuda") if torch.cuda.is_available() else torch.device("mps") if torch.backends.mps.is_available() else torch.device("cpu")
    print(f"Running on device: {device}")
    model.eval()

    data = pickle.load(open(input_file, "rb"))
    for i, d in enumerate(tqdm(data, desc="Processing contexts")):
        context_text = turns_to_bc_pred_context(d["context"], num_past_turns=args.num_past_turns)
        inputs = tokenizer(context_text, return_tensors="pt").to(model.device)
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            hidden_states = outputs.hidden_states  # tuple of hidden states from each layer
            last_hidden_state = hidden_states[-1]  # shape: (1, seq_len, hidden_size)
            context_embedding = last_hidden_state[0, -1, :]
        d["context_embedding"] = context_embedding.detach().to(torch.float32).cpu().numpy()
        d["context_text"] = context_text
        
        if i % 20000 == 0 and i > 0:
            with open(output_file, "wb") as f:
                pickle.dump(data, f)

    with open(output_file, "wb") as f:
        pickle.dump(data, f)
    

def silence(duration) -> str:
    return (". " * int(duration * 2))

def word_string(words, include_silence=False) -> str:
    result = ""
    for i in range(len(words)):
        if i > 0 and include_silence:
            result += silence(words[i]["start"] - words[i-1]["end"])
        result += f"{words[i]['word']} "
    return result.strip()

def turns_to_bc_pred_context(turns, num_past_turns=1) -> str:
    text = ""
    final_overlap = False
    length = len(turns)
    for i, turn in enumerate(turns):
        if i < length - num_past_turns:
            continue
        text += f"<{turn['speaker']}> "  
        if "initial_overlap" in turn:
            text += "[ "
            text += word_string(turn["initial_overlap"], False)
            text += " ] "
        if turn["words"]:
            text += word_string(turn["words"], False) + " "
        if "final_overlap" in turn:
            text += "{ "
            text += word_string(turn["final_overlap"], False)
            text += " } / "
            final_overlap = True
        else:
            text += "/ "
            final_overlap = False
    text += "<A>" if turns[-1]["speaker"] == "B" else "<B>"
    if final_overlap:
        text += " ["
    return text

if __name__ == "__main__":
    args = parse_arguments()
    input_path = "joint_contrastive/extracted_embeddings/"
    output_path = "joint_contrastive/extracted_embeddings/"
    output_file = f"{output_path}{args.model}_embeddings_{args.num_past_turns}turns.pkl"
    input_file = f"{input_path}bc_matched_gte.pkl"
    
    create_embeddings(args, input_file=input_file, output_file=output_file)