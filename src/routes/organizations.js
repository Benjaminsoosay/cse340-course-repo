const express = require('express');
const router = express.Router();
const organizationController = require('../controllers/organizationController');

// List all organizations
router.get('/', organizationController.index);

// Show single organization (NEW)
router.get('/:id', organizationController.show);

module.exports = router;