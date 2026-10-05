const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// PUBLIC: Get all published team members
router.get('/', teamController.getPublicTeam);

module.exports = router;
