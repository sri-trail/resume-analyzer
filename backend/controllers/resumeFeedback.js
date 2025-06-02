const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { analyzeText } = require('../controllers/aicontrollers');

const router = express.Router();

// Memory storage + size limit for resume upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB max
});

/**
 * POST /api/analyze
 * Handles resume upload (PDF/DOCX), extracts text, and returns AI feedback.
 */
router.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const mimetype = req.file.mimetype;

    // Only allow PDF and DOCX
    if (
      mimetype !== 'application/pdf' &&
      mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return res.status(400).json({ error: 'Unsupported file type. Upload PDF or DOCX only.' });
    }

    let text = '';

    // Extract text based on file type
    if (mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      text = data.text || '';
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = result.value || '';
    }

    // Analyze extracted text
    const feedback = await analyzeText(text);

    return res.json({
      filename: req.file.originalname,
      preview: text.slice(0, 500),
      feedback
    });
  } catch (err) {
    console.error('Error in /api/analyze route:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

module.exports = router;
