// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { analyzeResume } = require("./aiClient");

const app = express();

// Render provides PORT automatically
const port = process.env.PORT || 10000;

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://resume-analyzer-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
  })
);

app.use(express.json());

// Multer (memory storage only)
const upload = multer({ storage: multer.memoryStorage() });

// Health check (Render uses this)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Root route
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});

// Analyze resume
app.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No resume uploaded" });
    }

    // Extract text from PDF buffer
    const pdfData = await pdfParse(req.file.buffer);
    const text = pdfData.text;

    // AI analysis
    const analysis = await analyzeResume(text);
    if (!analysis) {
      return res.status(500).json({ error: "AI returned no data" });
    }

    res.json(analysis);
  } catch (error) {
    console.error("Server Error:", error.message);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

// SINGLE listen call (correct)
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
