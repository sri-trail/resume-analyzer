# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # allow all origins; adjust if you need to lock down in prod

@app.route('/')
def home():
    return {'message': 'Backend is live'}

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
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], f.filename)
    f.save(filepath)

    # Read a preview (first 200 chars) for testing
    try:
        content = f.read().decode('utf-8', errors='ignore')
    except:
        content = '<binary data>'
    preview = content[:200]

    return jsonify({
        'filename': f.filename,
        'preview': preview
    }), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
    app.run()