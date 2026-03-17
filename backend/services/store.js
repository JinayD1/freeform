/**
 * In-memory store for listings (hackathon demo).
 * Key: listing_id, Value: { listing_id, title, description, price, created_at }
 */
const listings = new Map();

function saveListing(listing) {
  const id = listing.listing_id || String(Date.now());
  const record = {
    listing_id: id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    created_at: new Date().toISOString(),
  };
  listings.set(id, record);
  return record;
}

function getListing(id) {
  return listings.get(id) || null;
}

function getAllListings() {
  return Array.from(listings.values());
}

module.exports = {
  saveListing,
  getListing,
  getAllListings,
};
