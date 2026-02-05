const express = require('express');
const router = express.Router();
const caregiverController = require('../controllers/caregiverController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Caregiver:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - name
 *       properties:
 *         email:
 *           type: string
 *           description: The caregiver's email
 *         password:
 *           type: string
 *           description: The caregiver's password
 *         name:
 *           type: string
 *           description: The caregiver's name
 *       example:
 *         email: user@example.com
 *         password: password123
 *         name: John Doe
 */

/**
 * @swagger
 * tags:
 *   name: Caregivers
 *   description: Caregiver management API
 */

/**
 * @swagger
 * /caregivers/signup:
 *   post:
 *     summary: Register a new caregiver
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Caregiver'
 *     responses:
 *       201:
 *         description: The caregiver was successfully created
 *       409:
 *         description: Email already registered
 *       500:
 *         description: Internal server error
 */
router.post('/signup', caregiverController.signup);

/**
 * @swagger
 * /caregivers/login:
 *   post:
 *     summary: Login a caregiver
 *     tags: [Caregivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', caregiverController.login);

/**
 * @swagger
 * /caregivers/me:
 *   get:
 *     summary: Get current authenticated caregiver
 *     tags: [Caregivers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The caregiver profile
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authMiddleware, caregiverController.getMe);

module.exports = router;
