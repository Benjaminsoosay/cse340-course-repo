// src/controllers/users.js

import bcrypt from 'bcrypt';
import {
    createUser,
    authenticateUser,
    getAllUsers,
    getUserById,
    updateUserRole
} from '../models/users.js';
import { getUserVolunteerProjects } from '../models/volunteerModel.js';

// ==================== REGISTRATION ====================
export const showUserRegistrationForm = (req, res) => {
    res.render('register', { title: 'Register' });
};

export const processUserRegistrationForm = async (req, res) => {
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

// ==================== LOGIN / LOGOUT ====================
export const showLoginForm = (req, res) => {
    res.render('login', { title: 'Login' });
};

export const processLoginForm = async (req, res) => {
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

export const processLogout = (req, res) => {
    if (req.session.user) {
        delete req.session.user;
    }
    req.flash('success', 'Logout successful!');
    res.redirect('/login');
};

// ==================== AUTHENTICATION MIDDLEWARE ====================
export const requireLogin = (req, res, next) => {
    if (!req.session || !req.session.user) {
        req.flash('error', 'You must be logged in to access that page.');
        return res.redirect('/login');
    }
    next();
};

export const requireRole = (role) => {
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

// ==================== DASHBOARD ====================
export const showDashboard = async (req, res) => {
    try {
        const userId = req.session.user.user_id;
        const volunteeringProjects = await getUserVolunteerProjects(userId);

        const userForView = {
            ...req.session.user,
            role: req.session.user.role_name
        };

        res.render('dashboard', {
            title: 'Dashboard',
            user: userForView,
            volunteeringProjects,
            isAdmin: req.session.user.role_name === 'admin'
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Unable to load dashboard.');
        res.redirect('/');
    }
};

// ==================== ADMIN: USER MANAGEMENT ====================
export const showUsersPage = async (req, res, next) => {
    try {
        const users = await getAllUsers();
        res.render('admin-users', { title: 'Manage Users', users });
    } catch (error) {
        next(error);
    }
};

export const showUserDetailsPage = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await getUserById(userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }
        res.render('user', { title: 'User Profile', user });
    } catch (error) {
        next(error);
    }
};

export const showEditUserForm = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await getUserById(userId);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/admin/users');
        }
        res.render('edit-user', { title: 'Edit User Permissions', user });
    } catch (error) {
        next(error);
    }
};

export const processRoleUpdate = async (req, res) => {
    if (!req.session.user || req.session.user.role_name !== 'admin') {
        req.flash('error', 'Unauthorized: Only admins can change roles.');
        return res.redirect('/');
    }

    const { role_name } = req.body;
    const { id } = req.params;

    try {
        await updateUserRole(id, role_name);
        req.flash('success', 'User role updated successfully.');
        res.redirect(`/user/${id}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to update user role.');
        res.redirect(`/user/${id}`);
    }
};

// No additional export block – everything is already exported.