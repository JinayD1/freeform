# Freeform Next.js Frame

This is a **very minimal** Next.js + React application frame.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the dev server:

   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

4. Start building by editing `app/page.tsx`.

## Deploying the backend to Vercel

The Express backend in `backend/` is set up for Vercel serverless deployment.

1. **Install Vercel CLI** (optional, for local preview):
   ```bash
   npm i -g vercel
   ```

2. **Deploy** from the repo root:
   - In the [Vercel dashboard](https://vercel.com/new), import your repo.
   - Set **Root Directory** to `backend` (so Vercel uses `backend/package.json` and `backend/vercel.json`).
   - Add **Environment Variables** (Settings → Environment Variables) for the backend:
     - `GEMINI_API_KEY` (required for listing generation)
     - `BROWSER_USE_API_KEY` (for Facebook Marketplace automation)
     - `ETSY_API_KEY`, `ETSY_TOKEN`, `ETSY_SHOP_ID` (optional)
   - Deploy. Your API will be at `https://<your-project>.vercel.app`.

3. **Point the frontend at the deployed API** by setting your backend URL in the frontend (e.g. `NEXT_PUBLIC_API_URL=https://<your-project>.vercel.app` in the root `.env` or `.env.local`).

