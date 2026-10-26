const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { seedRegulations } = require('../controllers/adminController');

// Seeding endpoint - restricted to admins
router.post('/seed-regulations', protect, admin, seedRegulations);

module.exports = router;
