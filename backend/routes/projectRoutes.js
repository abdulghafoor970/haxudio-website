const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

// PUBLIC: Get all published projects (supports ?category= and ?featured=true)
router.get('/', projectController.getPublicProjects);

// PUBLIC: Get single published project by slug
router.get('/:slug', projectController.getPublicProjectBySlug);

module.exports = router;
