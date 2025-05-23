# backend/python-analyzer/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import io, re, os, logging
from pdfminer.high_level import extract_text

app = Flask(__name__)
CORS(app)

# Silence PDFMiner debug/warning logs
logging.getLogger('pdfminer').setLevel(logging.ERROR)

# Skill‐regex (as before)
SKILL_REGEX = re.compile(
    r'\b(?:Python|Java|JavaScript|C\+\+|React|Node\.js|SQL|HTML|CSS|Git|AWS|Docker|'
    r'Kubernetes|TensorFlow|Pandas|Numpy|Matplotlib|Machine Learning|Data Analysis|'
    r'Communication|Leadership|Teamwork)\b',
    re.IGNORECASE
)
def extract_skills(text):
    found = SKILL_REGEX.findall(text)
    return sorted({s.title() for s in found})

@app.route('/analyze', methods=['POST'])
def analyze_resume():
    data = request.get_json()
    if not data or 'resume' not in data:
        return jsonify({'error': 'Missing "resume" field in JSON body'}), 400

    resume_text = data['resume'].strip()
    if not resume_text:
        return jsonify({'error': 'Empty resume text provided'}), 400

    # Summary: first 250 chars
    summary = resume_text[:250].rstrip() + ('...' if len(resume_text) > 250 else '')

    # Skills & Recommendations
    skills = extract_skills(resume_text) or ["No specific skills detected."]
    recommendations = [
        "Add measurable achievements to your experience section.",
        "Include a clear professional summary at the top.",
        "Use keywords from the job description relevant to your target role."
    ]

    return jsonify({
        'summary': summary,
        'skills': skills,
        'recommendations': recommendations
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'OK'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port)
