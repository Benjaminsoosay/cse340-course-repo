export function requireLogin(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'You must be logged in to do that.');
    res.redirect('/login');
}