const express = require('express');
const router = express.Router();
const { buildNegotiationPrompt } = require('../utils/promptBuilder');
const { generateWithGemini, parseJsonFromResponse } = require('../services/gemini');

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function syntheticEtsyChatReply({ prompt, listingTitle }) {
  const text = String(prompt || '').toLowerCase();
  const title = listingTitle || 'your listing';

  if (/(how many|views|traffic|impressions|seen)/.test(text)) {
    const views = rand(180, 520);
    const favorites = rand(6, 34);
    const carts = rand(1, 18);
    return `For “${title}”: ${views} views so far, ${favorites} favorites, and ${carts} cart adds. Want me to suggest a small SEO tweak to increase clicks?`;
  }

  if (/(inbox|messages|responses|dm|buyer)/.test(text)) {
    const offer = rand(5, 25) * 5;
    const eta = rand(3, 15);
    return `I checked your inbox — 1 new message: “Hi! Is this still available? Would you take $${offer}?” I can draft a reply and set an auto-follow-up in ${eta} minutes if they don’t respond.`;
  }

  if (/(upload|publishing|post|etsy|live)/.test(text)) {
    const pct = rand(70, 98);
    return `Publishing now… ${pct}% complete. Your listing will be live in a moment. After it’s live, I’ll monitor views/favorites and notify you if engagement spikes.`;
  }

  if (/(price|pricing|too high|too low|recommend)/.test(text)) {
    const delta = rand(3, 12);
    return `Your price looks competitive for the category. If you want more traction, try dropping it by $${delta} or adding “free shipping” (even a small shipping discount can boost conversion).`;
  }

  return `Got it. For “${title}”, I can help with views, inbox checks, pricing, SEO tags, and buyer negotiation. Try: “how many views does my product have?” or “check inbox for any responses”.`;
}

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

/**
 * POST /simulate-chat (demo: synthetic Etsy assistant replies)
 * Body: { prompt: string, listingTitle?: string }
 * Returns: { reply: string }
 */
router.post('/simulate-chat', async (req, res) => {
  const { prompt, listingTitle } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'Missing "prompt" in body' });

  // Hardcoded synthetic response for demo (no real Etsy calls).
  // If Gemini works, you can swap this to generateWithGemini later.
  const reply = syntheticEtsyChatReply({ prompt, listingTitle });
  return res.json({ reply });
});

module.exports = router;
