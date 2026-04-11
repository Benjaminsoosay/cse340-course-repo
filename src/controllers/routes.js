// routes/index.js

import express from 'express';

// ==================== CONTROLLER IMPORTS ====================

// Home
import { showHomePage } from './homeController.js';

// Organization controllers (legacy + RESTful)
import {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm,
    deleteOrganization,
    showCreateOrganizationForm,
    createOrganizationHandler,
    editOrganizationHandler
} from './organizations.js';

// Project controllers (legacy + RESTful + category assignment)
import {
    showProjectsPage,
    showProjectDetailsPage,
    showNewProjectForm,
    processNewProjectForm,
    projectValidation,
    showEditProjectForm,
    processEditProjectForm,
    showCreateProjectForm,
    createProjectHandler,
    editProjectHandler,
    showAssignCategoriesForm,      // primary: uses :id
    assignCategoriesHandler         // primary POST
} from './projects.js';

// Category controllers (legacy + RESTful)
import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm as showAssignCategoriesFormLegacy,   // legacy: uses :projectId
    processAssignCategoriesForm as processAssignCategoriesFormLegacy,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation,
    showCreateCategoryForm,
    createCategoryHandler,
    editCategoryHandler
} from './categories.js';

// User & authentication controllers
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

// Volunteer controllers
import { handleAddVolunteer, handleRemoveVolunteer, showVolunteeringPage } from './volunteerController.js';

// Error test controller
import { testErrorPage } from './errors.js';

// Validation error handler middleware
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (no login required)
// ============================================
router.get('/', showHomePage);
router.get('/organizations', showOrganizationsPage);
router.get('/projects', showProjectsPage);
router.get('/categories', showCategoriesPage);

// Redirects for trailing slashes
router.get('/organization/', (req, res) => res.redirect('/organizations'));
router.get('/category/', (req, res) => res.redirect('/categories'));

// Public detail pages (anyone can view)
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/project/:id', showProjectDetailsPage);
router.get('/category/:id', showCategoryDetailsPage);

// ============================================
// AUTHENTICATION ROUTES (public)
// ============================================
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);
router.get('/login', showLoginForm);
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// Protected dashboard (any logged-in user)
router.get('/dashboard', requireLogin, showDashboard);

// ============================================
// ADMIN-ONLY ROUTES (require login + admin role)
// ============================================

// ----- ORGANIZATIONS -----
// Legacy paths
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), organizationValidation, processNewOrganizationForm);
router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), organizationValidation, processEditOrganizationForm);
router.post('/delete-organization/:id', requireLogin, requireRole('admin'), deleteOrganization);

// New RESTful paths
router.get('/organizations/new', requireLogin, requireRole('admin'), showCreateOrganizationForm);
router.post('/organizations/new', requireLogin, requireRole('admin'), organizationValidation, handleValidationErrors, createOrganizationHandler);
router.get('/organizations/:id/edit', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/organizations/:id/edit', requireLogin, requireRole('admin'), organizationValidation, handleValidationErrors, editOrganizationHandler);

// ----- PROJECTS -----
// Legacy paths
router.get('/new-project', requireLogin, requireRole('admin'), showNewProjectForm);
router.post('/new-project', requireLogin, requireRole('admin'), projectValidation, processNewProjectForm);
router.get('/edit-project/:id', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/edit-project/:id', requireLogin, requireRole('admin'), projectValidation, processEditProjectForm);

// New RESTful paths
router.get('/projects/new', requireLogin, requireRole('admin'), showCreateProjectForm);
router.post('/projects/new', requireLogin, requireRole('admin'), projectValidation, handleValidationErrors, createProjectHandler);
router.get('/projects/:id/edit', requireLogin, requireRole('admin'), showEditProjectForm);
router.post('/projects/:id/edit', requireLogin, requireRole('admin'), projectValidation, handleValidationErrors, editProjectHandler);

// ----- PROJECT CATEGORY ASSIGNMENT -----
// Primary RESTful routes (uses :id to match project ID)
router.get('/projects/:id/categories', requireLogin, requireRole('admin'), showAssignCategoriesForm);
router.post('/projects/:id/categories', requireLogin, requireRole('admin'), assignCategoriesHandler);

// Legacy assignment routes (uses :projectId – kept for backward compatibility)
router.get('/assign-categories/:projectId', requireLogin, requireRole('admin'), showAssignCategoriesFormLegacy);
router.post('/assign-categories/:projectId', requireLogin, requireRole('admin'), processAssignCategoriesFormLegacy);

// ----- CATEGORIES -----
// Legacy paths
router.get('/new-category', requireLogin, requireRole('admin'), showNewCategoryForm);
router.post('/new-category', requireLogin, requireRole('admin'), categoryValidation, processNewCategoryForm);
router.get('/edit-category/:id', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/edit-category/:id', requireLogin, requireRole('admin'), categoryValidation, processEditCategoryForm);

// New RESTful paths
router.get('/categories/new', requireLogin, requireRole('admin'), showCreateCategoryForm);
router.post('/categories/new', requireLogin, requireRole('admin'), categoryValidation, handleValidationErrors, createCategoryHandler);
router.get('/categories/:id/edit', requireLogin, requireRole('admin'), showEditCategoryForm);
router.post('/categories/:id/edit', requireLogin, requireRole('admin'), categoryValidation, handleValidationErrors, editCategoryHandler);

// ----- USER MANAGEMENT (admin only) -----
router.get('/admin/users', requireLogin, requireRole('admin'), showUsersPage);
// Additional user detail/edit routes can be added here if needed

// ============================================
// VOLUNTEER ROUTES (require login, not necessarily admin)
// ============================================
router.post('/projects/:id/volunteer', requireLogin, handleAddVolunteer);
router.post('/projects/:id/remove-volunteer', requireLogin, handleRemoveVolunteer);
router.get('/volunteering', requireLogin, showVolunteeringPage);

// ============================================
// ERROR TESTING ROUTE
// ============================================
router.get('/test-error', testErrorPage);

// ============================================
// EXPORT
// ============================================
export default router;