const express = require('express');
const router = express.Router();
const {
  getAllImages,
  uploadImageFile,
  addImage,
  updateImage,
  deleteImage,
  resetImages,
} = require('../controllers/imageController');
const adminAuth = require('../middleware/adminAuth');

router.get('/', getAllImages);
router.post('/upload', adminAuth, uploadImageFile);
router.post('/', adminAuth, addImage);
router.put('/:id', adminAuth, updateImage);
router.delete('/:id', adminAuth, deleteImage);
router.post('/reset', adminAuth, resetImages);

module.exports = router;

