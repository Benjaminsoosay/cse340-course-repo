import bcrypt from 'bcrypt';
import { createUser, authenticateUser, getAllUsers } from '../models/users.js';
import { getUserVolunteerProjects } from '../models/volunteerModel.js';  // ✅ added

// ==================== REGISTRATION CONTROLLERS ====================
const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

const processUserRegistrationForm = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const userId = await createUser(name, email, passwordHash);

        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        req.flash('error', 'An error occurred during registration. Please try again.');
        res.redirect('/register');
    }
};

// ==================== LOGIN CONTROLLERS ====================
const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

const processLoginForm = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await authenticateUser(email, password);
        if (user) {
            req.session.user = user;
            req.flash('success', 'Login successful!');

            if (res.locals.NODE_ENV === 'development') {
                console.log('User logged in:', user);
            }

            res.redirect('/dashboard');
        } else {
            req.flash('error', 'Invalid email or password.');
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error during login:', error);
        req.flash('error', 'An error occurred during login. Please try again.');
        res.redirect('/login');
    }
};

const processLogout = (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }

    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

// ==================== PROTECTION MIDDLEWARE ====================
const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        if (req.session.user.role_name !== role) {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        next();
    };
};

// ==================== DASHBOARD CONTROLLER (UPDATED) ====================
const showDashboard = async (req, res) => {
    try {
        const userId = req.session.user.user_id;   // ✅ adjust if your user object uses 'id' instead
        const volunteeredProjects = await getUserVolunteerProjects(userId);

        res.render('dashboard', {
            title: 'Dashboard',
            name: req.session.user.name,
            email: req.session.user.email,
            role: req.session.user.role_name || 'user',
            user: req.session.user,                // ✅ pass full user for navbar, etc.
            volunteeredProjects: volunteeredProjects   // ✅ for the volunteer list
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Unable to load dashboard.');
        res.redirect('/');
    }
};

// ==================== ADMIN USER MANAGEMENT CONTROLLER ====================
const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('admin-users', {
            title: 'Manage Users',
            users
        });
    } catch (error) {
        next(error);
    }
};

// ==================== EXPORTS ====================
export {
    showUserRegistrationForm,
    processUserRegistrationForm,
    showLoginForm,
    processLoginForm,
    processLogout,
    requireLogin,
    requireRole,
    showDashboard,
    showUsersPage
};