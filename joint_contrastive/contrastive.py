import argparse
import pickle
from typing import Union
import pandas as pd
import torch
import torch.nn as nn
import numpy as np
import torch.nn.functional as F
from torch.utils.data import Dataset, DataLoader
import joint_contrastive.triadic as triadic
import random
from dataclasses import dataclass
from tqdm import tqdm
import copy
import os

def load_splits(file="joint_contrastive/train_val_test_indices_sets.pkl"):
    with open(file, "rb") as f:
        splits = pickle.load(f)
    return splits

class CustomDataset(Dataset):
    def __init__(self, context, feedback):
        assert len(context) == len(feedback), "Context and feedback must have the same length"
        self.context = context
        self.feedback = feedback

    def __len__(self):
        return len(self.context)

    def __getitem__(self, idx):
        return self.feedback[idx], self.context[idx]


class ProjectionLayer(nn.Module):
    def __init__(self, layer_sizes, device):
        super(ProjectionLayer, self).__init__()
        self.device = device
        if len(layer_sizes) < 2:
            raise ValueError("layer_sizes must contain at least input and output sizes.")
        elif len(layer_sizes) == 2:
            self.projection = nn.Linear(layer_sizes[0], layer_sizes[1])
        else:
            self.projection = nn.Sequential()
            for i in range(len(layer_sizes) - 1):
                self.projection.add_module(f"linear_{i}", nn.Linear(layer_sizes[i], layer_sizes[i + 1]))
                if i < len(layer_sizes) - 2:  # No activation after the last layer
                    self.projection.add_module(f"relu_{i}", nn.ReLU())
        self.to(device)

    def forward(self, x):
        input_was_numpy = isinstance(x, np.ndarray)
        if input_was_numpy:
            x = torch.tensor(x, device=self.device, dtype=torch.float32)

        if x.dim() == 1:
            x = x.unsqueeze(0)

        y = self.projection(x)
        y = F.normalize(y, p=2, dim=1)

        if input_was_numpy:
            return y.detach().cpu().numpy()
        return y


# Contrastive Loss Function
class ContrastiveLoss(nn.Module):
    def __init__(self, temperature=0.07):
        super().__init__()
        self.temperature = temperature

    def forward(self, feedback_embeddings, context_embeddings):
        # feedback_embeddings: [B, D]
        # context_embeddings:  [B, D]
        B = feedback_embeddings.size(0)

        logits = torch.matmul(feedback_embeddings, context_embeddings.T) / self.temperature
        targets = torch.arange(B, device=logits.device)

        loss_i2t = F.cross_entropy(logits, targets)
        loss_t2i = F.cross_entropy(logits.T, targets)
        contrastive_loss = (loss_i2t + loss_t2i) / 2

        return contrastive_loss


class ContrastiveModel:
    def __init__(self, context_projection_layers, feedback_projection_layers, device):
        assert context_projection_layers[-1] == feedback_projection_layers[-1], "Embedding sizes must match"
        self.embedding_size = context_projection_layers[-1]
        self.feedback_projection_layers = feedback_projection_layers
        self.context_projection_layers = context_projection_layers
        self.feedback_projection = ProjectionLayer(self.feedback_projection_layers, device)
        self.context_projection = ProjectionLayer(self.context_projection_layers, device)
        self.device = device

    def parameters(self):
        return list(self.feedback_projection.parameters()) + list(self.context_projection.parameters())

    def save(self, filepath, train_config, eval_result):
        """Save both projection layers and their configuration in a single file."""
        model_data = {
            "feedback_state_dict": self.feedback_projection.state_dict(),
            "context_state_dict": self.context_projection.state_dict(),
            "feedback_projection_layers": self.feedback_projection_layers,
            "context_projection_layers": self.context_projection_layers,
            "train_config": train_config.__dict__,
            "eval_result": eval_result.__dict__,
        }
        torch.save(model_data, filepath)


def ranks(feedback_embeddings, context_embeddings):
    sims = context_embeddings @ feedback_embeddings.T  # if already normalized
    ranked = torch.argsort(sims, dim=1, descending=True)
    targets = torch.arange(sims.size(0), device=sims.device).unsqueeze(1)
    # rank position (1-indexed) of the diagonal target in each row
    return (ranked == targets).nonzero(as_tuple=False)[:, 1].add(1).tolist()


# Calculates the percentage of items that are ranked in the k percent
def topKperc(ranks_list, k):
    t = len(ranks_list) * k / 100
    return len([x for x in ranks_list if x <= t]) / len(ranks_list)


def set_random_seed(seed=42):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)


