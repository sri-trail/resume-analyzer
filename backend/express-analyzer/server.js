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

// 1. Enable CORS (allow only your frontend origin)
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true
  })
);
app.options('*', cors());

// 2. JSON body parsing
app.use(express.json());

// 3. Health‐check endpoint at /health
app.get('/api/test', (_, res) => {
  res.json({ status: 'OK' })
});

// 4. Ensure /uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 5. Configure Multer for PDF/DOCX upload
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.docx'];
    cb(allowed.includes(ext) ? null : new Error('Only PDF/DOCX allowed'), allowed.includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// 6. Test endpoint at /api/test (optional)
app.get('/api/test', (_req, res) => {
  res.json({ status: 'OK' });
});

// 7. Resume analysis endpoint at /api/analyze
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read and extract text from uploaded PDF
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000); // limit input length

    // Prepare prompt for DeepSeek-R1
    const prompt = `You are a professional resume reviewer. Provide clear, constructive feedback on the following resume:\n\n${preview}`;

    // Call Hugging Face’s DeepSeek API
    const hfResponse = await axios.post(
      'https://api-inference.huggingface.co/models/deepseek-ai/DeepSeek-R1-0528',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
        },
        timeout: 60000 // 60 seconds
      }
    );

    // Extract generated feedback (adjust based on model’s output format)
   const feedback =
      response.data.generated_text ||
      response.data[0]?.generated_text ||
      'No feedback generated'

    return res.json({
      filename: req.file.originalname,
      preview,
      feedback
    });
  } catch (err) {
    console.error('Analysis failed:', err.message);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
  
  }
});

// 8. 404 handler for any other route
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 9. Global error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 10. Start server
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
