const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

// Protect all /api/admin/team routes with JWT authentication
router.use(protect);

// ADMIN: Get all team members + metrics
router.get('/', teamController.getAdminTeam);

// ADMIN: Get single team member by ID
router.get('/:id', teamController.getAdminTeamMemberById);

// ADMIN: Create new team member
router.post('/', teamController.createTeamMember);

// ADMIN: Update existing team member
router.put('/:id', teamController.updateTeamMember);

// ADMIN: Quick toggle publish status
router.patch('/:id/toggle-publish', teamController.togglePublish);

// ADMIN: Delete team member
router.delete('/:id', teamController.deleteTeamMember);

module.exports = router;
