// backend/aiClient.js
require("dotenv").config();
console.log("AI CLIENT KEY:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------------------------------------------------------
// 1) NEW analyzeResume() — matches Dashboard fields
// ---------------------------------------------------------
async function analyzeResume(text) {
  const prompt = `
You are an ATS resume analyzer.

Return ONLY valid JSON with these fields:

{
  "matchScore": number,
  "missingKeywords": string[],
  "presentKeywords": string[],
  "experienceAlignment": {
    "summary": string,
    "details": [
      { "section": string, "score": number }
    ]
  },
  "improvedSummary": string,
  "improvedBullets": string[],
  "recommendations": string[]
}

Resume text:
${text}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You analyze resumes and return structured JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("AI Error:", error);

    return {
      matchScore: 0,
      missingKeywords: [],
      presentKeywords: [],
      experienceAlignment: { summary: "", details: [] },
      improvedSummary: "",
      improvedBullets: [],
      recommendations: []
    };
  }
}

// ---------------------------------------------------------
// 2) compareResumeToJob()
// ---------------------------------------------------------
async function compareResumeToJob(resumeText, jobDescription) {
  try {
    const prompt = `
You are an ATS and hiring expert. Compare the following resume and job description.

Return ONLY valid JSON with these fields:
{
  "matchScore": number,
  "missingKeywords": [],
  "missingSkills": [],
  "presentKeywords": [],
  "experienceAlignment": {
    "summary": "",
    "details": [{ "section": string, "score": number }]
  },
  "improvedSummary": "",
  "improvedBullets": [],
  "recommendations": [],
  "jobKeywords": {
    "hardSkills": [],
    "softSkills": [],
    "tools": [],
    "verbs": [],
    "seniority": [],
    "domain": [],
    "certifications": [],
    "experience": []
  }
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert ATS and technical recruiter." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("AI Compare Error:", error);
    return {
      matchScore: 0,
      missingKeywords: [],
      missingSkills: [],
      presentKeywords: [],
      experienceAlignment: { summary: "", details: [] },
      improvedSummary: "",
      improvedBullets: [],
      recommendations: [],
      jobKeywords: {
        hardSkills: [],
        softSkills: [],
        tools: [],
        verbs: [],
        seniority: [],
        domain: [],
        certifications: [],
        experience: []
      }
    };
  }
}

// ---------------------------------------------------------
// 3) generateTailoredResume()
// ---------------------------------------------------------
async function generateTailoredResume(resumeText, jobDescription) {
  try {
    const prompt = `
Rewrite the following resume so that it is perfectly tailored to the job description.

Return ONLY valid JSON:

{
  "tailoredResume": string
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You rewrite resumes for ATS optimization." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("Tailored Resume Error:", error);
    return { tailoredResume: "Failed to generate tailored resume." };
  }
}

// ---------------------------------------------------------
// 4) generateCoverLetter()
// ---------------------------------------------------------
async function generateCoverLetter(resumeText, jobDescription) {
  try {
    const prompt = `
Write a professional, ATS-friendly cover letter tailored to the job description.

Return ONLY valid JSON:

{
  "coverLetter": string
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You write tailored cover letters for job applications." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("Cover Letter Error:", error);
    return { coverLetter: "Failed to generate cover letter." };
  }
}

// ---------------------------------------------------------
// EXPORTS
// ---------------------------------------------------------
module.exports = {
  analyzeResume,
  compareResumeToJob,
  generateTailoredResume,
  generateCoverLetter,
};
