const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1) Enable CORS for your frontend
app.use(
  cors({
    origin: 'https://resume-analyzer-frontend.onrender.com',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);
app.options('*', cors());

// 2) Parse JSON bodies (not strictly needed for /analyze, but kept for consistency)
app.use(express.json());

// 3) Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 4) Multer configuration (PDF/DOCX, 10 MB max)
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(['.pdf', '.docx'].includes(ext) ? null : new Error('Only PDF/DOCX allowed'), [
      '.pdf',
      '.docx',
    ].includes(ext));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// 5) Health‐check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'OK' });
});

// 6) Simple “alive” check
app.get('/', (_, res) => {
  res.send('Express Resume Analyzer is up.');
});

// 7) /analyze route: extract text and return *basic* feedback
app.post('/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // (a) Read PDF buffer
    const buffer = await fs.promises.readFile(req.file.path);
    // (b) Extract plain text from PDF
    const { text } = await pdfParse(buffer);

    // (c) Create a preview (first 500 chars)
    const preview = text.trim().substring(0, 500);

    // (d) **BASIC FEEDBACK** (hardcoded, no external API)
    // For example: count words & suggest adding a summary if too short.
    const wordCount = text.split(/\s+/).filter((w) => w.length > 0).length;
    let feedback = `Your resume is ${wordCount} words long. `;
    if (wordCount < 100) {
      feedback +=
        'Consider adding more detail about your experience (e.g. project descriptions, quantifiable results).';
    } else {
      feedback += 'Looks like you have a solid amount of content—ensure you highlight your key achievements.';
    }

    // (e) Return JSON with filename, preview, and this basic feedback
    return res.json({
      filename: req.file.originalname,
      preview,
      feedback,
    });
  } catch (err) {
    console.error('Analysis failed:', err);
    return res.status(500).json({ error: 'Analysis failed', details: err.message });
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
