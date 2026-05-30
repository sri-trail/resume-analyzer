// frontend/src/api.js

// ------------------------------
// Analyze Resume (PDF Upload)
// ------------------------------
export async function analyzeResume(formData) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/analyze`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Failed to analyze resume");
    }

    return await response.json();
  } catch (error) {
    console.error("ANALYZE API ERROR:", error);
    return null;
  }
}

// ------------------------------
// Compare Resume with Job Description
// ------------------------------
export async function compareResumeToJob(resumeText, jobDescription) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobDescription
      })
    });

    if (!response.ok) {
      throw new Error("Failed to compare resume and job description");
    }

    return await response.json();

  } catch (error) {
    console.error("COMPARE API ERROR:", error);
    return null;
  }
}

// ------------------------------
// Generate Tailored Resume 
// ------------------------------
export async function generateTailoredResume(resumeText, jobDescription) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/tailor-resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resumeText,
        jobDescription
      })
    });

    if (!response.ok) {
      throw new Error("Failed to generate tailored resume");
    }

    return await response.json();

  } catch (error) {
    console.error("TAILORED RESUME API ERROR:", error);
    return null;
  }
}
export async function generateCoverLetter(resumeText, jobDescription) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/cover-letter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText, jobDescription })
    });

    if (!response.ok) {
      throw new Error("Failed to generate cover letter");
    }

    return await response.json();

  } catch (error) {
    console.error("COVER LETTER API ERROR:", error);
    return null;
  }
}

