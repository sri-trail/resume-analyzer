// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");

// ROUTES
const analyzeRoute = require("./routes/analyze");
const analyzeResumeRoute = require("./routes/analyzeResume");
const compareRoute = require("./routes/compare");
const tailorResumeRoute = require("./routes/tailorResume");
const coverLetterRoute = require("./routes/coverLetter");
const convertRoute = require("./routes/convert");

const app = express();

// Log every request
app.use((req, res, next) => {
  console.log("INCOMING REQUEST:", req.method, req.url);
  next();
});

// PORT
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

// JSON parser
app.use(express.json());

// Multer (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// ------------------------------
// HEALTH CHECK
// ------------------------------
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// ------------------------------
// ROOT ROUTE
// ------------------------------
app.get("/", (req, res) => {
  res.send("AI Resume Analyzer Backend Running");
});

// ------------------------------
// ROUTES
// ------------------------------
app.use("/compare", compareRoute);
app.use("/tailor-resume", tailorResumeRoute);
app.use("/cover-letter", coverLetterRoute);

// Extract text from resume (PDF/DOC/DOCX/TXT/IMG)
app.use("/analyze", upload.single("resume"), analyzeRoute);

// ATS analysis route (JSON only)
app.use("/analyze-resume", analyzeResumeRoute);

// ⭐ FIXED — NOW IN THE RIGHT PLACE
app.use("/convert", convertRoute);

// ------------------------------
// START SERVER
// ------------------------------
app.listen(port, () => {
  console.log(`🚀 Backend running on port ${port}`);
});
