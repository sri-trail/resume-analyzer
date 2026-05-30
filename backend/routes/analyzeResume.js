// backend/routes/analyzeResume.js
const express = require("express");
const router = express.Router();

// Import the analyzeResume function from aiClient.js
const { analyzeResume } = require("../aiClient"); 
// If your aiClient.js is inside /services, use:
// const { analyzeResume } = require("../services/aiClient");

router.post("/", async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ error: "resumeText is required" });
    }

    // Call the AI function to analyze the resume
    const analysis = await analyzeResume(resumeText);

    // Return the ATS analysis JSON to the frontend
    return res.json(analysis);

  } catch (err) {
    console.error("Analyze Resume Error:", err);
    return res.status(500).json({ error: "Failed to analyze resume" });
  }
});

// ⭐ THIS MUST BE THE LAST LINE
module.exports = router;
