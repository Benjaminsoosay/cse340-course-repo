// src/routes/index.js
import express from 'express';
import { 
    showLoginForm, 
    processLoginForm, 
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUserRegistrationForm,
    processUserRegistrationForm
} from '../controllers/users.js';

// Import organizations controllers
import { 
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    createOrganization,
    showEditOrganizationForm,
    updateOrganization,
    deleteOrganization
} from '../controllers/organizations.js';

// Import projects controllers
import { 
    showProjectsPage,
    showProjectDetailsPage,
    addVolunteer,           // ✅ added
    removeVolunteer         // ✅ added
} from '../controllers/projects.js';

// Import categories controllers
import { 
    showCategoriesPage,
    showCategoryDetailsPage
} from '../controllers/categories.js';

const router = express.Router();

// ==================== HOME ====================
router.get('/', (req, res) => {
    res.render('home', { title: 'Home', user: req.session.user || null });
});

// ==================== REGISTRATION ====================
router.get('/register', showUserRegistrationForm);
router.post('/register', processUserRegistrationForm);

// ==================== LOGIN / LOGOUT ====================
router.get('/login', showLoginForm);
console.log('✅ /login route registered');
router.post('/login', processLoginForm);
router.get('/logout', processLogout);

// ==================== DASHBOARD ====================
router.get('/dashboard', requireLogin, showDashboard);

// ==================== ORGANIZATIONS ====================
router.get('/organizations', showOrganizationsPage);
router.get('/organization/:id', showOrganizationDetailsPage);
router.get('/new-organization', requireLogin, requireRole('admin'), showNewOrganizationForm);
router.post('/new-organization', requireLogin, requireRole('admin'), createOrganization);
router.get('/edit-organization/:id', requireLogin, requireRole('admin'), showEditOrganizationForm);
router.post('/edit-organization/:id', requireLogin, requireRole('admin'), updateOrganization);
router.post('/delete-organization/:id', requireLogin, requireRole('admin'), deleteOrganization);

// ==================== PROJECTS ====================
router.get('/projects', showProjectsPage);
router.get('/project/:id', showProjectDetailsPage);
router.post('/projects/:id/volunteer', requireLogin, addVolunteer);               // ✅ added
router.post('/projects/:id/remove-volunteer', requireLogin, removeVolunteer);    // ✅ added

// ==================== CATEGORIES ====================
router.get('/categories', showCategoriesPage);
router.get('/category/:id', showCategoryDetailsPage);

// ==================== OTHER ROUTES ====================
// ... add more routes (e.g., assignment, admin, etc.) later

export default router;