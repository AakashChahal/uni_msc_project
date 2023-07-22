from pprint import pprint
from tweepy.asynchronous import AsyncStreamingClient
from joke_generator import generate_joke_and_response, generate_joke_and_response_chat
import tweepy
import time
import random
import threading
import asyncio
import os
from dotenv import load_dotenv
import numpy as np
load_dotenv()


class MyStreamListener(tweepy.StreamingClient):
    """
    This class will listen to the twitter stream and will call a function depending on the event

    Args:
        tweepy.StreamingClient: The class from which this class inherits

    Returns:
        None
    """

    def on_connect(self):
        print("Stream Connected and Running")

    def on_tweet(self, data):
        print("Tweet received")
        print("\n-------------------------\n")
        print("Liking the tweet...")

        like_tweets(data["id"])

        if "RT" in data["text"]:
            print("Retweet detected, ignoring the reply")

        else:
            print("Replying to the tweet...")
            reply_to_tweet(int(data["id"]), str(data["text"]))

    def on_matching_rules(self, matching_rules):
        print("Matching Rules:", matching_rules)

    def on_error(self, status_code):
        print("Error received:", status_code)
        return False

    def on_timeout(self):
        print("Timeout...")
        return False

    def on_status(self, status):
        print("Status:", status)

    def on_exception(self, exception):
        print("Exception:", exception)
        return False

    # def on_data(self, data):
    #     print("Data:", data)
    #     return False


def create_prompt(topic=None):
    """
    This function will create a prompt for the joke generator

    Args:
        topic (str, optional): The topic about which the joke should be generated. Defaults to None.

    Returns:
        str: The prompt to be used to generate the joke/response
    """

    joke_styles = ['Knock-Knock Joke', 'One Liner Joke', 'A Pun', 'Yo Mama Joke',
                   'Dad Joke', "Sattire", "Absurd Humour", "Observational Humor"]
    joke_style = joke_styles[np.random.randint(len(joke_styles))]

    categories = ['Technology', 'Science', 'Politics', 'Sports', 'Animals', 'AI', 'Programming', 'Technology', 'Science and math', 'Geography',
                  'History', 'Relationships', 'Travel', 'Work', 'School', 'Money', 'Fashion', 'Health and fitness', 'Weather', 'Holidays', 'Books', 'Art', 'Music']

    if topic:
        prompt = joke_style + " about " + topic
    else:
        category = categories[np.random.randint(len(categories))]
        prompt = joke_style + " about " + category

    return prompt


def post_tweet(prompt=None, lang=None):
    """
    This function will generate a new joke and then post it on twitter

    Args:
        prompt (str, optional): The prompt to be used to generate the joke/response. Defaults to None.
        lang (str, optional): The language in which the joke should be generated. Defaults to None.

    Returns:
        None
    """
    if not prompt:
        prompt = create_prompt()

    if not lang:
        prompt = prompt + " in English"
    else:
        prompt = prompt + " in " + lang

    print("Generating a new joke...")

    joke = generate_joke_and_response(prompt)
    print(type(joke))
    print("Joke generated!")
    print("\n-------------------------\n")

    joke = joke["choices"][0]["message"]["content"]

    print("Posting the tweet...")

    client.create_tweet(text=joke)

    print("Tweet posted!")


def get_trending_topic_tweet():
    """
    This function will get the trending topics from twitter in the UK and then post a tweet/joke about it

    Args:
        None

    Returns:
        str: The name of the trending topic
    """

    print("Getting trending topics...")
    min_lat_uk, max_lat_uk = 49.87, 60.92
    min_long_uk, max_long_uk = -8.65, 1.77
    lat = random.uniform(min_lat_uk, max_lat_uk)
    long = random.uniform(min_long_uk, max_long_uk)

    trends_location = api.closest_trends(lat, long)
    woeid = trends_location[0]["woeid"]

    trending_topics = api.get_place_trends(woeid)

    print("Trending topics found!")
    print("\n-------------------------\n")

    max_vol = 0
    trending_topic = None

    for topic in trending_topics[0]["trends"]:
        if topic["tweet_volume"]:
            if topic["tweet_volume"] > max_vol:
                max_vol = topic["tweet_volume"]
                trending_topic = topic

    print("Trending topic: ", trending_topic["name"])
    print("Tweet volume: ", trending_topic["tweet_volume"])

    print("Posting a tweet about the trending topic...")
    prompt = create_prompt(trending_topic["name"])
    post_tweet(prompt=prompt)


