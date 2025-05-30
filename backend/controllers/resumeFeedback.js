// backend/routes/resumeFeedback.js

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { analyzeText } = require('../controllers/aicontrollers');

// Use memory storage for quick PDF buffer handling
const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

/**
 * POST /api/analyze
 * Expects multipart/form-data with a 'resume' file field (PDF/DOCX).
 * Parses the PDF, extracts text, and sends it to the AI analysis.
 */
router.post(
  '/analyze',
  upload.single('resume'),
  async (req, res) => {
    try {
      // Ensure a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Parse PDF buffer (or plain text if DOCX/other)
      const data = await pdfParse(req.file.buffer);
      const text = data.text || '';

      // Send extracted text to AI analysis controller
      const result = await analyzeText(text);

      // Return the AI analysis result
      return res.json(result);
    } catch (err) {
      console.error('Error in /api/analyze route:', err);
      return res.status(500).json({ error: err.message || 'Analysis failed' });
    }
  }
);

module.exports = router;
