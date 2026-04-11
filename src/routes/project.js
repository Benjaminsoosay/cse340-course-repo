// routes/project.js
const express = require('require');
const router = express.Router();
const db = require('../db'); // Make sure this path matches your database connection file

// GET /project/:id – show a single project with formatted date
router.get('/:id', async (req, res) => {
  const projectId = req.params.id;

  try {
    // Fetch project details with organization information
    const query = `
      SELECT p.*, o.name AS organization_name, o.contact_email AS org_email
      FROM projects p
      LEFT JOIN organizations o ON p.organization_id = o.organization_id
      WHERE p.project_id = ?
    `;
    const [rows] = await db.query(query, [projectId]);

    if (rows.length === 0) {
      return res.status(404).send('Project not found');
    }

    const project = rows[0];

    // ----- FIX THE "Invalid Date" PROBLEM -----
    let formattedDate = 'Date not set';
    if (project.date) {
      const dateObj = new Date(project.date);
      if (!isNaN(dateObj)) {
        formattedDate = dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      } else {
        formattedDate = 'Invalid date format';
      }
    }
    // Attach the formatted date to the project object
    project.formattedDate = formattedDate;

    // Render the project view
    res.render('project', {
      title: project.name,
      project: project,          // now contains .formattedDate
      isLoggedIn: req.session?.user ? true : false,
      user: req.session?.user,
      isAdmin: req.session?.user?.role === 'admin'
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send('Server error');
  }
});

module.exports = router;