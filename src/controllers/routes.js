import express from 'express';

import { showHomePage } from './index.js';
import { showOrganizationsPage, showOrganizationDetailsPage } from './organizations.js';
import { showProjectsPage, showProjectDetailsPage } from './projects.js';
import { showCategoriesPage, showCategoryDetailsPage } from './categories.js'; // import category details controller
import { testErrorPage } from './errors.js';

const router = express.Router();

router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

// Redirect for trailing slash (fixes 404 for /organization/)
router.get('/organization/', (req, res) => {
  res.redirect('/organizations');
});

// Detail routes
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/category/:id', showCategoryDetailsPage); // new route for category details

// Error handling routes
router.get('/test-error', testErrorPage);

export default router;