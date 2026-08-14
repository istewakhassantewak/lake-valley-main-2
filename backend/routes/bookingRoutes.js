const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  cancelBooking,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');
const adminAuth = require('../middleware/adminAuth');
const { optionalAuth, verifyToken } = require('../middleware/auth');

router.post('/', optionalAuth, createBooking);
router.get('/', adminAuth, getBookings);
router.patch('/:id/status', adminAuth, updateBookingStatus);
router.delete('/:id', adminAuth, deleteBooking);
router.patch('/:id/cancel', verifyToken, cancelBooking);

module.exports = router;
