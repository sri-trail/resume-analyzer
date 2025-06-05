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

// ✅ 1) Enable CORS for frontend
app.use(cors({
  origin: 'https://resume-analyzer-frontend.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.options('*', cors());

// ✅ 2) Parse incoming JSON
app.use(express.json());

// ✅ 3) Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ 4) Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, ['.pdf', '.docx'].includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ✅ 5) Health-check
app.get('/health', (_, res) => res.json({ status: 'OK' }));

// ✅ 6) Simple alive check
app.get('/', (_, res) => res.send('Express Resume Analyzer is up.'));

// ✅ 7) Main /analyze route
app.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000);

    const prompt = `You are a professional resume reviewer. Provide clear, constructive feedback on this resume:\n\n${preview}`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

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

// ✅ 8) Catch-all route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ✅ 9) Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ 10) Start the server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
