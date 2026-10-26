const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createShipment,
  getShipments,
  getShipmentStats,
  getShipmentById,
  updateShipment,
  deleteShipment,
} = require('../controllers/shipmentController');

// Shipment stats route (placed before :id route)
router.get('/stats', protect, getShipmentStats);

// Main shipment collection routes
router
  .route('/')
  .get(protect, getShipments)
  .post(protect, upload.array('documents', 5), createShipment);

// Individual shipment operations
router
  .route('/:id')
  .get(protect, getShipmentById)
  .put(protect, upload.array('documents', 5), updateShipment)
  .delete(protect, deleteShipment);

module.exports = router;
