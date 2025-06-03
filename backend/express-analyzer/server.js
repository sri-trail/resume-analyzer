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

// 1) Enable CORS
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.options('*', cors());

// 2) Parse JSON bodies (for future endpoints, if any)
app.use(express.json());

// 3) Ensure /uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 4) Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    cb(allowed.includes(ext) ? null : new Error('Only PDF/DOCX allowed'), allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// 5) Root route (health/check endpoint)
app.get('/', (_, res) => {
  return res.status(200).json({ status: 'OK' });
});

// 6) Health‐check route (optional, but useful if you point Render’s Health Check path to /api/test)
app.get('/api/test', (_, res) => {
  return res.status(200).json({ status: 'OK' });
});

// 7) /api/analyze (PDF→DeepSeek feedback)
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read PDF buffer and extract text
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000); // limit to first 1000 chars

    // Build prompt for DeepSeek
    const prompt = `You are a professional resume reviewer. Provide clear and constructive feedback on the following resume:\n\n${preview}`;

    // Call Hugging Face DeepSeek-R1-0528
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

    // Extract generated_text (model returns an array or object)
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

// 8) 404 handler
app.use((req, res) => {
  return res.status(404).json({ error: 'Endpoint not found' });
});

// 9) Global error handler
app.use((err, _, res, __) => {
  console.error('Server error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// 10) Start server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
