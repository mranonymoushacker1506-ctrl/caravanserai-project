# app.py - Final Version for Deployment

from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import pipeline, set_seed
from waitress import serve # NEW: Import Waitress

# --- AI Model Setup ---
mind = pipeline('text-generation', model='microsoft/DialoGPT-small')
set_seed(42)

# --- Character and Memory Setup ---
personality_prompt = """
The following is a conversation with Tariq, a Sogdian spice merchant...
""" # (rest of your prompt is the same)
conversation_history = [personality_prompt]

# --- Server Setup ---
app = Flask(__name__)
CORS(app)

@app.route('/ask', methods=['POST'])
def ask_character():
    # (all the code for this function is the same)
    user_input = request.json.get('message')
    if not user_input:
        return jsonify({"error": "No message provided"}), 400
    conversation_history.append(f"Traveler: {user_input}")
    full_conversation = "\n".join(conversation_history) + "\nTariq:"
    response = mind(full_conversation, num_return_sequences=1, pad_token_id=mind.tokenizer.eos_token_id)
    generated_text = response[0]['generated_text']
    last_response_start = generated_text.rfind("Tariq:")
    tariq_response = generated_text[last_response_start + len("Tariq:"):].strip()
    if user_input in tariq_response:
        tariq_response = tariq_response.replace(user_input, "").strip()
    conversation_history.append(f"Tariq: {tariq_response}")
    return jsonify({"response": tariq_response})

# --- Run the App ---
# NEW: We now use Waitress to run the app when on Windows
if __name__ == '__main__':
    print("Starting server with Waitress...")
    serve(app, host='0.0.0.0', port=5000)