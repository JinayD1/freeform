const express = require('express');
const router = express.Router();
const { buildNegotiationPrompt } = require('../utils/promptBuilder');
const { generateWithGemini, parseJsonFromResponse } = require('../services/gemini');

/**
 * POST /generate-reply
 * Body: { message, product: { title, price, min_price? } }
 * Returns: { reply, intent }
 */
router.post('/generate-reply', async (req, res) => {
  try {
    const { message, product } = req.body || {};
    if (!message || !product || !product.title || product.price == null) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['message', 'product (title, price)'],
      });
    }

    const prompt = buildNegotiationPrompt({ message, product });
    const raw = await generateWithGemini(prompt);
    const parsed = parseJsonFromResponse(raw);

    const intent = ['negotiation', 'shipping', 'product_question', 'availability', 'other'].includes(parsed.intent)
      ? parsed.intent
      : 'other';

    return res.json({
      reply: parsed.reply || 'Thanks for your message! I\'ll get back to you shortly.',
      intent,
    });
  } catch (err) {
    console.error('generate-reply error:', err.message);
    const status = err.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    return res.status(status).json({ error: err.message });
  }
});

/**
 * POST /webhook/message
 * Simulates Etsy incoming message: receive message, call negotiation AI, return reply.
 * Body: { message, product?: { title, price, min_price? } } or { message, listing_id } (product from store)
 */
router.post('/webhook/message', async (req, res) => {
  try {
    const { message, product: productBody, listing_id } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: 'Missing "message" in body' });
    }

    let product = productBody;
    if (!product && listing_id) {
      const store = require('../services/store');
      const listing = store.getListing(String(listing_id));
      if (listing) {
        product = {
          title: listing.title,
          price: listing.price,
          min_price: Math.round(listing.price * 0.75),
        };
      }
    }
    if (!product) {
      product = {
        title: 'Item',
        price: 50,
        min_price: 40,
      };
    }

    const prompt = buildNegotiationPrompt({ message, product });
    const raw = await generateWithGemini(prompt);
    const parsed = parseJsonFromResponse(raw);

    const intent = ['negotiation', 'shipping', 'product_question', 'availability', 'other'].includes(parsed.intent)
      ? parsed.intent
      : 'other';

    return res.json({
      reply: parsed.reply || 'Thanks for your message! I\'ll get back to you shortly.',
      intent,
    });
  } catch (err) {
    console.error('webhook/message error:', err.message);
    const status = err.message?.includes('GEMINI_API_KEY') ? 503 : 500;
    return res.status(status).json({ error: err.message });
  }
});

module.exports = router;
