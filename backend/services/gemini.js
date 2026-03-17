const axios = require('axios');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Call Gemini API with a text prompt. Returns raw text response.
 * @param {string} prompt - Full prompt text
 * @returns {Promise<string>} Generated text
 */
async function generateWithGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('GEMINI_API_KEY is not set or invalid in .env');
  }

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 8192,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000,
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned no text in response');
    }
    return text.trim();
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error(
        'Gemini API 403: Check that your API key is valid and that the Generative Language API is enabled at https://aistudio.google.com/apikey'
      );
    }
    if (err.response?.status === 401) {
      throw new Error('Gemini API 401: Invalid API key');
    }
    if (err.response?.data?.error?.message) {
      throw new Error(`Gemini API: ${err.response.data.error.message}`);
    }
    throw err;
  }
}

/**
 * Call Gemini with an image + text prompt (vision). Use for accurate product recognition.
 * @param {string} prompt - Text prompt
 * @param {string} imageBase64 - Base64-encoded image (no data URL prefix)
 * @param {string} mimeType - e.g. "image/jpeg", "image/png"
 * @returns {Promise<string>} Generated text
 */
async function generateWithGeminiVision(prompt, imageBase64, mimeType = 'image/jpeg') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_key_here') {
    throw new Error('GEMINI_API_KEY is not set or invalid in .env');
  }

  const parts = [
    {
      inline_data: {
        mime_type: mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ];

  try {
    const response = await axios.post(
      `${GEMINI_URL}?key=${apiKey}`,
      {
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 45000,
      }
    );

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini returned no text in response');
    }
    return text.trim();
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error(
        'Gemini API 403: Check that your API key is valid and that the Generative Language API is enabled at https://aistudio.google.com/apikey'
      );
    }
    if (err.response?.status === 401) {
      throw new Error('Gemini API 401: Invalid API key');
    }
    if (err.response?.data?.error?.message) {
      throw new Error(`Gemini API: ${err.response.data.error.message}`);
    }
    throw err;
  }
}

/**
 * Parse JSON from model output (may be wrapped in markdown code blocks).
 */
function parseJsonFromResponse(text) {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
}

module.exports = {
  generateWithGemini,
  generateWithGeminiVision,
  parseJsonFromResponse,
};
