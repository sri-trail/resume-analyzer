import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdfminer.high_level import extract_text

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Flask Resume Analyzer is running.'}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_resume():
    # Expecting multipart/form-data with key 'resume'
    if 'resume' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    f = request.files['resume']
    if f.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Save file (optional)
    # filepath = os.path.join(app.config['UPLOAD_FOLDER'], f.filename)
    # f.save(filepath)

    # Extract text
    try:
        text = extract_text(f.stream)
    except Exception:
        return jsonify({'error': 'Failed to extract text'}), 500

    # Return a simple preview + mock analysis
    preview = text[:200]
    return jsonify({'filename': f.filename, 'preview': preview}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
