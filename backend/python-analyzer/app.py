# backend/python-analyzer/app.py

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

# 1) Health endpoint at "/"
@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask Resume Analyzer is running.'}), 200

# 2) Actual analyze endpoint
@app.route('/analyze', methods=['POST'])
def analyze_resume():
    # Expecting multipart/form-data with key 'resume'
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    f = request.files['resume']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Extract text from PDF/DOCX
    try:
        text = extract_text(f.stream)
    except Exception:
        return jsonify({'error': 'Failed to extract text'}), 500

    # Take first 1000 chars as “preview”
    preview = text.strip()[:1000]

    # Prepare Hugging Face DeepSeek API request
    HF_TOKEN = os.environ.get('HUGGINGFACE_API_KEY', '').strip()
    HF_URL = 'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528'
    headers = {
        'Authorization': f'Bearer {HF_TOKEN}',
        'Content-Type': 'application/json',
    }

    try:
        hf_response = requests.post(HF_URL, headers=headers, json={"inputs": preview}, timeout=60)
    except Exception as e:
        return jsonify({'error': 'Hugging Face request failed', 'details': str(e)}), 500

    if hf_response.status_code != 200:
        return jsonify({'error': 'Model API call failed', 'details': hf_response.text}), 500

    data = hf_response.json()
    # extract generated_text if present
    if isinstance(data, list) and len(data) > 0 and 'generated_text' in data[0]:
        generated = data[0]['generated_text']
    elif isinstance(data, dict) and 'generated_text' in data:
        generated = data['generated_text']
    else:
        generated = 'No feedback available'

    return jsonify({
        'filename': f.filename,
        'preview': preview,
        'feedback': generated
    }), 200

# 3) /health (optional)
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Bind on 0.0.0.0 so Render can route traffic in
    app.run(host='0.0.0.0', port=port)
