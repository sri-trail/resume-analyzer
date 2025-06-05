const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const router = express.Router();

// Set up Multer storage
const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(['.pdf', '.docx'].includes(ext) ? null : new Error('Only PDF/DOCX allowed'), true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

// Health check
router.get('/test', (_, res) => {
  res.json({ status: 'OK' });
});

// Main analysis route
router.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000);

    const prompt = `You are a professional resume reviewer. Provide actionable and constructive feedback on this resume:\n\n${preview}`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const feedback = response.data?.[0]?.generated_text || 'No feedback generated';

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

module.exports = router;
