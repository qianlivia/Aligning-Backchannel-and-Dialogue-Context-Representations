import os
import pickle
import pandas as pd
method = 1

def validation_from_triad2():
    triad_pd = pd.read_csv('joint_contrastive/triad2_results.csv')
    sessions = []
    for i in range(3):
        for sess in triad_pd[triad_pd[f'fb{i}_name'].notna()][f'fb{i}_name'].unique():
            sessions.append(sess)
    return list(set(sessions))

data_filename = "joint_contrastive/bc_matched_gte.pkl"
with open(data_filename, "rb") as f:
    data = pickle.load(f)
    
validation_sessions = validation_from_triad2()

if method == 1:
    validation_sessions, test_sessions = validation_sessions[:len(validation_sessions)//2], validation_sessions[len(validation_sessions)//2:]
    print("Validation sessions:", validation_sessions)
    print("Test sessions:", test_sessions)

    train_idx = []
    val_idx = []
    test_idx = []
    for i, d in enumerate(data):
        if d["name"] in validation_sessions:
            val_idx.append(i)
        elif d["name"] in test_sessions:
            test_idx.append(i)
        else:
            train_idx.append(i)

else:
    print("Validation sessions:", validation_sessions)
    train_idx = []
    val_idx = []
    for i, d in enumerate(data):
        if d["name"] in validation_sessions:
            val_idx.append(i)
        else:
            train_idx.append(i)
            
    val_idx, test_idx = val_idx[:len(val_idx)//2], val_idx[len(val_idx)//2:]
    
print(len(train_idx), "training samples,", len(val_idx), "validation samples,", len(test_idx), "test samples. Total:", len(data))
print("Percentages: Train {:.2f}%, Val {:.2f}%, Test {:.2f}%".format(
    100*len(train_idx)/len(data),
    100*len(val_idx)/len(data),
    100*len(test_idx)/len(data),
))

# Save train, val and test indices
suffix = "" if method == 2 else "_sets"
file = f"joint_contrastive/train_val_test_indices{suffix}.pkl"

if not os.path.exists(file):
    with open(file, "wb") as f:
        pickle.dump({"train_idx": train_idx, "val_idx": val_idx, "test_idx": test_idx}, f)