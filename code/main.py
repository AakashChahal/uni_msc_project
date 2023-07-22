from random import random
from flask import Flask, jsonify, request
from flask_cors import CORS
import urllib
from tweet import create_prompt
from joke_generator import generate_joke_and_response_chat
from dotenv import load_dotenv
import base64
import json
load_dotenv()

# initialize Flask
app = Flask(__name__)
CORS(app)


def random_joke_response():
    prompt = create_prompt()
    joke = generate_joke_and_response_chat(prompt)
    joke = joke["choices"][0]["message"]["content"]

    return joke


def respond_to_user(prompt, context=None):
    if context:
        message = f"Context: {context}\nPrompt: {prompt}"
    else:
        message = prompt
    print(message)
    response = generate_joke_and_response_chat(message)
    response = response["choices"][0]["message"]["content"]

    return response


@app.route("/joke")
def get_joke():
    joke = random_joke_response()
    return jsonify({"joke": joke})


@app.route("/response/<prompt>/<context>")
def get_response(prompt, context):
    print("prompt: ", prompt)
    print("context: ", context)
    if context == "":
        decoded_context = {}
    else:
        context_decoded = base64.b64decode(context)
        context_unquoted = urllib.parse.unquote(context_decoded)
        decoded_context = json.loads(context_unquoted)
    if not decoded_context:
        response = respond_to_user(prompt)
    else:
        response = respond_to_user(prompt, decoded_context)
    return jsonify({"response": response})


@app.route("/voice-chat/<prompt>")
def get_voice_chat(prompt):
    response = generate_joke_and_response_chat(prompt)
    response = response["choices"][0]["message"]["content"]
    return jsonify({"response": response})


@app.errorhandler(404)
def page_not_found(e):
    return jsonify({"response": "Sorry, I am having some issue processing the request, please try again."}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
    # app.run(debug=True)
