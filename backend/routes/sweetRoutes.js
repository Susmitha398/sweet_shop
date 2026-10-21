const express = require('express');
const router = express.Router();
const {
  getAllSweets,
  getSweetByIdOrSlug,
  getAllCategories,
  getCategoryBySlug
} = require('../controllers/sweetController');

// Categories endpoints
router.get('/categories', getAllCategories);
router.get('/categories/:slug', getCategoryBySlug);

// Sweets endpoints
router.get('/sweets', getAllSweets);
router.get('/sweets/:identifier', getSweetByIdOrSlug);

module.exports = router;
