const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const adminAuth = require('../middleware/adminAuth');

router.get('/', contentController.getContent);
router.put('/', adminAuth, contentController.updateContent);
router.post('/reset', adminAuth, contentController.resetContent);

module.exports = router;

