const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/projects routes with JWT authentication
router.use(protect);

// ADMIN: Get all projects + metrics
router.get('/', projectController.getAdminProjects);

// ADMIN: Get single project by ID
router.get('/:id', projectController.getAdminProjectById);

// ADMIN: Create new project
router.post('/', projectController.createProject);

// ADMIN: Update existing project
router.put('/:id', projectController.updateProject);

// ADMIN: Toggle published status
router.patch('/:id/toggle-publish', projectController.togglePublish);

// ADMIN: Toggle featured status
router.patch('/:id/toggle-featured', projectController.toggleFeatured);

// ADMIN: Delete project
router.delete('/:id', projectController.deleteProject);

module.exports = router;
