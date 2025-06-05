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

// 1) Enable CORS (allow only our frontend)
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.options('*', cors());

// 2) JSON-body parsing (for safety, though we only expect multipart)
app.use(express.json());

// 3) Ensure /uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 4) Multer setup for file upload (PDF/DOCX, 10 MB max)
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// 5) Health-check endpoint (Render will hit this)
app.get('/health', (_, res) => {
  res.json({ status: 'OK' });
});

// 6) Root GET (to quickly check if server is alive)
app.get('/', (_, res) => {
  res.send('Express Resume Analyzer is up.');
});

// 7) Analyze endpoint (listen on exactly “/analyze”)
app.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // (a) Read the file from disk
    const buffer = await fs.promises.readFile(req.file.path);
    // (b) Extract text from PDF
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000); // limit to 1000 chars

    // (c) Build a prompt for DeepSeek
    const prompt = `You are a professional resume reviewer. Provide clear, constructive feedback on this resume:\n\n${preview}`;

    // (d) Call Hugging Face DeepSeek endpoint
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60_000, // 60 sec
      }
    );

    // (e) Extract generated_text
    let feedback = 'No feedback generated';
    const data = response.data;
    if (Array.isArray(data) && data[0]?.generated_text) {
      feedback = data[0].generated_text;
    } else if (data.generated_text) {
      feedback = data.generated_text;
    }

    return res.json({
      filename: req.file.originalname,
      preview,
      feedback,
    });
  } catch (err) {
    console.error('Analysis failed:', err.response?.data || err.message);
    return res
      .status(500)
      .json({ error: 'Analysis failed', details: err.response?.data || err.message });
  }
});

// 8) 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 9) Global error handler
app.use((err, _, res, __) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 10) Start server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
