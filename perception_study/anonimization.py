# Remove subject IDs column.
import pandas as pd

RESULT_CSV = "joint_contrastive/triad2_results.csv"

if __name__ == "__main__":
    df = pd.read_csv(RESULT_CSV)
    if "subject_id" in df.columns:
        df = df.drop(columns=["subject_id"])
    df.to_csv(RESULT_CSV, index=False)