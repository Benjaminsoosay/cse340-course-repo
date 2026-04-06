import express from 'express';

// ✅ CHANGED: import from homeController.js instead of index.js
import { showHomePage } from './homeController.js';

import {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm,
    deleteOrganization
} from './organizations.js';
import {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    projectValidation,
    showEditProjectForm,
    processEditProjectForm
    // ❌ REMOVED volunteer exports from projects.js
} from './projects.js';
import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation
} from './categories.js';
import { 
    showUserRegistrationForm, 
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage
} from './users.js';
import { testErrorPage } from './errors.js';

// ✅ NEW import from volunteerController
import { 
    handleAddVolunteer, 
    handleRemoveVolunteer, 
    showVolunteeringPage 
} from './volunteerController.js';

const router = express.Router();

// ============================================
// Public routes (no login required)
// ============================================
router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

// Redirect for trailing slash (fixes 404 for /organization/)
router.get('/organization/', (req, res) => {
    res.redirect('/organizations');
});

// Public detail routes (anyone can view)
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/category/:id', showCategoryDetailsPage);

// ============================================
// Admin-only routes (require login + admin role)
// ============================================

// Organization creation / editing / deletion
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), organizationValidation, processEditOrganizationForm);
router.post('/delete-organization/:id', requireLogin, requireRole('admin'), deleteOrganization);

// Project creation / editing
router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireLogin, requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), projectValidation, processEditProjectForm);

// Category creation / editing
router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireLogin, requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), categoryValidation, processEditCategoryForm);

// Assign categories to a project (admin only)
router.get('/assign-categories/:projectId', requireLogin, requireRole('admin'), showAssignCategoriesForm);
router.post('/assign-categories/:projectId', requireLogin, requireRole('admin'), processAssignCategoriesForm);

// ============================================
// Volunteer routes (require login)
// ============================================
// ✅ Using volunteerController handlers (GET methods for simplicity)
router.get('/projects/:id/volunteer', requireLogin, handleAddVolunteer);
router.get('/projects/:id/remove-volunteer', requireLogin, handleRemoveVolunteer);
router.get('/volunteering', requireLogin, showVolunteeringPage);

// ============================================
// User authentication routes (public)
// ============================================
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// Protected dashboard (any logged‑in user)
router.get('/dashboard', requireLogin, showDashboard);

// Admin user management (only admins)
router.get('/admin/users', requireLogin, requireRole('admin'), showUsersPage);

// ============================================
// Error handling
// ============================================
router.get('/test-error', testErrorPage);

export default router;