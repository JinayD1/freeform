/**
 * AI Resale Agent – backend API base URL.
 * Backend runs on port 4000 (see backend/README.md).
 */
export const API_BASE =
  typeof window !== "undefined"
    ? "http://localhost:4000"
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const api = {
  health: () => fetch(`${API_BASE}/health`).then((r) => r.json()),
  generateListing: (body: { name: string; condition: string; category: string }) =>
    fetch(`${API_BASE}/generate-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  createListing: (body: { title: string; description: string; price: number }) =>
    fetch(`${API_BASE}/create-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  generateReply: (body: {
    message: string;
    product: { title: string; price: number; min_price?: number };
  }) =>
    fetch(`${API_BASE}/generate-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  webhookMessage: (body: { message: string; product?: object; listing_id?: string }) =>
    fetch(`${API_BASE}/webhook/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  listListings: () => fetch(`${API_BASE}/listings`).then((r) => r.json()),
  /** Demo: simulated Etsy status updates for chatbot (synthetic data) */
  simulateEtsyUpdates: (body: { listingTitle?: string }) =>
    fetch(`${API_BASE}/simulate-etsy-updates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    }).then((r) => r.json()),
};