def like_tweets(tweet_id: int = None):
    """
    This function will search for tweets that mention the account and then like them

    Args:
        tweet_id (int, optional): The id of the tweet to be liked. Defaults to None.

    Returns:
        str: The text of the tweet that was liked
    """
    if not tweet_id:
        print("Searching for tweets that mention the account")
        tweets = client.search_recent_tweets(
            query="@_aakashchahal", max_results=10)
        print("Tweets found!")
        print("\n-------------------------\n")

        for tweet in tweets[0]:
            print("Liking tweet...")
            client.like(tweet["id"])
            print("Tweet: ", tweet["id"], " liked!")

        return "Liked 10 latest tweets"

    client.like(tweet_id)
    print("Liked tweet: " + client.get_tweet(tweet_id).data.text)


def reply_to_tweet(tweet_id: int = None, text: str = None):
    """
    This function will reply to a tweet

    Args:
        tweet_id (int): The id of the tweet to be replied to
        text (str): The text of the tweet to be replied to

    Returns:
        None
    """

    if not tweet_id:
        print("Searching for tweets that memntion the account in their tweet")
        tweets = client.search_recent_tweets(
            query="@_aakashchahal", max_results=10)
        print("Tweets found!")
        print("\n-------------------------\n")

        liked_tweets = client.get_liked_tweets(client_id)[0]

        for tweet in tweets[0]:
            if tweet in liked_tweets:
                print("Tweet already liked, ignoring the reply")
                continue

            print("Not liked, liking and replying to the tweet...")
            like_tweets(tweet["id"])
            reply_to_tweet(tweet["id"], tweet["text"])
        return

    response = generate_joke_and_response(text)
    response = response["choices"][0]["message"]["content"]

    print("Response generated!")
    print("\n-------------------------\n")

    print("Replying to the tweet...")

    client.create_tweet(text=response, in_reply_to_tweet_id=tweet_id)

    print("Tweet replied!")


def reply_to_direct_messages():
    """
    This function will search for direct messages and then reply to them

    Returns:
        None
    """
    print("Going through the direct messages...")
    chats = {}

    users = [user.id for user in client.get_direct_message_events(
        expansions="sender_id").includes['users'] if user.id != client_id]

    dm_conversations = [str(str(client_id) + "-" + str(user))
                        for user in users]

    for conversation in dm_conversations:
        print(conversation)
        print(conversation.split("-")[1]+"-"+conversation.split("-")[0])
        if conversation not in chats:
            chats[conversation] = {
                "not_replied_messages": [],
                "bots_last_message": "",
                "last_sender": None
            }

        print("Going through the conversation with: ", conversation)
        direct_messages = client.get_direct_message_events(
            dm_conversation_id=conversation).data
        if not direct_messages:
            direct_messages = client.get_direct_message_events(
                dm_conversation_id=conversation.split("-")[1]+"-"+conversation.split("-")[0]).data
            print(direct_messages)
            if not direct_messages:
                continue

        time.sleep(3)
        print(direct_messages)
        print("-------------------------")
        for message in direct_messages[::-1]:
            message_details = api.get_direct_message(
                id=message.id)
            sender_id = message_details.message_create["sender_id"]
            message_text = message_details.message_create["message_data"]["text"]
            if int(sender_id) == int(client_id):
                chats[conversation]["last_sender"] = "bot"
                chats[conversation]["not_replied_messages"] = []
                chats[conversation]["bots_last_message"] = message_text
            else:
                print(message_text)
                chats[conversation]["last_sender"] = "user"
                chats[conversation]["not_replied_messages"].append(
                    message_text)

        if chats[conversation]["last_sender"] == "user":
            print("Replying to the user...")
            response = generate_joke_and_response_chat(
                " ".join(chats[conversation]["not_replied_messages"]))
            response = response["choices"][0]["message"]["content"]
            print(response)
            client.create_direct_message(
                dm_conversation_id=conversation, text=response)
            print("Replied to the user!")


def follow_users(id: int = None):
    """
    This function will either search for users that follow the account and then follow them or follow a specific user

    Args:
        id (int, optional): The id of the user to be followed. Defaults to None.

    Returns:
        None
    """

    if not id:
        print("Searching for users that follow the account")
        users = client.get_users_following(id=client_id)
        print("Users found!")
        print("\n-------------------------\n")

        count = 0

        for user in users[0]:
            print("Following user...")
            client.follow(user["id"])
            count += 1
            print("User: ", user["id"], " followed!")
            if count == 15:
                print("Sleeping for 20 seconds...")
                time.sleep(20)
                count = 0

        return

    client.follow(id)