@dataclass
class TrainConfig:
    save_filename: Union[str, None] = None  # Set this to a filepath to save the best model during training
    data_filename: str = "bc_matched_gte.pkl"
    random_seed: int = 42
    batch_size: int = 256
    embedding_size: int = 256
    context_layers: int = 3
    temperature: float = 0.1
    learning_rate: float = 0.001
    shuffle_training: bool = True
    shuffle_validation: bool = True
    context_llm: Union[str, None] = None  # Can be set to None to exclude linguistic context
    context_acoustic: Union[str, None] = None  # Can be set to None to exclude acoustic context
    feedback_embedding: str = "emb_mean"
    exclude_bcs: Union[list, None] = None  # List of backchannels to exclude from training
    device: torch.device = torch.device("cpu")
    splits_file: str = "joint_contrastive/train_val_test_indices_sets.pkl"


@dataclass
class EvalResult:
    # best-val metrics
    val_loss: float
    val_top10: float
    val_top25: float
    val_top50: float
    triadic_score: float
    # test metrics (computed using the best model)
    test_loss: float
    test_top10: float
    test_top25: float
    test_top50: float


def train_model(config: TrainConfig):
    set_random_seed(config.random_seed)

    print("Training configuration:")
    for key, value in config.__dict__.items():
        print(f"-{key}: {value}")

    epochs = 20

    with open(config.data_filename, "rb") as f:
        data = pickle.load(f)

    if config.exclude_bcs is not None:
        data = [d for d in data if d["bc"] not in config.exclude_bcs]

    feedback_embeddings = torch.stack([torch.tensor(d[config.feedback_embedding]) for d in data]).to(config.device)

    context_embeddings_acoustic = (
        torch.stack([torch.tensor(d[config.context_acoustic]) for d in data]).to(config.device)
        if config.context_acoustic is not None
        else None
    )

    context_embeddings_lm = (
        torch.stack([torch.tensor(d[config.context_llm].flatten(), dtype=torch.float32) for d in data]).to(config.device)
        if config.context_llm is not None
        else None
    )

    if context_embeddings_acoustic is not None and context_embeddings_lm is not None:
        context_embeddings = torch.cat([context_embeddings_acoustic, context_embeddings_lm], dim=1)
    elif context_embeddings_acoustic is not None:
        context_embeddings = context_embeddings_acoustic
    elif context_embeddings_lm is not None:
        context_embeddings = context_embeddings_lm
    else:
        raise ValueError("At least one context embedding must be provided.")

    context_emb_size = context_embeddings.shape[1]
    feedback_emb_size = feedback_embeddings.shape[1]

    print("Total data size:", len(data))
    splits = load_splits(config.splits_file)

    train_idx, val_idx, test_idx = (
        splits["train_idx"],
        splits["val_idx"],
        splits["test_idx"],
    )
    print(len(train_idx), "training samples,", len(val_idx), "validation samples,", len(test_idx), "test samples.")

    dataloader = DataLoader(
        CustomDataset(context_embeddings[train_idx], feedback_embeddings[train_idx]),
        batch_size=config.batch_size,
        shuffle=config.shuffle_training,
    )
    dataloader_val = DataLoader(
        CustomDataset(context_embeddings[val_idx], feedback_embeddings[val_idx]),
        batch_size=config.batch_size,
        shuffle=config.shuffle_validation,
    )
    dataloader_test = DataLoader(
        CustomDataset(context_embeddings[test_idx], feedback_embeddings[test_idx]),
        batch_size=config.batch_size,
        shuffle=False,
    )
    print("Training size (batches):", len(dataloader))
    print("Validation size (batches):", len(dataloader_val))
    print("Test size (batches):", len(dataloader_test))
    if len(dataloader_val) == 0 or len(dataloader_test) == 0:
        raise ValueError("Validation or test set is empty – check splits logic.")

    contrastive_loss_fn = ContrastiveLoss(temperature=config.temperature)
    if config.context_layers == 1:
        context_projection_layers = [context_emb_size, config.embedding_size]
    else:
        context_projection_layers = [context_emb_size] + [config.embedding_size] * config.context_layers
    feedback_projection_layers = [feedback_emb_size, config.embedding_size]
    model = ContrastiveModel(context_projection_layers, feedback_projection_layers, config.device)

    print("Feedback embedding size:", feedback_emb_size)
    print("Context embedding size:", context_emb_size)

    params = model.parameters()
    print("Number of trainable parameters:", sum(p.numel() for p in params if p.requires_grad))
    optimizer = torch.optim.Adam(params, lr=config.learning_rate, weight_decay=1e-4)

    fica_eval = triadic.FiCaTriadicEval(mode="audio")

    def eval_loader(dataloader_):
        total_loss = 0.0
        total_top10 = 0.0
        total_top25 = 0.0
        total_top50 = 0.0
        with torch.no_grad():
            batchn = 0
            for feedback_batch, context_batch in tqdm(dataloader_):
                batchn += 1
                print(f"Evaluating: batch {batchn}/{len(dataloader_)}         ", end="\r", flush=True)
                fb = model.feedback_projection(feedback_batch)
                ctx = model.context_projection(context_batch)
                loss = contrastive_loss_fn(fb, ctx)
                total_loss += loss.item()
                r = ranks(fb, ctx)
                total_top10 += topKperc(r, 10)
                total_top25 += topKperc(r, 25)
                total_top50 += topKperc(r, 50)
        n = len(dataloader_)
        return (total_loss / n, total_top10 / n, total_top25 / n, total_top50 / n)

    best_val_top10 = -1.0
    best_epoch = -1

    # Keep a copy of the best weights in-memory so we can compute test metrics for the best model at the end.
    best_feedback_state = None
    best_context_state = None
    best_snapshot = None  # holds (val_loss, val_top10, val_top25, val_top50, triadic_score)

    for epoch in range(epochs + 1):
        total_loss = 0.0
        batchn = 0
        for feedback_batch, context_batch in tqdm(dataloader):
            batchn += 1
            print(f"Training: batch {batchn}/{len(dataloader)}", end="\r", flush=True)
            optimizer.zero_grad()
            fb = model.feedback_projection(feedback_batch)
            ctx = model.context_projection(context_batch)
            loss = contrastive_loss_fn(fb, ctx)
            total_loss += loss.item()
            loss.backward()
            optimizer.step()

        train_loss = total_loss / len(dataloader)

        val_loss, val_top10, val_top25, val_top50 = eval_loader(dataloader_val)
        triadic_score = fica_eval.eval(model.feedback_projection)

        print(
            f"Epoch [{epoch}/{epochs}], "
            f"Train-Loss: {train_loss:.3f}, "
            f"Val-Loss: {val_loss:.3f}, "
            f"Val-Top10%: {val_top10:.3f}, "
            f"Val-Top25%: {val_top25:.3f}, "
            f"Val-Top50%: {val_top50:.3f}, "
            f"Triadic: {triadic_score:.3f}"
        )

        # Choose best model by Val-Top10% (your current criterion)
        if val_top10 > best_val_top10:
            best_val_top10 = val_top10
            best_epoch = epoch

            best_feedback_state = copy.deepcopy(model.feedback_projection.state_dict())
            best_context_state = copy.deepcopy(model.context_projection.state_dict())
            best_snapshot = (val_loss, val_top10, val_top25, val_top50, triadic_score)

            if config.save_filename is not None:
                # Create parent directories if they don't exist
                os.makedirs(os.path.dirname(config.save_filename), exist_ok=True)
                print("Best model so far, saving checkpoint weights...")
                # NOTE: test metrics are computed after training from the best model; placeholder for now.
                placeholder_eval = EvalResult(
                    val_loss=val_loss,
                    val_top10=val_top10,
                    val_top25=val_top25,
                    val_top50=val_top50,
                    triadic_score=triadic_score,
                    test_loss=float("nan"),
                    test_top10=float("nan"),
                    test_top25=float("nan"),
                    test_top50=float("nan"),
                )
                model.save(config.save_filename, train_config=config, eval_result=placeholder_eval)
            else:
                print("Best model so far")

    # Restore best weights before testing
    if best_feedback_state is None or best_context_state is None:
        raise RuntimeError("No best model snapshot was recorded – check training loop/metrics.")

    model.feedback_projection.load_state_dict(best_feedback_state)
    model.context_projection.load_state_dict(best_context_state)

    # Compute test metrics for the best model
    test_loss, test_top10, test_top25, test_top50 = eval_loader(dataloader_test)

    assert best_snapshot is not None
    best_val_loss, best_val_top10, best_val_top25, best_val_top50, best_triadic = best_snapshot
    print(
        f"\nBest model (by Val-Top10%) at epoch {best_epoch}: "
        f"Val-Loss: {best_val_loss:.3f}, Val-Top10%: {best_val_top10:.3f}, "
        f"Val-Top25%: {best_val_top25:.3f}, Val-Top50%: {best_val_top50:.3f}, "
        f"Triadic: {best_triadic:.3f}"
    )
    print(
        f"Test metrics (best model): "
        f"Test-Loss: {test_loss:.3f}, "
        f"Test-Top10%: {test_top10:.3f}, "
        f"Test-Top25%: {test_top25:.3f}, "
        f"Test-Top50%: {test_top50:.3f}\n"
    )

    if config.save_filename is not None:
        eval_result = EvalResult(
            val_loss=best_val_loss,
            val_top10=best_val_top10,
            val_top25=best_val_top25,
            val_top50=best_val_top50,
            triadic_score=best_triadic,
            test_loss=test_loss,
            test_top10=test_top10,
            test_top25=test_top25,
            test_top50=test_top50,
        )
        print("Saving best model with test metrics...")
        model.save(config.save_filename, train_config=config, eval_result=eval_result)

    return model


