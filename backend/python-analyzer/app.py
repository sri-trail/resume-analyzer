import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdfminer.high_level import extract_text
import requests

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528'
HUGGINGFACE_TOKEN = os.environ.get('HUGGINGFACE_API_KEY_TOKEN')  # Set this token in your environment

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask Resume Analyzer is running.'}), 200

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    f = request.files['resume']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        text = extract_text(f.stream)
    except Exception:
        return jsonify({'error': 'Failed to extract text'}), 500

    preview = text.strip()[:1000]  # Limit input to 1000 chars

    headers = {
        'Authorization': f'Bearer {HUGGINGFACE_TOKEN}',
        'Content-Type': 'application/json'
    }

    try:
        response = requests.post(HUGGINGFACE_API_URL, headers=headers, json={"inputs": preview})
        if response.status_code != 200:
            return jsonify({'error': 'Model API call failed', 'details': response.text}), 500

        data = response.json()
        generated = data[0]['generated_text'] if isinstance(data, list) and 'generated_text' in data[0] else 'No feedback available'

        return jsonify({
            'filename': f.filename,
            'preview': preview,
            'feedback': generated
        }), 200

    except Exception as e:
        return jsonify({'error': 'Hugging Face request failed', 'details': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
