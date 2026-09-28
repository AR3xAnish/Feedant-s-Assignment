const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const competitionRoutes = require('./routes/competitionRoutes');
const userRoutes = require('./routes/userRoutes');
const { AppError } = require('./utils/errors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/competitions', competitionRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler for undefined routes
app.use('*', (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, 'NOT_FOUND'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  if (statusCode === 500) {
    console.error('[UNHANDLED_ERROR]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'An unexpected server error occurred',
      code,
      details: err.details || null,
      ...(process.env.NODE_ENV === 'development' && statusCode === 500 ? { stack: err.stack } : {}),
    },
  });
});

module.exports = app;
