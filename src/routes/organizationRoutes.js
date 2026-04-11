const express = require('express');
const router = express.Router();

// GET edit form
router.get('/edit-organization/:id', async (req, res) => { ... });

// POST update
router.post('/edit-organization/:id', async (req, res) => {
    // same handler as above
});

module.exports = router;