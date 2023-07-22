import torch
import torch.nn as nn
import torch.optim as optim
import random
import pandas as pd
import json

# pd = pd.read_csv('../other/jokes/jester_items.csv')
# training_data = pd['joke'].tolist()

# reading the jokes from the json file
with open('../other/jokes/cleaned_compiled_data/fine_tune_dataset.json') as f:
    f = f.read()
    data = json.loads(f)

# data = pd.read_csv("../other/jokes/trainingData(jokes).csv")
# data = data['Joke'].tolist()[:len(data['Joke'].tolist())//2]

training_data = []

for joke in data:
    training_data.append(joke)

print("setting vocab")
vocab = set(' '.join(training_data).split())

print("mapping words to indices")
word_to_idx = {word: idx for idx, word in enumerate(vocab)}
idx_to_word = {idx: word for idx, word in enumerate(vocab)}

# Convert the training data into sequences of indices
data = []
for joke in training_data:
    data.append([word_to_idx[word] for word in joke.split()])

print("data", len(data))

# Define the PyTorch model
class JokeGenerator(nn.Module):
    def __init__(self, vocab_size, embedding_dim, hidden_dim):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embedding_dim)
        self.rnn = nn.GRU(embedding_dim, hidden_dim, batch_first=True)
        self.fc = nn.Linear(hidden_dim, vocab_size)
    
    def forward(self, x, hidden):
        x = self.embedding(x)
        out, hidden = self.rnn(x, hidden)
        out = self.fc(out)
        return out, hidden

# Define the hyperparameters
vocab_size = len(vocab)
embedding_dim = 64
hidden_dim = 128
learning_rate = 0.1
num_epochs = 4

# Instantiate the PyTorch model and the loss function
print("instantiating model and loss function")
model = JokeGenerator(vocab_size, embedding_dim, hidden_dim)
criterion = nn.CrossEntropyLoss()

# Define the optimizer
optimizer = optim.Adam(model.parameters(), lr=learning_rate)

print("training model")
for epoch in range(num_epochs):
    total_loss = 0
    hidden = None
    random.shuffle(data)
    for joke in data:
        joke = torch.tensor(joke).unsqueeze(0)
        target = joke[:, 1:]
        joke = joke[:, :-1]
        output, hidden = model(joke, hidden)
        print(output, hidden)
        loss = criterion(output.view(-1, vocab_size), target.reshape(-1))
        total_loss += loss.item()
        optimizer.zero_grad()
        loss.backward(retain_graph=True)
        optimizer.step()
        hidden = hidden.detach()
    print('Epoch [{}/{}], Loss: {:.4f}'.format(epoch+1, num_epochs, total_loss))

# Save the PyTorch model
print("saving model")
torch.save(model.state_dict(), 'joke_generator.pt')

# Generate new jokes using the PyTorch model
def generate_joke(model, length):
    model.eval()
    joke = [random.randint(0, len(vocab)-1)]
    hidden = None
    for i in range(length-1):
        input = torch.tensor(joke).unsqueeze(0)
        output, hidden = model(input, hidden)
        _, predicted = torch.max(output, dim=2)
        joke.extend(predicted.tolist()[0])
    return ' '.join([idx_to_word[idx] for idx in joke])


# Generate a new joke
length = 10
print("generating joke")

# generated_joke = generate_joke(model, length)
# print(generated_joke)
