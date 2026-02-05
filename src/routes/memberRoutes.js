const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // Protect all member routes

/**
 * @swagger
 * components:
 *   schemas:
 *     Member:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - relationship
 *         - birthYear
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         relationship:
 *           type: string
 *         birthYear:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           default: active
 *       example:
 *         firstName: Child
 *         lastName: One
 *         relationship: Son
 *         birthYear: 2015
 *         status: active
 */

/**
 * @swagger
 * tags:
 *   name: Members
 *   description: Protected Member management API
 */

/**
 * @swagger
 * /protected-members:
 *   post:
 *     summary: Create a new protected member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       201:
 *         description: Member created successfully
 *       500:
 *         description: Server error
 */
router.post('/', memberController.createMember);

/**
 * @swagger
 * /protected-members:
 *   get:
 *     summary: List all members for the authenticated caregiver
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 */
router.get('/', memberController.getMembers);

/**
 * @swagger
 * /protected-members/{id}:
 *   patch:
 *     summary: Update a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The member ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Member'
 *     responses:
 *       200:
 *         description: Member updated
 *       404:
 *         description: Member not found
 */
router.patch('/:id', memberController.updateMember);

/**
 * @swagger
 * /protected-members/{id}:
 *   delete:
 *     summary: Delete a member
 *     tags: [Members]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The member ID
 *     responses:
 *       200:
 *         description: Member deleted
 *       404:
 *         description: Member not found
 */
router.delete('/:id', memberController.deleteMember);

module.exports = router;
