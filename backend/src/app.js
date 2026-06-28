const express = require('express');
const cors = require('cors');
const path = require('path');
const client = require('prom-client');

const authRoutes = require('./routes/authRoutes');
const accountRoutes = require('./routes/accountRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const employerRoutes = require('./routes/employerRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

client.collectDefaultMetrics();

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration.observe({ method: req.method, route: req.path, status: res.statusCode }, duration);
  });
  next();
});

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded resumes as static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/employer', employerRoutes);
app.use('/api/admin', adminRoutes);

app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', client.contentType);
  res.end(await client.register.metrics());
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Global error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err.message);
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;