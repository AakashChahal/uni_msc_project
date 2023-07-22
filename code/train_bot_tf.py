import tensorflow as tf
import pandas as pd
import numpy as np


# Load the joke dataset
df = pd.read_csv("../other/jokes/trainingData(jokes).csv")
jokes = df["Joke"].values

# Create a tokenizer object and fit on the joke dataset
tokenizer = tf.keras.preprocessing.text.Tokenizer()
tokenizer.fit_on_texts(jokes)

# Convert text to sequences of integers
sequences = tokenizer.texts_to_sequences(jokes)

# Pad sequences to a fixed length
max_length = max([len(seq) for seq in sequences])
padded_sequences = tf.keras.preprocessing.sequence.pad_sequences(
    sequences, maxlen=max_length)

# Train the language model
model = tf.keras.Sequential()
model.add(tf.keras.layers.Embedding(len(tokenizer.word_index) + 1, 128))
model.add(tf.keras.layers.LSTM(64))
model.add(tf.keras.layers.Dense(
    len(tokenizer.word_index) + 1, activation='softmax'))
model.compile(loss='categorical_crossentropy',
              optimizer='adam', metrics=['accuracy'])
model.fit(padded_sequences, padded_sequences, epochs=10)

# Generate new jokes
for i in range(10):
    joke = []
    for _ in range(10):
        token = np.random.randint(len(tokenizer.word_index) + 1)
        joke.append(token)
    joke = tokenizer.sequences_to_texts([joke])[0]
    print(joke)

# Generate a joke
input_sequence = np.random.randint(len(tokenizer.word_index) + 1, size=(1, 10))
joke = model.predict(input_sequence).argmax(axis=1)
joke_text = tokenizer.sequences_to_texts([joke])[0]
print(joke_text)
