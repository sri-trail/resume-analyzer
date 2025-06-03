// server.js
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

// 1. Enable CORS (before any routes)
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.options('*', cors());

// 2. JSON body parsing
app.use(express.json());

// 3. Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 4. Multer setup for file uploads
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

// 5. Health‐check endpoint
app.get('/api/test', (_, res) => {
  res.json({ status: 'OK' });
});

// 6. /api/analyze endpoint
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    // a) Read the uploaded file into a buffer
    const buffer = await fs.promises.readFile(req.file.path);
    // b) Extract text from PDF
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000); // limit to 1000 chars

    // c) Build the prompt for DeepSeek
    const prompt = `You are a professional resume reviewer. Provide clear and constructive feedback on the following resume:\n\n${preview}`;

    // d) Call Hugging Face DeepSeek‐R1 endpoint
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        timeout: 60000, // 60 seconds
      }
    );

    // e) Pull out generated_text (DeepSeek returns an array or single object)
    const feedback =
      (Array.isArray(hfResponse.data) && hfResponse.data[0]?.generated_text) ||
      hfResponse.data.generated_text ||
      'No feedback generated';

    return res.json({
      filename: req.file.originalname,
      preview,
      feedback,
    });
  } catch (err) {
    console.error('Analysis failed:', err.message);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// 7. 404 handler (after all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 8. Global error handler (last)
app.use((err, _, res, __) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 9. Start listening on the specified port
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
