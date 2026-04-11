// middleware/auth.js

/**
 * Middleware to require a logged-in user.
 * Redirects to /login with a flash message if not authenticated.
 */
export function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'You must be logged in to do that.');
    res.redirect('/login');
}

/**
 * Middleware factory to require a specific role.
 * First checks login, then checks role_name.
 * @param {string} role - The required role (e.g., 'admin')
 * @returns {Function} Express middleware
 */
export function requireRole(role) {
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
}

// Optional alias for backward compatibility
export const checkLogin = requireLogin;