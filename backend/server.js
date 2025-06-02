const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. CORS
app.use(cors({
  origin: 'https://resume-analyzer-frontend.onrender.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));
app.options('*', cors());

// 2. JSON
app.use(express.json());

// 3. Uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// 4. Multer
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ['.pdf', '.docx'].includes(ext);
    cb(ok ? null : new Error('Only PDF/DOCX allowed'), ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// 5. OpenAI config
const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

// 6. Health-check
app.get('/api/test', (_, res) => {
  res.json({ status: 'OK' });
});

// 7. Analyze resume and get AI feedback
app.post('/api/analyze', upload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const preview = text.trim().substring(0, 1000);

    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a professional resume reviewer.' },
        { role: 'user', content: `Here is a resume:\n\n${preview}\n\nProvide feedback on how to improve it.` }
      ],
      temperature: 0.7
    });

    const feedback = completion.data.choices[0].message.content;

    res.json({
      filename: req.file.originalname,
      preview,
      feedback
    });

  } catch (err) {
    console.error('Analysis failed:', err);
    res.status(500).json({ error: 'Analysis failed', details: err.message });
  }
});

// 8. Error handling
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));
app.use((err, _, res, __) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 9. Start server
app.listen(port, () => console.log(`🚀 Backend running on port ${port}`));
