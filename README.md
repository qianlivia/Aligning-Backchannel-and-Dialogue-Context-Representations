# Aligning Backchannel and Dialogue Context Representations via Contrastive LLM Fine-Tuning

1: We fine-tuned open-weight LLMs on Fisher transcripts and measured their perplexity on different context lengths (expressed in number of past turns). 2: We created context transcript embeddings by using these LLMs. 3: We trained a joint contrastive model using these context transcript embeddings, combined with the corresponding context audio embeddings (last second) and backchannel audio embeddings (full audio). 4: We collected perception data to compare our model to.

## 1. Fine-tuning LLMs

- _llm/lm_train.txt_, _llm/lm_test.txt_: Training and test data based on Fisher transcripts.
- **llm/extract_text_turns.py**: Create dataset with _n_ past turns, based on the txt files mentioned above. The number of past turns _n_ is only relevant in the case of measuring perplexity on the test set; for training, we used the full, unaltered transcripts in the training set.
- **llm/train.py**: Fine-tuning LLMs.
- **llm/calculate_perplexity.py**: Inference, calculate perplexity on the test set.
- _llm/perplexity_inference/_: Folder containing the measured perplexities based on the LLMs we fine-tuned (the weights of which are not in this repository).

## 2. Extracting last hidden embedding from fine-tuned (or pre-trained) LLM

- **extraction/extract_embeddings.py**: Extract the hidden states of the context text embeddings using a certain LLM and a certain number of past turns.
- **extraction/sweep_extraction.py**: Run multiple extraction processes in parallel.

## 3. Training the joint model on the extracted embeddings

- **joint_contrastive/contrastive.py**: Fine-tuning the joint model.
- **joint_contrastive/sweep_contrastive.py**: Parallelized hyperparameter tuning.
- _joint_contrastive/extracted_embeddings/bc_matched_gte.pkl_: Pickle file containing the GTE embeddings of the contexts, as well as the WavLM embeddings of the contexts and backchannels. Used as a baseline. NOTE: Only the GTE baseline's embeddings are stored in this repository. Embeddings extracted from the LLMs should be structured in the same way.
- _joint_contrastive/train_val_test_indices_sets.pkl_: training, validation and test splits, based on the names of the embeddings stored in the pickle file mentioned above.
- _joint_contrastive/bc_fica_wavlm.pkl_: WavLM embeddings of FiCa audio.

## 4. Perception study

- _joint_contrastive/triad2_results.csv_: Results of the perception study.
- _joint_contrastive/fica_unanimous.txt_: Results of the perception study from _Qian, L., Figueroa, C. & Skantze, G. (2025). Representation of perceived prosodic similarity of conversational feedback. In: Interspeech 2025_. Used for the **FiCa prosodic backchannel similarity task**.

## Datasets

- [FiCa](https://carolfigphd.github.io/FiCa-speech-dataset/)
- [Fisher English Training Speech Part 1 Transcripts](https://catalog.ldc.upenn.edu/LDC2004T19)
- [Fisher English Training Speech Part 1 Speech](https://catalog.ldc.upenn.edu/LDC2004S13)
- [Perception study files (combinations of _context + context transcript + backchannel options_)](https://github.com/qianlivia/perception_study/tree/master/triad2)

## Demo

- [Playable backchannels with visualization of the corresponding embeddings](https://feedbackembeddings.github.io/demo1/)

## Cite paper

- TODO
