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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { message: 'Too many requests, please try again later.' },
});

// Middleware
app.use(limiter); // Apply rate limiting to all requests
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Basic Route
app.get('/', (req, res) => {
  res.send('OneHaven Backend Challenge API is running');
});

// Routes
app.use('/api/caregivers', require('./routes/caregiverRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
