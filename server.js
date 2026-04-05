import dotenv from 'dotenv';
import express from 'express';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';
import { fileURLToPath } from 'url';
import { testConnection } from './src/models/db.js';
import router from './src/controllers/routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'development';

// ==================== VIEW ENGINE & STATIC FILES ====================

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// ==================== MIDDLEWARE (CORRECT ORDER) ====================

// 1. Session management (must be first)
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

// 2. Flash messages (depends on session)
app.use(flash());

// 3. Make flash messages available to all templates
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    res.locals.error = req.flash('error'); // for compatibility
    next();
});

// 4. Logging middleware (development only)
app.use((req, res, next) => {
    if (NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url}`);
    }
    next();
});

// 5. Make NODE_ENV, login status, user data, and admin flag available to all templates
app.use((req, res, next) => {
    // Set isLoggedIn based on session
    res.locals.isLoggedIn = !!(req.session && req.session.user);
    if (res.locals.isLoggedIn) {
        res.locals.user = req.session.user;
        // Compute isAdmin flag from the user's role_name
        res.locals.isAdmin = req.session.user.role_name === 'admin';
    } else {
        res.locals.isAdmin = false;
    }
    res.locals.NODE_ENV = NODE_ENV;
    next();
});

// 6. Body parsing middleware (handles POST data)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use(router);   // ✅ routes come after all preparatory middleware

// ==================== ERROR HANDLING ====================

// Catch-all for 404 errors (must be after all routes)
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler (four‑parameter signature)
app.use((err, req, res, next) => {
    console.error('Error occurred:', err.message);
    console.error('Stack trace:', err.stack);

    const status = err.status || 500;
    const template = status === 404 ? '404' : '500';

    const context = {
        title: status === 404 ? 'Page Not Found' : 'Server Error',
        error: err.message,
        stack: err.stack
    };

    res.status(status).render(`errors/${template}`, context);
});

// ==================== START SERVER ====================
app.listen(PORT, async () => {
    try {
        await testConnection();
        console.log(`Server running at http://127.0.0.1:${PORT}`);
        console.log(`Environment: ${NODE_ENV}`);
    } catch (error) {
        console.error('Error connecting to the database:', error);
        process.exit(1);
    }
});