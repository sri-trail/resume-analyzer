const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; // ✅ Define port properly

// 1. Enable CORS (place before routes)
app.use(cors({
  origin: 'https://resume-analyzer-frontend.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());

// 2. Parse JSON
app.use(express.json());

// 3. Ensure /uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 4. Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    cb(allowed.includes(ext) ? null : new Error('Only PDF/DOCX allowed'), allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

// 5. Health check
app.get('/api/test', (_, res) => {
  res.json({ status: 'OK' });
});

// 6. Resume analysis endpoint
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
        headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` },
        timeout: 60000
      }
    );

    const feedback = response.data.generated_text || response.data[0]?.generated_text || 'No feedback generated';

    res.json({
      filename: req.file.originalname,
      preview,
      feedback
    });

  } catch (err) {
    console.error('Analysis failed:', err.message);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// 7. 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

// 8. Global Error Handler
app.use((err, _, res, __) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 9. Start server
app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
