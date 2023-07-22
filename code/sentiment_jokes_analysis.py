import json
from nltk.sentiment.vader import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

with open('../other/jokes/cleaned_compiled_data/fine_tune_dataset.json') as f:
    f = f.read()
    data = json.loads(f)

jokes = data['completion']
# print(jokes)

for joke in jokes:
    scores = analyzer.polarity_scores(joke)
    print(joke)
    print(scores)
