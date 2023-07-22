import pandas as pd
from textblob import TextBlob

def test_jokes(jokes):
    df = pd.read_csv(jokes)

    df['polarity'] = df['joke'].apply(lambda x: TextBlob(x).sentiment.polarity)
    df['subjectivity'] = df['joke'].apply(lambda x: TextBlob(x).sentiment.subjectivity)

    for index, row in df.iterrows():
        if row['polarity'] < 0 and row['subjectivity'] == 0:
            print('Negative', row['polarity'], "and ", row['subjectivity'], row['joke'])

def main():
    jokes = '../other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv'
    test_jokes(jokes)

if __name__ == '__main__':
    main()