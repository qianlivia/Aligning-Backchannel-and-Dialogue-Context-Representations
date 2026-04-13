# Aligning Backchannel and Dialogue Context Representations via Contrastive LLM Fine-Tuning

1: We fine-tuned open-weight LLMs on Fisher transcripts and measured their perplexity on different context lengths (expressed in number of past turns). 2: Using these LLMs, we created the context transcript embeddings of the dataset used for training the joint contrastive model (see next step). 3: We trained a joint contrastive model using these context transcript embeddings, combined with the corresponding context audio embeddings (last second) and backchannel audio embeddings (full audio). 4: We collected perception data to compare our model to.

## 1. Fine-tuning LLMs

- _llm/lm_train.txt_, _llm/lm_test.txt_: Training and test data based on Fisher transcripts.
- **llm/extract_text_turns.py**: Create dataset with _n_ past turns, based on the test set _llm/data/lm_test.txt_. The number of past turns _n_ is only relevant in the case of measuring perplexity on the test set (see _llm/past_turns_test_context_bc/_); for training, we used the full, unaltered transcripts in the training set.
- **llm/train.py**: Fine-tune LLMs.
- **llm/calculate_perplexity.py**: Inference; calculate perplexity on the test set with different numbers of past turns.
- _llm/perplexity_inference/_: Folder containing perplexities measured with the LLMs we fine-tuned (the weights of which can be found under Section _Fine-tuned LLMs_).

## 2. Extracting last hidden embedding from fine-tuned (or pre-trained) LLMs

- **extraction/extract_embeddings.py**: Prepare the dataset (_joint_contrastive/extracted_embeddings/bc_matched_gte.pkl_) for training the joint model by extracting the hidden states of the context text embeddings using a certain LLM and a certain number of past turns.
- **extraction/sweep_extraction.py**: Run multiple extraction processes in parallel.

## 3. Training the joint model on the extracted embeddings

- _joint_contrastive/extracted_embeddings/bc_matched_gte.pkl_: Pickle file containing the context transcripts, backchannels, the GTE embeddings of the contexts, as well as the WavLM embeddings of the contexts and backchannels. The GTE embeddings serve as a baseline, while the transcripts can be encoded using different LLMs to create other types of context embeddings. NOTE: Only the GTE baseline's embeddings are stored in this repository. Embeddings extracted from the LLMs should be stored in separate pickle files that are structured in the same way. Name them as [model_name]\_embeddings\_[number_of_turns]turns.pkl, e.g. _llama3.1-8b-fisher_embeddings_1turns.pkl_.
- _joint_contrastive/train_val_test_indices_sets.pkl_: training, validation and test splits, based on the names of the embeddings stored in the pickle file mentioned above.
- _joint_contrastive/bc_fica_wavlm.pkl_: WavLM embeddings of FiCa audio.
- **joint_contrastive/contrastive.py**: Train the joint model.
- **joint_contrastive/sweep_contrastive.py**: Parallelized hyperparameter tuning.
- _joint_contrastive/results/_: Results of the hyperparameter tuning. Note that our initial model naming convention was slightly different.

## 4. Perception study

- _perception_study_data/_: Folder containing the data used for our perception study.
- _joint_contrastive/triad2_results.csv_: Results of the perception study.
- _joint_contrastive/fica_unanimous.txt_: Results of the perception study from _Qian, L., Figueroa, C. & Skantze, G. (2025). Representation of perceived prosodic similarity of conversational feedback. In: Interspeech 2025_. Used for the **FiCa prosodic backchannel similarity task**.

## Datasets

- [FiCa](https://carolfigphd.github.io/FiCa-speech-dataset/)
- [Fisher English Training Speech Part 1 Transcripts](https://catalog.ldc.upenn.edu/LDC2004T19)
- [Fisher English Training Speech Part 1 Speech](https://catalog.ldc.upenn.edu/LDC2004S13)
- [Perception study files (combinations of _context + context transcript + backchannel options_)](https://github.com/qianlivia/perception_study/tree/master/triad2)

### Fine-tuned LLMs

- [Gemma 3 4B](https://huggingface.co/liviaq/gemma3-4b-fisher)
- [LLaMA 3.1 8B](https://huggingface.co/liviaq/llama3.1-8b-fisher)
- [Qwen2.5 7B](https://huggingface.co/liviaq/qwen2.5-7b-fisher)
- [Mistral 7B](https://huggingface.co/liviaq/mistral-7b-v0.3-fisher)

## Demo

- [Playable backchannels with visualization of the corresponding embeddings](https://feedbackembeddings.github.io/demo1/)

## Cite paper

- TODO
