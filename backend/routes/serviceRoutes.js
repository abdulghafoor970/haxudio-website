const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// PUBLIC: Get all published services
router.get('/', serviceController.getPublicServices);

// PUBLIC: Get single published service by slug
router.get('/:slug', serviceController.getPublicServiceBySlug);

module.exports = router;
