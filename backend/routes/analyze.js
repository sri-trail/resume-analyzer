const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const Tesseract = require("tesseract.js");

// ⭐ Multer MUST be defined here (not in server.js)
const upload = multer({ storage: multer.memoryStorage() });

// POST /analyze  (extract text from uploaded file)
router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file received" });
    }

    console.log("---- EXTRACT ROUTE HIT ----");

    const file = req.file;
    const mime = file.mimetype;
    let extractedText = "";

    // PDF
    if (mime === "application/pdf") {
      const data = await pdfParse(file.buffer);
      extractedText = data.text;
    }

    // DOCX
    else if (mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const result = await mammoth.extractRawText({ buffer: file.buffer });
      extractedText = result.value;
    }

    // DOC
    else if (mime === "application/msword") {
      extractedText = file.buffer.toString("utf8");
    }

    // TXT
    else if (mime === "text/plain") {
      extractedText = file.buffer.toString("utf8");
    }

    // JPG / PNG → OCR
    else if (mime === "image/jpeg" || mime === "image/png") {
      const result = await Tesseract.recognize(file.buffer, "eng");
      extractedText = result.data.text;
    }

    else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    return res.json({ extractedText });

  } catch (err) {
    console.error("Extract Error:", err);
    return res.status(500).json({ error: "Failed to extract text" });
  }
});

module.exports = router;
