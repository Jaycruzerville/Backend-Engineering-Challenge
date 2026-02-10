const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  standardHeaders: true, 
  legacyHeaders: false, 
  message: { message: 'Too many requests, please try again later.' },
});

// Swagger Docs using /api-docs to avoid rate limiting ideally, but putting it before limiter or configuring properly
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Apply rate limiting to API routes, not necessarily documentation if we want
app.use('/api', limiter); 


// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Basic Route
app.get('/', (req, res) => {
  res.send('OneHaven Backend Challenge API is running');
});

// Routes
app.use('/api/caregivers', require('./routes/caregiverRoutes'));
app.use('/api/protected-members', require('./routes/memberRoutes'));

// Error Handling Middleware
app.use(require('./middleware/errorHandler'));

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

module.exports = app;
