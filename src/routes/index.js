// src/routes/index.js
import express from 'express';
import bcrypt from 'bcrypt';
import { MongoClient } from 'mongodb';

// ==================== CONTROLLER IMPORTS ====================

// Home
import { showHomePage } from '../controllers/homeController.js';

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
} from '../controllers/organizations.js';

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
    showAssignCategoriesForm,
    assignCategoriesHandler
} from '../controllers/projects.js';

// Category controllers (legacy + RESTful)
import {
    showCategoriesPage,
    showCategoryDetailsPage,
    showAssignCategoriesForm as showAssignCategoriesFormLegacy,
    processAssignCategoriesForm as processAssignCategoriesFormLegacy,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm,
    categoryValidation,
    showCreateCategoryForm,
    createCategoryHandler,
    editCategoryHandler
} from '../controllers/categories.js';

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
} from '../controllers/users.js';

// Volunteer controllers
import { handleAddVolunteer, handleRemoveVolunteer, showVolunteeringPage } from '../controllers/volunteerController.js';

// Error test controller
import { testErrorPage } from '../controllers/errors.js';

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
// TEMPORARY ADMIN CREATION ROUTE - REMOVE AFTER USE
// Uses direct MongoClient (no dependency on db.js)
// ============================================
router.get('/create-admin', async (req, res) => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'cse340'; // adjust to your database name
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users'); // adjust collection name if needed

        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        const adminUser = {
            name: 'Admin',
            email: 'grader@example.com',
            password: hashedPassword,
            role: 'admin',
            createdAt: new Date()
        };

        const existing = await usersCollection.findOne({ email: 'grader@example.com' });
        if (existing) {
            await usersCollection.updateOne(
                { email: 'grader@example.com' },
                { $set: { role: 'admin', password: hashedPassword } }
            );
            res.send('✅ Existing user updated to admin role.');
        } else {
            await usersCollection.insertOne(adminUser);
            res.send('✅ New admin user created successfully!');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating admin: ' + err.message);
    } finally {
        await client.close();
    }
});

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
router.get('/projects/:id/categories', requireLogin, requireRole('admin'), showAssignCategoriesForm);
router.post('/projects/:id/categories', requireLogin, requireRole('admin'), assignCategoriesHandler);

// Legacy assignment routes
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

// ----- USER MANAGEMENT -----
// Path expected by the assignment (used in dashboard link)
router.get('/users', requireLogin, requireRole('admin'), showUsersPage);
// Alternative admin path (kept for compatibility)
router.get('/admin/users', requireLogin, requireRole('admin'), showUsersPage);

// ============================================
// ADDITIONAL ADMIN ROUTES FOR THE ASSIGNMENT
// These match the exact hrefs used in dashboard.ejs
// ============================================
router.get('/organizations/create', requireLogin, requireRole('admin'), showCreateOrganizationForm);
router.get('/projects/create', requireLogin, requireRole('admin'), showCreateProjectForm);
router.get('/categories/create', requireLogin, requireRole('admin'), showCreateCategoryForm);

// ============================================
// VOLUNTEER ROUTES
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