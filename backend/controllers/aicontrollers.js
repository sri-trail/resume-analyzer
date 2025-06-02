// backend/controllers/aicontrollers.js
const axios = require('axios');

/**
 * Send raw resume text to Hugging Face for analysis.
 * @param {string} text – The plain-text contents of the resume.
 * @returns {Promise<Object>} – The JSON response from Hugging Face.
 * @throws Will throw an error if the API request fails or no text is provided.
 */
async function analyzeText(text) {
  if (!text || !text.trim()) {
    throw new Error('No resume text provided');
  }

  const apiUrl = 'https://api-inference.huggingface.co/models/distilbert-base-uncased';

  try {
    const response = await axios.post(
      apiUrl,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error.response?.data || error.message);
    throw new Error('Failed to analyze text via Hugging Face API');
  }
}

module.exports = { analyzeText };