def load_model(filepath, device="cpu"):
    """Load both projection layers and their configuration from a single file."""
    model_data = torch.load(filepath, map_location=device)
    feedback_projection_layers = model_data["feedback_projection_layers"]
    context_projection_layers = model_data["context_projection_layers"]
    model = ContrastiveModel(context_projection_layers, feedback_projection_layers, device)
    model.feedback_projection.load_state_dict(model_data["feedback_state_dict"])
    model.context_projection.load_state_dict(model_data["context_state_dict"])
    return model


def validation_from_triad2():
    triad_pd = pd.read_csv("joint_contrastive/triad2_results.csv")
    sessions = []
    for i in range(3):
        for sess in triad_pd[triad_pd[f"fb{i}_name"].notna()][f"fb{i}_name"].unique():
            sessions.append(sess)
    return sessions


def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--data_filename",
        type=str,
        default="bc_matched_gte",
        choices=[
            "bc_matched_gte",  # GTE baseline
            
            # Fine-tuned LLM embeddings
            "llama3.1-8b-best_embeddings_1turns",
            "mistral-7b-v0.3-best_embeddings_1turns",
            "qwen2.5-7b-best_embeddings_1turns",
            "gemma3-4b-bc-split-1_embeddings_1turns",
            
            "llama3.1-8b-best_embeddings_3turns",
            "mistral-7b-v0.3-best_embeddings_3turns",
            "qwen2.5-7b-best_embeddings_3turns",
            "gemma3-4b-bc-split-1_embeddings_3turns",
            
            "llama3.1-8b-best_embeddings_5turns",
            "mistral-7b-v0.3-best_embeddings_5turns",
            "qwen2.5-7b-best_embeddings_5turns",
            "gemma3-4b-bc-split-1_embeddings_5turns",
            
            # Pre-trained LLM embeddings
            "google/gemma-3-4b-pt_embeddings_5turns",
            "meta-llama/Llama-3.1-8B_embeddings_5turns",
            "mistralai/Mistral-7B-v0.3_embeddings_5turns",
            "Qwen/Qwen2.5-7B_embeddings_5turns",
        ],
    )
    parser.add_argument("--num_context_layers", type=int, default=3, help="Number of context projection layers")
    parser.add_argument("--embedding_size", type=int, default=256, help="Size of the projected embeddings")
    parser.add_argument("--batch_size", type=int, default=256, help="Training batch size")
    parser.add_argument("--save_filename", type=str, help="Filename to save the best model")
    parser.add_argument(
        "--mode",
        type=str,
        default="combined",
        choices=["text", "audio", "combined"],
        help="Type of context to use",
    )
    args = parser.parse_args()
    return args


if __name__ == "__main__":
    device = (
        torch.device("cuda")
        if torch.cuda.is_available()
        else torch.device("mps")
        if torch.backends.mps.is_available()
        else torch.device("cpu")
    )
    print(f"Running on device: {device}")
    splits_file = "joint_contrastive/train_val_test_indices_sets.pkl"
    args = parse_arguments()

    baseline = True if args.data_filename == "bc_matched_gte" else False
    data_filename_raw = args.data_filename

    if args.mode in ["audio", "combined"]:
        context_acoustic = "context_acoustic"
    else:
        context_acoustic = None

    if args.mode in ["text", "combined"]:
        if baseline:
            context_llm = "context_gte_all"
        else:
            context_llm = "context_embedding"
    else:
        context_llm = None

    train_model(
        TrainConfig(
            save_filename=f"joint_contrastive/{args.save_filename}",
            data_filename=f"joint_contrastive/extracted_embeddings/{data_filename_raw}.pkl", # Precalculated embeddings path
            batch_size=args.batch_size,
            embedding_size=args.embedding_size,
            context_layers=args.num_context_layers,
            splits_file=splits_file,
            device=device,
            context_acoustic=context_acoustic,
            context_llm=context_llm,
        )
    )