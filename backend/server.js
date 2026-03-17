require('dotenv').config();
const express = require('express');
const cors = require('cors');
const listingRoutes = require('./routes/listing');
const messageRoutes = require('./routes/message');

const app = express();
const PORT = process.env.PORT || 4000;

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  next();
});

app.use(cors());
app.use(express.json());

// Root – so opening http://localhost:PORT in browser shows something
app.get('/', (req, res) => {
  res.json({
    service: 'AI Resale Agent',
    status: 'running',
    endpoints: {
      'GET /health': 'Health check',
      'GET /listings': 'List stored listings',
      'POST /generate-listing': 'Body: { name, condition, category }',
      'POST /create-listing': 'Body: { title, description, price }',
      'POST /generate-reply': 'Body: { message, product: { title, price, min_price? } }',
      'POST /webhook/message': 'Body: { message, product? }',
    },
  });
});

// Routes
app.use('/', listingRoutes);
app.use('/', messageRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'AI Resale Agent' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// If default port is in use (e.g. old process still running), try next port
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`AI Resale Agent backend running at http://localhost:${port}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      startServer(port + 1);
    } else {
      throw err;
    }
  });
}
startServer(Number(PORT) || 4000);
