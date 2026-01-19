# Aligning-Backchannel-and-Dialogue-Context-Representations

## Training LLMs

- llm/extract_text_turns.py: create dataset with n past turns
- llm/train.py: fine-tuning LLM
- llm/calculate_perplexity.py: inference, calculate perplexity

## Extract last hidden embedding from fine-tuned (or pre-trained) LLM

- extraction/extract_embeddings.py: extract the context embedding based on a certain LLM and a certain number of past turns
- extraction/sweep_extraction.py: run multiple extraction processes in parallel

## Fine-tune joint model

- joint_contrastive/contrastive.py: fine-tuning the joint model
- joint_contrastive/sweep_contrastive.py: hyperparameter tuning
