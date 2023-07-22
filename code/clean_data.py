import pandas as pd
import os
import re

all_files = os.listdir('other/jokes')
all_files = [os.path.join('other/jokes', f) for f in all_files]

def clean():
    if 'other/jokes/cleaned_compiled_data' in all_files:
        if os.path.isfile('other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv'):
            print("Files already cleaned and compiled into final_cleaned_jokes.csv")
            df = pd.read_csv('other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv')

            # df.dropna(inplace=True)
            # df.drop_duplicates(subset=['joke'], inplace=True)
            df.drop('id', axis=1, inplace=True)
            df = df.reset_index()
            df.rename(columns={'index': 'id'}, inplace=True)

            for index, row in df.iterrows():
                if row['joke'].startswith('Q:'):
                    df.at[index, 'joke'] = row['joke'].split('A:')[0].replace('Q:', '').strip() + ' ' + row['joke'].split('A:')[1].strip()

                emoji_pattern = re.compile("["
                               u"\U0001F600-\U0001F64F"  # emoticons
                               u"\U0001F300-\U0001F5FF"  # symbols & pictographs
                               u"\U0001F680-\U0001F6FF"  # transport & map symbols
                               u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                               u"\U00002702-\U000027B0"  # Dingbats
                               u"\U000024C2-\U0001F251" 
                               "]+", flags=re.UNICODE)
                df.at[index, 'joke'] = emoji_pattern.sub(r'', row['joke'])


            df.to_csv('other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv', index=False)
            return

    final_file = pd.DataFrame()
    for file in all_files:
        if file == 'other/jokes/cleaned_compiled_data':
            continue

        try:
            df = pd.read_csv(file)
        except:
            continue
        df.columns = [x.lower() for x in df.columns]

        if list(df.columns) == ['id', 'joke']:
            print('Already cleaned')
            if final_file.empty:
                final_file = df
            else:
                final_file = pd.concat([final_file, df], ignore_index=True)
            continue

        if 'joketext' in df.columns or 'joke' in df.columns:
            if 'joketext' in df.columns:
                df.rename(columns={'joketext': 'joke'}, inplace=True)

        if 'question' in df.columns and 'answer' in df.columns:
            df['joke'] = str("Q: " + df['question'] + ', ' + "A: " + df['answer'])
            df.drop(['question', 'answer'], axis=1, inplace=True)

        df['joke'] = df['joke'].strip()
        df["joke"] = df["joke"].str.replace(r'\n+', ' ')
        df["joke"] = df["joke"].str.replace(r'\s+', ' ')
        for col in df.columns:
            if col == 'joke':
                continue
            else:
                df.drop(col, axis=1, inplace=True)

        df = df.reset_index()
        df.rename(columns={'index': 'id'}, inplace=True)

        df.to_csv(file, index=False)

    try:
        final_file.to_csv("other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv", index=False)
        clean()
    except:
        os.makedirs("other/jokes/cleaned_compiled_data")
        final_file.to_csv("other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv", index=False)
        clean()

def update():
    # update the categories of the jokes
    df = pd.read_csv('other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv')
    df['category'] = df['category'].str.lower()

    df.to_csv('other/jokes/cleaned_compiled_data/final_cleaned_jokes.csv', index=False)

    df = df[['category', 'joke']]
    df.columns = ['prompt', 'completion']

    df['prompt'] = df['prompt'].apply(lambda _: "English Joke")
    df['completion'] = df['completion'].apply(lambda x: x.replace("\"", "'"))
    df.to_json('other/jokes/cleaned_compiled_data/fine_tune_dataset.json', orient='records', lines=True)


if __name__ == '__main__':
    clean()
    update()