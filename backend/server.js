// backend/server.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1) CORS: allow ONLY your deployed frontend
app.use(cors({
  origin: 'https://resume-analyzer-frontend.onrender.com',
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
// 1A) Preflight support
app.options('*', cors());

// 2) JSON body parsing
app.use(express.json());

// 3) Make sure uploads directory exists
const uploadDir = path.join(__dirname,'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir,{recursive:true});

// 4) Multer setup
const storage = multer.diskStorage({
  destination: (_,__,cb) => cb(null, uploadDir),
  filename: (_,file,cb) => cb(null, `${Date.now()}_${file.originalname}`)
});
const upload = multer({
  storage,
  fileFilter: (_,file,cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok = ['.pdf','.docx'].includes(ext);
    cb(ok ? null : new Error('Only PDF/DOCX allowed'), ok);
  },
  limits: { fileSize: 10*1024*1024 }
});

// 5) Health-check
app.get('/api/test', (req, res) => {
  res.json({ status: 'OK' });
});

// 6) Analyze endpoint
app.post('/api/analyze', upload.single('resume'), async (req,res) => {
  if (!req.file) return res.status(400).json({ error:'No file uploaded' });
  try {
    const buffer = await fs.promises.readFile(req.file.path);
    const { text } = await pdfParse(buffer);
    const resume = text.trim();
    if (!resume) return res.status(400).json({ error:'Empty resume content' });

    // forward to your Flask analyzer (make sure FLASK_URL is set to your deployed Flask service)
    const flaskURL = process.env.FLASK_URL;
    const { data } = await axios.post(
      flaskURL,
      { resume },
      { headers:{ 'Content-Type':'application/json' }, timeout:10000 }
    );
    return res.json(data);

  } catch (err) {
    console.error('Analysis failed:', err.response?.data||err.message);
    return res.status(500).json({ error:'Analysis failed', details: err.response?.data||err.message });
  }
});

// 7) 404 + global error handlers
app.use((req,res) => res.status(404).json({ error:'Endpoint not found' }));
app.use((err,_,res,__) => {
  console.error('Server error:',err);
  res.status(500).json({ error:'Internal server error' });
});

// 8) Start
app.listen(port, () => console.log(`🚀 Backend listening on port ${port}`));
