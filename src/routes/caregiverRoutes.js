const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', caregiverController.signup);
router.post('/login', caregiverController.login);
router.get('/me', authMiddleware, caregiverController.getMe);

module.exports = router;
