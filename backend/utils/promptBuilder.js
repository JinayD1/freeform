/**
 * Prompt builders for Gemini AI - Etsy listing & negotiation
 */

/**
 * Build prompt for generating Etsy listing content (text-only).
 */
function buildListingPrompt({ name, condition, category }) {
  return `You are an expert Etsy seller and copywriter. Generate a professional Etsy listing for the following item.

Item details:
- Name: ${name}
- Condition: ${condition}
- Category: ${category}

Requirements:
- Use a warm, professional Etsy tone. Be descriptive and trustworthy.
- Optimize for search: include relevant keywords buyers would search for.
- Title: max 140 characters, keyword-rich, no ALL CAPS.
- Description: 2-4 short paragraphs, highlight condition, key features, and why it's valuable.
- Tags: exactly 13 tags as an array, lowercase, relevant to the item and category (Etsy allows 13 tags).
- Price: suggest a fair market price in USD as a number (integer), based on condition and category.

Respond with ONLY valid JSON, no markdown or extra text. Use this exact structure:
{"title":"...","description":"...","tags":["tag1","tag2",...],"price":65}`;
}

/**
 * Build prompt for vision-based listing: look at the image and generate accurate Etsy listing.
 * User hints (name, condition, category) are optional overrides; the image is the source of truth.
 */
function buildVisionListingPrompt({ nameHint, conditionHint, categoryHint }) {
  const hints = [nameHint, conditionHint, categoryHint].filter(Boolean).join(', ');
  return `Look at this product image. Identify exactly what the item is (brand, product name, type — e.g. "Coca-Cola classic red soda can", "Vintage Sony Walkman"). Assess its apparent condition and the best category for resale.

${hints ? `Seller provided these hints (use only if they fit the image): ${hints}.` : ''}

Generate a professional Etsy resale listing from what you SEE in the image. Be accurate and specific: if it's a Coke can, say so; if you see branding, include it.

Requirements:
- Title: max 140 characters, specific to the item (include brand/product name if visible), keyword-rich.
- Description: 2-4 short paragraphs describing what the item is, condition, and why a buyer would want it. Reference visible details (design, label, wear).
- Tags: 10-13 tags as a JSON array, lowercase (e.g. ["coca-cola", "soda can", "collectible", "vintage", "can"]).
- Price: fair resale price in USD as an integer (e.g. collectible can $5-15, vintage electronics $30-80).

Respond with ONLY valid JSON, no markdown or extra text:
{"title":"...","description":"...","tags":["tag1","tag2",...],"price":42}`;
}

/**
 * Build prompt for buyer message intent + reply (negotiation agent).
 * Enforces min_price, polite tone, and intent detection.
 */
function buildNegotiationPrompt({ message, product }) {
  const { title, price, min_price } = product;
  const floor = min_price != null ? min_price : Math.round(price * 0.75);

  return `You are a friendly Etsy seller assistant. A buyer sent this message about the listing "${title}" (listed at $${price}, your minimum acceptable price is $${floor}).

Buyer message: "${message}"

Tasks:
1. Classify the buyer's intent into exactly one of: "negotiation", "shipping", "product_question", "availability", "other".
2. Write a short, polite reply (2-4 sentences). If they are negotiating price:
   - NEVER accept or suggest any price below $${floor}. You can go down to $${floor} but not lower.
   - Politely justify the price with brief market/condition reasoning.
   - If their offer is at or above $${floor}, you may accept or counter.
3. Keep the reply conversational and helpful.

Respond with ONLY valid JSON, no markdown or extra text. Use this exact structure:
{"intent":"negotiation","reply":"Your reply text here."}`;
}

/**
 * Build prompt for simulated Etsy status updates (demo/hackathon).
 * Returns 4 short, realistic Etsy-style notification messages with varied numbers.
 */
function buildEtsySimulationPrompt({ listingTitle }) {
  return `You are simulating Etsy seller notifications for a demo. For the listing "${listingTitle}", generate exactly 4 short status messages that Etsy might show a seller. Use realistic but varied numbers (views, favorites, cart adds). Format: one message per line, no numbering or bullets. Examples of style:
- "Your listing is now live on Etsy!"
- "Until now, 312 people have seen your listing."
- "18 people have added this to their favorites."
- "7 people have this in their cart."
Generate 4 different messages in this style, with different numbers (views between 150-450, favorites 5-25, cart 2-15). Output ONLY the 4 lines, nothing else.`;
}

module.exports = {
  buildListingPrompt,
  buildVisionListingPrompt,
  buildNegotiationPrompt,
  buildEtsySimulationPrompt,
};