def follow_liking_users():
    """
    This function will find the users that have liked the account's tweets

    Returns:
        None
    """

    print("Searching for users that have liked the account's tweets...")
    tweets = client.get_users_tweets(id=client_id).data[0:2]

    for tweet in tweets:
        print("Getting the users that have liked the tweet...")
        users = client.get_liking_users(id=tweet.id).data
        if users:
            print("Users found!")
            print("\n-------------------------\n")

            count = 0
            for user in users:
                print(user)
                print("Following user...")
                client.follow(user.id)
                print("User: ", user["id"], " followed!")
                print("Sleeping for 20 seconds...")
                time.sleep(20)


def retweet():
    """
    This function searches the timeline for tweets that mention the account and then retweets them

    Returns:
        None
    """
    print("Searching for tweets that mention the account...")
    tweets = client.get_users_mentions(client_id)
    if tweets[0]:
        print("Tweets found!")
        print("\n-------------------------\n")
        print("Making sure the tweets aren't replies to older tweets...")

        for tweet in tweets[0]:
            temp = client.get_tweet(
                tweet.id, expansions="referenced_tweets.id")

            if temp.includes:
                print("Tweet is a reply, ignoring the retweet")

            else:
                print("Tweet is not a reply, retweeting...")
                client.retweet(tweet.id)
                print("Tweet retweeted!")

        return

    print("No tweets found!")


def start_stream():
    """
    This function will start the stream and then add rules to it

    Returns:
        None
    """
    stream = MyStreamListener(bearer_token=bearer_token)
    rule_reply = tweepy.StreamRule(value="to:_aakashchahal is:reply")
    rule_retweets = tweepy.StreamRule(value="retweets_of:_aakashchahal")
    rule_quote = tweepy.StreamRule(value="#JokeBot is:quote")
    rules = [rule_reply, rule_retweets, rule_quote]
    stream.add_rules(rules)
    stream.filter()


def handle_retweets_replies():
    """
    This function will search for tweets that match the specified rules (that is retweets, replies and quote tweets) and then like them and reply to them
    it replaces the filter stream api 

    Returns:
        None
    """
    # api = tweepy.API(auth)
    rule_reply = "to:_aakashchahal is:reply"
    rule_retweets = "retweets_of:_aakashchahal"
    rule_quote = "#JokeBot is:quote"
    query = f"({rule_retweets}) OR ({rule_reply}) OR ({rule_quote})"
    print("Searching for retweets, quote tweets and replies...")
    flag = False
    tweets = client.search_recent_tweets(query=query)
    print(tweets)
    if tweets.data:
        for tweet in tweets.data:
            flag = True
            print("Tweet received")
            print("\n-------------------------\n")
            print("Liking the tweet...")

            like_tweets(tweet["id"])

            if "RT" in tweet["text"]:
                print("Retweet detected, ignoring the reply")

            else:
                print("Replying to the tweet...")
                reply_to_tweet(int(tweet["id"]), str(tweet["text"]))

    if not flag:
        print("No recent retweets, quote tweets or replies found!")
        print("\n-------------------------\n")


def main():
    """
    This function will call all the functions required to run the bot and perform all the tasks

    Returns:
        None
    """
    languages = ["English", "Mandarin", "Spanish", "French", "Hindi"]
    for language in languages:
        post_tweet(lang=language)
        time.sleep(20)

    get_trending_topic_tweet()
    print("Sleeping for 1 minute, to avoid rate limit...")
    time.sleep(60)
    handle_retweets_replies()
    print("Sleeping for 1 minute, to avoid rate limit...")
    time.sleep(60)
    retweet()
    print("Sleeping for 1 minute, to avoid rate limit...")
    time.sleep(60)
    follow_users()
    follow_liking_users()
    print("Sleeping for 1 minute, to avoid rate limit...")
    time.sleep(60)
    reply_to_direct_messages()
    print("All tasks completed!")


if __name__ == "__main__":
    # Twitter API Tokens
    consumer_key = os.getenv("CONSUMER_KEY")
    consumer_secret = os.getenv("CONSUMER_SECRET")
    access_token = os.getenv("ACCESS_TOKEN")
    access_token_secret = os.getenv("ACCESS_TOKEN_SECRET")
    bearer_token = os.getenv("BEARER_TOKEN")

    print("Twitter API Tokens Loaded")
    print("\n-------------------------\n")
    print("Authenticating with Twitter API")

    # Authenticate with Twitter API
    client = tweepy.Client(bearer_token=bearer_token, consumer_key=consumer_key,
                           consumer_secret=consumer_secret, access_token=access_token, access_token_secret=access_token_secret, wait_on_rate_limit=True)
    auth = tweepy.OAuth1UserHandler(
        consumer_key, consumer_secret, access_token, access_token_secret)
    api = tweepy.API(auth, wait_on_rate_limit=True)

    print("Authentication Successful")
    print("\n-------------------------\n")

    client_id = client.get_me().data.id
    main()
    # follow_liking_users()
