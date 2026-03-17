const axios = require('axios');

const BROWSER_USE_BASE = 'https://api.browser-use.com/api/v2';

/**
 * Check if Browser Use API is configured.
 */
function isBrowserUseConfigured() {
  const key = process.env.BROWSER_USE_API_KEY;
  return Boolean(key && key.trim() && !key.includes('your_'));
}

/**
 * Build a natural-language task for creating a Facebook Marketplace listing.
 * @param {{ title: string, description: string, price: number, imageUrl?: string }} payload
 * @returns {string}
 */
function buildFacebookMarketplaceTask(payload) {
  const { title, description, price, imageUrl } = payload;
  const priceStr = typeof price === 'number' ? `$${price}` : `$${Number(price) || 0}`;

  let task = `Go to Facebook Marketplace and create a new listing.

1. Open https://www.facebook.com/marketplace/create/item in the browser.
2. If prompted, sign in to Facebook (use the session if already logged in).
3. Create a new listing with these exact details:
   - Title: ${title}
   - Price: ${priceStr}
   - Description: ${description}
4. If the form has a category or condition field, choose the most relevant option.
5. For the photo: if an image is already available in the session or you can use a placeholder, add it; otherwise leave the photo step for the user to complete manually.
6. Proceed through the form and submit/publish the listing when all required fields are filled.
7. Confirm when the listing has been submitted or is ready for review.`;

  if (imageUrl && imageUrl.startsWith('http')) {
    task += `\n\nOptional: If the platform allows pasting an image URL, use this image for the listing: ${imageUrl}.`;
  }

  return task;
}

/**
 * Create and run a Browser Use task to publish a listing to Facebook Marketplace.
 * @param {{ title: string, description: string, price: number, imageUrl?: string }} payload
 * @returns {Promise<{ taskId: string, sessionId: string, status: string }>}
 */
async function runFacebookMarketplaceTask(payload) {
  const apiKey = process.env.BROWSER_USE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('BROWSER_USE_API_KEY is not set. Add it to your .env file.');
  }

  const task = buildFacebookMarketplaceTask(payload);

  const response = await axios.post(
    `${BROWSER_USE_BASE}/tasks`,
    { task },
    {
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
      validateStatus: (status) => status === 202 || status === 200,
    }
  );

  const taskId = response.data?.taskId ?? response.data?.id;
  const sessionId = response.data?.sessionId;

  if (!taskId) {
    throw new Error('Browser Use API did not return a task ID');
  }

  return {
    taskId,
    sessionId: sessionId || null,
    status: 'started',
  };
}

/**
 * Get status of a Browser Use task (optional, for polling from frontend).
 * @param {string} taskId
 * @returns {Promise<{ status: string, output?: string }>}
 */
async function getTaskStatus(taskId) {
  const apiKey = process.env.BROWSER_USE_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('BROWSER_USE_API_KEY is not set');
  }

  const response = await axios.get(`${BROWSER_USE_BASE}/tasks/${taskId}`, {
    headers: { 'x-api-key': apiKey },
    timeout: 10000,
  });

  return {
    status: response.data?.status ?? 'unknown',
    output: response.data?.output,
  };
}

module.exports = {
  isBrowserUseConfigured,
  runFacebookMarketplaceTask,
  getTaskStatus,
};
