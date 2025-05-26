// backend/controllers/aicontrollers.js
const axios = require('axios');

const analyzeResume = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No resume text provided' });
    }

    // Replace with your actual Hugging Face API endpoint and token
    const apiUrl = 'https://api-inference.huggingface.co/models/distilbert-base-uncased';
    const response = await axios.post(
      apiUrl,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        },
      }
    );

    return res.json({ result: response.data });
  } catch (err) {
    console.error('Resume analysis error:', err.message);
    res.status(500).json({ error: 'Failed to analyze resume' });
  }
};

module.exports = { analyzeResume };
