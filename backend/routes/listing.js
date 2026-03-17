const express = require('express');
const router = express.Router();
const { buildListingPrompt, buildVisionListingPrompt, buildEtsySimulationPrompt } = require('../utils/promptBuilder');
const { generateWithGemini, generateWithGeminiVision, parseJsonFromResponse } = require('../services/gemini');
const { createListing } = require('../services/etsy');
const { runFacebookMarketplaceTask, getTaskStatus } = require('../services/browserUse');
const store = require('../services/store');

/** Random int in [min, max] for synthetic Etsy stats */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Synthetic fallback when Gemini is unavailable (e.g. 403) — for hackathon demo.
 */
function syntheticListing(name, condition, category) {
  const safeName = String(name || 'Item').trim() || 'Item';
  const price = 25 + Math.floor(Math.random() * 120);
  return {
    title: `${safeName} — ${condition}, ${category}`,
    description: `Handpicked ${safeName} in ${condition} condition. Perfect for collectors or everyday use. Listed in ${category}. Message with questions.`,
    tags: [safeName.toLowerCase(), condition.toLowerCase(), category.toLowerCase(), 'vintage', 'resale', 'unique'],
    price,
  };
}

/**
 * POST /generate-listing
 * Body: { name, condition, category [, imageBase64, imageMimeType ] }
 * If imageBase64 is provided, uses Gemini vision to recognize the product and generate an accurate listing.
 * Returns: { title, description, tags, price }
 */
router.post('/generate-listing', async (req, res) => {
  try {
    const { name, condition, category, imageBase64, imageMimeType } = req.body || {};
    if (!name || !condition || !category) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'condition', 'category'],
      });
    }

    const nameHint = String(name).trim() || undefined;
    const conditionHint = String(condition).trim() || undefined;
    const categoryHint = String(category).trim() || undefined;

    if (imageBase64 && typeof imageBase64 === 'string') {
      try {
        const prompt = buildVisionListingPrompt({
          nameHint,
          conditionHint,
          categoryHint,
        });
        const mime = imageMimeType || 'image/jpeg';
        const raw = await generateWithGeminiVision(prompt, imageBase64, mime);
        const parsed = parseJsonFromResponse(raw);
        const result = {
          title: parsed.title || '',
          description: parsed.description || '',
          tags: Array.isArray(parsed.tags) ? parsed.tags : [],
          price: typeof parsed.price === 'number' ? parsed.price : parseInt(parsed.price, 10) || 0,
        };
        return res.json(result);
      } catch (visionErr) {
        console.warn('generate-listing vision fallback to text:', visionErr.message);
        // Fall through to text-only below
      }
    }

    try {
      const prompt = buildListingPrompt({ name, condition, category });
      const raw = await generateWithGemini(prompt);
      const parsed = parseJsonFromResponse(raw);
      const result = {
        title: parsed.title || '',
        description: parsed.description || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        price: typeof parsed.price === 'number' ? parsed.price : parseInt(parsed.price, 10) || 0,
      };
      return res.json(result);
    } catch (geminiErr) {
      console.warn('generate-listing Gemini fallback:', geminiErr.message);
      const fallback = syntheticListing(name, condition, category);
      return res.json(fallback);
    }
  } catch (err) {
    console.error('generate-listing error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /create-listing
 * Body: { title, description, price }
 * Returns: { listing_id, status }
 */
router.post('/create-listing', async (req, res) => {
  try {
    const { title, description, price } = req.body || {};
    if (!title || description == null || price == null) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'price'],
      });
    }

    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const created = await createListing({ title, description, price: numPrice });
    store.saveListing({
      listing_id: created.listing_id,
      title,
      description,
      price: numPrice,
    });

    return res.json({
      listing_id: created.listing_id,
      status: created.status,
    });
  } catch (err) {
    console.error('create-listing error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /publish-facebook-marketplace
 * Uses Browser Use to automate creating a listing on Facebook Marketplace.
 * Body: { title, description, price [, imageUrl ] }
 * Returns: { taskId, sessionId, status } for polling optional GET /publish-facebook-marketplace/status/:taskId
 */
router.post('/publish-facebook-marketplace', async (req, res) => {
  try {
    const { title, description, price, imageUrl } = req.body || {};
    if (!title || description == null || price == null) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'description', 'price'],
      });
    }

    const numPrice = typeof price === 'number' ? price : parseFloat(price);
    if (Number.isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    const result = await runFacebookMarketplaceTask({
      title: String(title).trim(),
      description: String(description).trim(),
      price: numPrice,
      imageUrl: imageUrl ? String(imageUrl).trim() : undefined,
    });

    return res.json({
      taskId: result.taskId,
      sessionId: result.sessionId,
      status: result.status,
    });
  } catch (err) {
    console.error('publish-facebook-marketplace error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /publish-facebook-marketplace/status/:taskId
 * Poll Browser Use task status (optional).
 */
router.get('/publish-facebook-marketplace/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!taskId) {
      return res.status(400).json({ error: 'Missing taskId' });
    }
    const result = await getTaskStatus(taskId);
    return res.json(result);
  } catch (err) {
    console.error('publish-facebook-marketplace status error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * GET /listings (bonus: list in-memory listings)
 */
router.get('/listings', (req, res) => {
  const list = store.getAllListings();
  return res.json({ listings: list });
});

/**
 * POST /simulate-etsy-updates (demo: synthetic Etsy notifications)
 * Body: { listingTitle?: string }
 * Returns: { messages: string[] } — hardcoded + optional Gemini lines for chatbot
 */
router.post('/simulate-etsy-updates', async (req, res) => {
  try {
    const listingTitle = req.body?.listingTitle || 'Your listing';
    const views = rand(180, 420);
    const favorites = rand(8, 28);
    const cart = rand(3, 14);

    const hardcoded = [
      'Uploading to Etsy...',
      'Your listing is now live on Etsy!',
      `Until now, ${views} people have seen your listing.`,
      `${favorites} people have added this to their favorites.`,
      `${cart} people have this in their cart.`,
    ];

    try {
      const prompt = buildEtsySimulationPrompt({ listingTitle });
      const raw = await generateWithGemini(prompt);
      const lines = raw.split('\n').map(s => s.replace(/^[\d.-]\s*/, '').trim()).filter(Boolean);
      if (lines.length >= 2) {
        hardcoded.push(...lines.slice(0, 2));
      }
    } catch (_) {
      // Gemini optional; keep hardcoded only
    }

    return res.json({ messages: hardcoded });
  } catch (err) {
    console.error('simulate-etsy-updates error:', err.message);
    const views = rand(200, 400);
    const favorites = rand(10, 25);
    const cart = rand(5, 12);
    return res.json({
      messages: [
        'Uploading to Etsy...',
        'Your listing is now live on Etsy!',
        `Until now, ${views} people have seen your listing.`,
        `${favorites} people have added this to their favorites.`,
        `${cart} people have this in their cart.`,
      ],
    });
  }
});

module.exports = router;
