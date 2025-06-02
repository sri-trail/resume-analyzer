// backend/routes/resumeFeedback.js

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeText } = require('../controllers/aicontrollers');

const router = express.Router();

// Use memory storage for quick PDF buffer handling
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/analyze
 * Expects multipart/form-data with a 'resume' file field (PDF/DOCX).
 * Parses the PDF, extracts text, and sends it to the AI analysis.
 */
router.post('/api/analyze', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = await pdfParse(req.file.buffer);
    const text = data.text || '';

    // For now return filename and text preview
    return res.json({
      filename: req.file.originalname,
      preview: text.slice(0, 500) // Optional: limit preview size
    });
  } catch (err) {
    console.error('Error in /api/analyze route:', err);
    return res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

/**
 * POST /resume-feedback
 * Expects { text: 'resume text' } in the request body.
 * Sends the plain text to the AI controller for detailed feedback.
 */
router.post('/resume-feedback', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing or invalid resume text' });
    }

    const feedback = await analyzeText(text);
    return res.json({ feedback });
  } catch (err) {
    console.error('Error in /resume-feedback route:', err);
    return res.status(500).json({ error: err.message || 'AI feedback failed' });
  }
});

module.exports = router;
