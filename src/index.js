const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Basic Route
app.get('/', (req, res) => {
  res.send('OneHaven Backend Challenge API is running');
});

// Start Server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
