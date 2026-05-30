const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { Document, Packer, Paragraph } = require("docx");
const { PDFDocument } = require("pdf-lib");
const mammoth = require("mammoth");

const upload = multer({ storage: multer.memoryStorage() });

/* ---------------------------------------------------
   BASIC PDF → DOCX (NO LIBREOFFICE)
---------------------------------------------------- */
router.post("/pdf-to-word", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text || "";

    // Convert text → DOCX
    const paragraphs = extractedText
      .split("\n")
      .map((line) => new Paragraph(line));

    const doc = new Document({
      sections: [{ children: paragraphs }],
    });

    const docxBuffer = await Packer.toBuffer(doc);

    // Send DOCX back
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.file.originalname.replace(/\.pdf$/i, "")}.docx"`
    );

    res.send(docxBuffer);
  } catch (err) {
    console.error("PDF → DOCX ERROR:", err);
    res.status(500).send("Conversion failed");
  }
});

/* ---------------------------------------------------
   BASIC WORD → PDF (NO LIBREOFFICE)
---------------------------------------------------- */
router.post("/word-to-pdf", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    // Extract text from DOCX using Mammoth
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const extractedText = result.value || "";

    // Create a simple PDF using pdf-lib
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const wrappedText = extractedText.substring(0, 4000); // prevent overflow

    page.drawText(wrappedText, {
      x: 50,
      y: height - 50,
      size: 12,
      lineHeight: 14,
      maxWidth: width - 100,
    });

    const pdfBytes = await pdfDoc.save();

    // Send PDF back
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${req.file.originalname.replace(/\.(doc|docx)$/i, "")}.pdf"`
    );

    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error("WORD → PDF ERROR:", err);
    res.status(500).send("Conversion failed");
  }
});

module.exports = router;
