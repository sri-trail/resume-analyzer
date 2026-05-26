// backend/aiClient.js
require("dotenv").config();
console.log("AI CLIENT KEY:", process.env.OPENAI_API_KEY ? "LOADED" : "MISSING");

const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeResume(text) {
  const prompt = `
You are an ATS and recruiter-grade resume evaluator.

Analyze the resume and return ONLY valid JSON with this exact structure:

{
  "overall_score": number (1-10),
  "ats_score": number (0-100),
  "keyword_match_score": number (0-100),
  "experience_quality_score": number (0-100),
  "formatting_score": number (0-100),
  "clarity_score": number (0-100),
  "summary": string,
  "strengths": string[],
  "weaknesses": string[],
  "missing_keywords": string[],
  "missing_sections": string[],
  "formatting_issues": string[],
  "suggested_bullets": string[]
}

Scoring rules:
- ATS Score: formatting, parseability, section headers, date consistency
- Keyword Match: match resume skills to job description keywords (infer common keywords)
- Experience Quality: action verbs, metrics, impact, clarity
- Formatting Score: spacing, alignment, grammar, readability
- Clarity Score: concise writing, no fluff, no repetition

Return ONLY JSON. No explanation.
Resume text:
${text}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You analyze resumes and return structured JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = response.choices[0].message.content;

    console.log("RAW AI RESPONSE:", raw);

    // Safe JSON parsing
    try {
      return JSON.parse(raw);
    } catch (jsonError) {
      console.error("JSON Parse Error:", jsonError);
      return null;
    }

  } catch (error) {
    console.error("AI Error:", error.response?.data || error.message);
    console.error("FULL AI ERROR:", error);

    return {
      overall_score: 0,
      ats_score: 0,
      keyword_match_score: 0,
      experience_quality_score: 0,
      formatting_score: 0,
      clarity_score: 0,
      summary: "AI analysis failed.",
      strengths: [],
      weaknesses: [],
      missing_keywords: [],
      missing_sections: [],
      formatting_issues: [],
      suggested_bullets: []
    };
  }
}

module.exports = { analyzeResume };
