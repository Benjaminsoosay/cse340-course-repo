// routes/projects.js
const express = require('express');
const router = express.Router();
const db = require('../db');        // adjust path to your DB connection
const projectController = require('../controllers/projectController'); // adjust path

// GET /projects – show all projects
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT p.*, o.name as organization_name 
      FROM projects p
      LEFT JOIN organizations o ON p.organization_id = o.organization_id
      ORDER BY p.date ASC
    `;
    const [projects] = await db.query(query);

    projects.forEach(project => {
      if (project.date) {
        const d = new Date(project.date);
        if (!isNaN(d)) {
          project.formattedDate = d.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          });
        } else {
          project.formattedDate = 'Date TBA';
        }
      } else {
        project.formattedDate = 'Date TBA';
      }
    });

    res.render('projects', { 
      title: 'All Projects',
      projects,
      isLoggedIn: req.session?.user ? true : false,
      user: req.session?.user,
      isAdmin: req.session?.user?.role === 'admin'
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// GET /projects/:id – show a single project
router.get('/:id', projectController.show);

module.exports = router;