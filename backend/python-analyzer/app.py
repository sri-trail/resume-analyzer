# backend/python-analyzer/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pdfminer.high_level import extract_text
import requests

app = Flask(__name__)
# 1) Enable CORS for your React origin
CORS(app, origins=["https://resume-analyzer-frontend.onrender.com"])

# 2) Where to store uploaded files temporarily (optional)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# 3) Your Hugging Face model endpoint + token
HF_MODEL_URL = "https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528"
HF_TOKEN = os.environ.get("HUGGINGFACE_API_KEY")  # set this once in your system

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "OK"}), 200

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    # Expect multipart form‐data with a file field named "resume"
    if "resume" not in request.files:
        return jsonify({"error": "No file part"}), 400

    f = request.files["resume"]
    if f.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # 1) Extract text from the PDF stream
    try:
        text = extract_text(f.stream)
    except Exception:
        return jsonify({"error": "Failed to extract text"}), 500

    preview = text.strip()[:1000]  # send at most 1000 characters to HF

    # 2) Call Hugging Face’s DeepSeek endpoint
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json",
    }
    payload = {"inputs": f"You are a professional resume reviewer.\n\n{preview}"}

    try:
        resp = requests.post(HF_MODEL_URL, headers=headers, json=payload, timeout=60_000)
    except Exception as e:
        return jsonify({"error": "Model call failed", "details": str(e)}), 500

    if resp.status_code != 200:
        return jsonify({"error": "Model API error", "details": resp.text}), 500

    data = resp.json()
    # depending on HF output, “generated_text” might be in data[0] or top‐level
    if isinstance(data, list) and "generated_text" in data[0]:
        generated = data[0]["generated_text"]
    else:
        generated = data.get("generated_text", "No feedback available")

    return jsonify({
        "filename": f.filename,
        "preview": preview,
        "feedback": generated
    }), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
