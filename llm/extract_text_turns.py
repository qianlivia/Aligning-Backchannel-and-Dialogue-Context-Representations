import re
import string
from typing import Union

num_past_turns = 50
INPUT_FILE = "llm/data/lm_test.txt"
BC_FILE = f"llm/data/past_turns_test_context_bc/test_set_bc_{num_past_turns}.txt"
CTX_FILE = f"llm/data/past_turns_test_context_bc/test_set_context_{num_past_turns}.txt"

BACKCHANNELS = {
    "yes", "ah", "aha", "right", "yup", "exactly", "oh", "wow", "yeah",
    "yep", "really", "yea", "absolutely", "definitely", "good", "sure",
    "mm", "okay", "ooh", "uh-huh", "mhm", "cool",
}

def normalize_token(s: str) -> str:
    s = s.lower()
    keep = "-'"
    drop = "".join(ch for ch in string.punctuation if ch not in keep)
    s = s.translate(str.maketrans("", "", drop))
    return " ".join(s.split())

def get_speaker(turn: str) -> Union[str, None]:
    m = re.match(r"\s*(<[A-Za-z]>)", turn)
    return m.group(1) if m else None

def extract_bracket_bc(turn: str):
    """
    Returns (prefix_with_[, token) or None
    """
    if "[" not in turn or "]" not in turn:
        return None

    speaker = get_speaker(turn)
    pre, rest = turn.split("[", 1)
    inside, _ = rest.split("]", 1)

    inside = re.sub(r"<[A-Za-z]>", " ", inside)
    for ch in "{}[]":
        inside = inside.replace(ch, " ")

    inside = normalize_token(inside)
    toks = inside.split()

    if len(toks) == 1 and toks[0] in BACKCHANNELS:
        prefix = pre.rstrip() + " ["
        return prefix, toks[0]

    return None

def extract_plain_bc(turn: str):
    """
    Returns token if entire turn is a single backchannel, else None
    """
    speaker = get_speaker(turn)
    if not speaker:
        return None

    content = turn[len(speaker):]
    for ch in "{}[]":
        content = content.replace(ch, " ")

    content = normalize_token(content)
    toks = content.split()

    if len(toks) == 1 and toks[0] in BACKCHANNELS:
        return toks[0]

    return None

if __name__ == "__main__":
    with open(INPUT_FILE, "r", encoding="utf-8") as fin, \
        open(BC_FILE, "w", encoding="utf-8") as f_bc, \
        open(CTX_FILE, "w", encoding="utf-8") as f_ctx:

        for line in fin:
            line = line.strip()
            if not line:
                continue

            turns = [t.strip() for t in line.split("/") if t.strip()]

            for i, turn in enumerate(turns):
                if i < num_past_turns:
                    continue  # need two previous turns

                # 1) Bracketed case
                bracket = extract_bracket_bc(turn)
                if bracket is not None:
                    prefix, token = bracket
                    context = f"{turns[i-num_past_turns]} /"
                    for j in range(i-num_past_turns+1, i):
                        context += f" {turns[j]} /"
                    context += f" {prefix}"
                    f_ctx.write(context + "\n")
                    f_bc.write(token + "\n")
                    continue

                # 2) Plain backchannel case
                token = extract_plain_bc(turn)
                if token is not None:
                    speaker = get_speaker(turn)
                    context = f"{turns[i-num_past_turns]}"
                    for j in range(i-num_past_turns+1, i):
                        context += f" / {turns[j]}"
                    context += f" / {speaker}"
                    f_ctx.write(context + "\n")
                    f_bc.write(token + "\n")
