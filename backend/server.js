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

// ✅ 1. Enable CORS before routes
app.use(cors({
  origin: 'https://resume-analyzer-frontend.onrender.com',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.options('*', cors());

// ✅ 2. Body parsing middleware
app.use(express.json());

// ✅ 3. Ensure /uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ✅ 4. Multer config
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    cb(allowed.includes(ext) ? null : new Error('Only PDF or DOCX files allowed'), allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ✅ 5. Health check
app.get('/api/test', (_, res) => {
  res.json({ status: 'Backend running' });
});

// ✅ 6. Resume analysis route
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000);

    const prompt = `You are a professional resume reviewer. Provide clear and constructive feedback on the following resume:\n\n${preview}`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        timeout: 60000
      }
    );

    const feedback = response.data?.generated_text || response.data?.[0]?.generated_text || 'No feedback generated';

    res.json({
      filename: req.file.originalname,
      preview,
      feedback
    });

  } catch (error) {
    console.error('Resume analysis error:', error.message);
    res.status(500).json({ error: 'Resume analysis failed', details: error.message });
  }
});

// ✅ 7. Fallback route
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// ✅ 8. Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// ✅ 9. Start server
app.listen(port, () => {
  console.log(`🚀 Server listening on port ${port}`);
});
