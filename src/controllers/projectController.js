// controllers/projectController.js
const db = require('../db');

// Show all projects
exports.index = async (req, res) => {
  try {
    const query = `
      SELECT p.*, o.name as organization_name 
      FROM projects p
      LEFT JOIN organizations o ON p.organization_id = o.organization_id
      ORDER BY p.date ASC
    `;
    const [projects] = await db.query(query);

    // Format dates
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
};

// Show a single project
exports.show = async (req, res) => {
  const projectId = req.params.id;

  try {
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

    // Format date
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
    project.formattedDate = formattedDate;

    res.render('project', {
      title: project.name,
      project: project,
      isLoggedIn: req.session?.user ? true : false,
      user: req.session?.user,
      isAdmin: req.session?.user?.role === 'admin'
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).send('Server error');
  }
};