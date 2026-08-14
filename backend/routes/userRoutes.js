const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  syncUser,
  getProfile,
  updateProfile,
  getMyBookings,
  deleteAccount,
} = require('../controllers/userController');

router.post('/sync', verifyToken, syncUser);
router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);
router.get('/bookings', verifyToken, getMyBookings);
router.delete('/account', verifyToken, deleteAccount);

module.exports = router;
