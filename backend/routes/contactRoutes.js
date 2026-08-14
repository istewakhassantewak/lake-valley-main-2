const express = require('express');
const router = express.Router();
const {
  createMessage,
  getMessages,
  getMyMessages,
  updateMessageStatus,
  deleteMessage,
} = require('../controllers/contactController');
const adminAuth = require('../middleware/adminAuth');
const { optionalAuth, verifyToken } = require('../middleware/auth');

router.post('/', optionalAuth, createMessage);
router.get('/me', verifyToken, getMyMessages);
router.get('/', adminAuth, getMessages);
router.patch('/:id/status', adminAuth, updateMessageStatus);
router.delete('/:id', adminAuth, deleteMessage);

module.exports = router;
