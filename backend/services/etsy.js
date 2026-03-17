const axios = require('axios');

const ETSY_API_BASE = 'https://openapi.etsy.com/v3';

/**
 * Check if Etsy API is configured.
 */
function isEtsyConfigured() {
  const key = process.env.ETSY_API_KEY;
  const token = process.env.ETSY_TOKEN;
  return Boolean(key && token && key !== 'optional' && token !== 'optional');
}

/**
 * Create a listing on Etsy (real API call when configured, otherwise mock).
 * @param {{ title: string, description: string, price: number }} payload
 * @returns {Promise<{ listing_id: string, status: string }>}
 */
async function createListing(payload) {
  const { title, description, price } = payload;

  if (!isEtsyConfigured()) {
    // Mock: simulate success with fake ID
    const mockId = String(Math.floor(10000 + Math.random() * 90000));
    return {
      listing_id: mockId,
      status: 'created',
      _mock: true,
    };
  }

  // Real Etsy Open API v3 scaffold
  // Docs: https://developers.etsy.com/documentation/reference#operation/createListing
  const shopId = process.env.ETSY_SHOP_ID || 'YOUR_SHOP_ID';
  const url = `${ETSY_API_BASE}/application/shops/${shopId}/listings`;

  const response = await axios.post(
    url,
    {
      title,
      description,
      price: Number(price),
      quantity: 1,
      type: 'listing',
      state: 'draft', // or 'active' when ready to publish
    },
    {
      headers: {
        'x-api-key': process.env.ETSY_API_KEY,
        Authorization: `Bearer ${process.env.ETSY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  const listingId = response.data?.listing_id?.toString() || response.data?.results?.[0]?.listing_id?.toString();
  if (!listingId) {
    throw new Error('Etsy API did not return a listing_id');
  }

  return {
    listing_id: listingId,
    status: 'created',
  };
}

module.exports = {
  isEtsyConfigured,
  createListing,
};
