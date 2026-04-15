// src/controllers/authController.js
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { findUserByEmail, createUser, verifyPassword } from '../models/users.js';

export const showLogin = (req, res) => {
    res.render('auth/login', { title: 'Login', formData: {} });
};

export const login = [
    body('email').notEmpty().withMessage('Email address required'),
    body('password').notEmpty().withMessage('Password required'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join(', '));
            return res.redirect('/login');
        }
        const { email, password } = req.body;
        try {
            const user = await findUserByEmail(email);
            if (!user || !(await verifyPassword(password, user.password_hash))) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            // Store user in session (exclude password_hash)
            const { password_hash, ...userWithoutHash } = user;
            req.session.user = userWithoutHash;
            req.flash('success', `Welcome back, ${user.name}!`);
            res.redirect('/');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Login failed. Please try again.');
            res.redirect('/login');
        }
    }
];

export const showRegister = (req, res) => {
    res.render('auth/register', { title: 'Register', formData: {} });
};

export const register = [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Valid email address required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(e => e.msg).join(', '));
            return res.redirect('/register');
        }
        const { name, email, password } = req.body;
        try {
            const existingUser = await findUserByEmail(email);
            if (existingUser) {
                req.flash('error', 'Email already registered');
                return res.redirect('/register');
            }
            await createUser(name, email, password);
            req.flash('success', 'Account created! Please log in.');
            res.redirect('/login');
        } catch (error) {
            console.error(error);
            req.flash('error', 'Registration failed. Try again.');
            res.redirect('/register');
        }
    }
];

export const logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};