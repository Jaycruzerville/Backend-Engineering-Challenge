const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware); // Protect all member routes

router.post('/', memberController.createMember);
router.get('/', memberController.getMembers);
router.put('/:id', memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;
