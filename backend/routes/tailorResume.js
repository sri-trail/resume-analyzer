const express = require("express");
const router = express.Router();
const { generateTailoredResume } = require("../aiClient");

router.post("/", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });
    }

    const result = await generateTailoredResume(resumeText, jobDescription);
    res.json(result);

  } catch (error) {
    console.error("Tailor Resume Route Error:", error);
    res.status(500).json({ error: "Failed to generate tailored resume" });
  }
});

module.exports = router;
