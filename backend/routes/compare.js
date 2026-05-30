const express = require("express");
const router = express.Router();
const { compareResumeToJob } = require("../aiClient");

router.post("/", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: "Missing resumeText or jobDescription" });
    }

    const result = await compareResumeToJob(resumeText, jobDescription);
    res.json(result);

  } catch (error) {
    console.error("Compare Route Error:", error);
    res.status(500).json({ error: "Failed to compare resume and job description" });
  }
});

module.exports = router;
