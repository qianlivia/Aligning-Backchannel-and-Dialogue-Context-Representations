import ast
import os
import numpy as np
import pickle

def parse_line(line):
    return ast.literal_eval(line.strip())

def read_triadic(txt_file):
    with open(txt_file, 'r') as f:
        lines = f.readlines()
    data = [parse_line(line) for line in lines if line.strip()]
    result = []
    for d in data:
        files = d['files']
        most_similar = d['most_similar']
        files = most_similar + [f for f in files if f not in most_similar]
        result.append(files)
    return result

def read_fica(fica_data):
    fica_files = {os.path.basename(d["file"]): i for i, d in enumerate(fica_data)}
    triadic = read_triadic('joint_contrastive/fica_unanimous.txt')
    result = []
    for row in triadic:
        column = []
        for f in row:
            if f in fica_files:
                column.append(fica_files[f])
        if len(column) == 3:
            result.append(column)
    return result

def cosine_sim(emb1, emb2, eps=1e-12):
    denom = (np.linalg.norm(emb1) * np.linalg.norm(emb2)) + eps
    return np.dot(emb1, emb2) / denom

class FiCaTriadicEval:
    def __init__(self, mode: str, fica_data_filename: str = 'joint_contrastive/bc_fica_wavlm.pkl'):
        with open(fica_data_filename, 'rb') as f:
            self.fica_data = pickle.load(f)
        bcs = ['exactly', 'mhm', 'cool', 'ah', 'yes', 'mm', 'yup', 'absolutely', 'good', 'yeah', 'right', 'okay', 'sure', 'ooh', 'yea', 'really', 'uh-huh', 'yep', 'aha', 'wow', 'oh', 'definitely']
        self.fica_data = [data for data in self.fica_data if data["bc"] in bcs]
        if mode == 'audio':
            self.FBo_fica_acoustic = np.stack([data["mean"] for data in self.fica_data])
            self.FBo_fica = self.FBo_fica_acoustic
        elif mode == 'text':
            self.FBo_fica_llm = np.stack([data["bc_embedding"] for data in self.fica_data])
            self.FBo_fica = self.FBo_fica_llm
        elif mode == 'combined':
            self.FBo_fica_acoustic = np.stack([data["mean"] for data in self.fica_data])
            self.FBo_fica_llm = np.stack([data["bc_embedding"] for data in self.fica_data])
            self.FBo_fica = np.concatenate([self.FBo_fica_acoustic, self.FBo_fica_llm], axis=1)
        else:
            raise ValueError(f"Invalid mode: {mode}")
        self.triad_data = read_fica(self.fica_data)

    def eval(self, feedback_projection=None):
        if feedback_projection is None:
            FBc_fica = self.FBo_fica
        else:
            FBc_fica = feedback_projection(self.FBo_fica)
        corr = 0
        count = 0
        for i in range(len(self.triad_data)):
            entry = self.triad_data[i]
            embeddings = [FBc_fica[e] for e in entry]
            sims = []
            for i1, i2 in [(0, 1), (0, 2), (1, 2)]:
                similarity = cosine_sim(embeddings[i1], embeddings[i2])
                sims.append(similarity)
            if sims[0] > sims[1] and sims[0] > sims[2]:
                corr += 1
            count += 1
        return corr/count


if __name__ == '__main__':
    print("Result with raw embeddings:", FiCaTriadicEval(mode="audio").eval())