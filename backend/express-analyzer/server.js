// backend/express-analyzer/server.js

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1) Ensure we reply 200 OK at "/" so Render’s health‐check passes immediately
app.get('/', (_req, res) => {
  return res.status(200).json({ status: 'OK' });
});

// 2) Enable CORS (must come before any routes that need it)
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.options('*', cors());

// 3) JSON parsing middleware
app.use(express.json());

// 4) Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 5) Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    cb(allowed.includes(ext) ? null : new Error('Only PDF/DOCX allowed'), allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// 6) Optional “health” endpoint (you can point Render’s “Health Check Path” to /api/test instead of “/” if you like)
app.get('/api/test', (_req, res) => {
  return res.status(200).json({ status: 'OK' });
});

// 7) Main resume‐analysis endpoint
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // 7a) Read the uploaded file from disk
    const buffer = await fs.promises.readFile(req.file.path);
    // 7b) Extract plain‐text
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000);

    // 7c) Build the prompt for DeepSeek
    const prompt = `You are a professional resume reviewer. Provide clear and constructive feedback on the following resume:\n\n${preview}`;

    // 7d) Call Hugging Face DeepSeek-R1-0528
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
        timeout: 60000,
      }
    );

    // 7e) Extract “generated_text” (it may come back as an array)
    let feedback = 'No feedback generated';
    if (Array.isArray(hfResponse.data) && hfResponse.data[0]?.generated_text) {
      feedback = hfResponse.data[0].generated_text;
    } else if (hfResponse.data.generated_text) {
      feedback = hfResponse.data.generated_text;
    }

    return res.status(200).json({
      filename: req.file.originalname,
      preview,
      feedback,
    });
  } catch (err) {
    console.error('Analysis failed:', err.message);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// 8) Fallback 404 for any other route
app.use((req, res) => {
  return res.status(404).json({ error: 'Endpoint not found' });
});

// 9) Global error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// 10) Start listening
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
