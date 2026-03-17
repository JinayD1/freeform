# AI Resale Agent – Dev & testing

## Run both services

Use **two terminals**.

### Terminal 1 – Backend (API)

```bash
cd backend
node server.js
```

- Runs at **http://localhost:4000** (or next free port if 4000 is in use).
- Check: open http://localhost:4000 or http://localhost:4000/health

### Terminal 2 – Next.js (website)

```bash
npm run dev
```

- Runs at **http://localhost:3000**
- Open http://localhost:3000 in the browser

---

## Quick API tests (backend must be running)

```bash
# Health
curl http://localhost:4000/health

# Generate listing (needs valid GEMINI_API_KEY in backend/.env)
curl -X POST http://localhost:4000/generate-listing \
  -H "Content-Type: application/json" \
  -d '{"name":"Vintage Sony Walkman","condition":"Used","category":"Electronics"}'

# Create listing (mock Etsy)
curl -X POST http://localhost:4000/create-listing \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","description":"Desc","price":65}'

# AI reply
curl -X POST http://localhost:4000/generate-reply \
  -H "Content-Type: application/json" \
  -d '{"message":"Will you take $40?","product":{"title":"Walkman","price":65,"min_price":50}}'
```

---

## Using the API from the Next.js app

Use the helper in `lib/api.ts`:

```ts
import { api } from "@/lib/api";

// In a component or server action:
const data = await api.generateListing({ name: "Walkman", condition: "Used", category: "Electronics" });
const created = await api.createListing({ title: data.title, description: data.description, price: data.price });
```

Optional: set `NEXT_PUBLIC_API_URL` in `.env.local` (e.g. `http://localhost:4000`) if you want to override the default.

---

## If a port is in use

- Backend: it will try the next port (4001, 4002, …) automatically. Use the URL printed in the terminal.
- Next.js: either stop the other process using 3000, or run `npm run dev -- -p 3001` to use port 3001.
