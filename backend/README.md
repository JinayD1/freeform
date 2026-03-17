# AI Resale Agent – Backend

Node.js + Express backend for the AI Resale Agent hackathon project.

## Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set GEMINI_API_KEY (required for AI). Etsy keys optional.
npm install
node server.js
```

Server runs at **http://localhost:5000**.

## Endpoints

### 1. Generate listing (Gemini)

```bash
curl -X POST http://localhost:5000/generate-listing \
  -H "Content-Type: application/json" \
  -d '{"name":"Vintage Sony Walkman","condition":"Used","category":"Electronics"}'
```

**Example response:**
```json
{
  "title": "Vintage Sony Walkman – Retro Portable Cassette Player",
  "description": "...",
  "tags": ["vintage", "walkman", "sony", "cassette", ...],
  "price": 65
}
```

### 2. Create Etsy listing (mock if no API key)

```bash
curl -X POST http://localhost:5000/create-listing \
  -H "Content-Type: application/json" \
  -d '{"title":"Vintage Sony Walkman","description":"...","price":65}'
```

**Example response:**
```json
{
  "listing_id": "12345",
  "status": "created"
}
```

### 3. AI negotiation reply

```bash
curl -X POST http://localhost:5000/generate-reply \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Will you take $40?",
    "product": {"title":"Vintage Sony Walkman","price":65,"min_price":50}
  }'
```

**Example response:**
```json
{
  "reply": "Thanks for your interest! $40 is a bit below my minimum of $50...",
  "intent": "negotiation"
}
```

### 4. Webhook (simulated Etsy message)

```bash
curl -X POST http://localhost:5000/webhook/message \
  -H "Content-Type: application/json" \
  -d '{"message":"Will you take $40?","product":{"title":"Vintage Sony Walkman","price":65,"min_price":50}}'
```

### Bonus: List stored listings

```bash
curl http://localhost:5000/listings
```

## Env vars

| Variable        | Required | Description                    |
|----------------|----------|--------------------------------|
| GEMINI_API_KEY | Yes      | For listing + negotiation AI   |
| ETSY_API_KEY   | No       | Etsy API key (mock if missing) |
| ETSY_TOKEN     | No       | Etsy OAuth token               |
| PORT           | No       | Default 5000                   |

## Intent types (negotiation)

- `negotiation` – price / offer
- `shipping` – shipping questions
- `product_question` – product details
- `availability` – in stock / when available
- `other` – everything else
