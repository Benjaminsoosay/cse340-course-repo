// server.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import mainRoutes from './src/routes/index.js';
import { testConnection } from './models/db.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ========== FLASH MIDDLEWARE (embedded) ==========
const flashMiddleware = (req, res, next) => {
    req.flash = function(type, message) {
        if (!req.session.flash) {
            req.session.flash = { success: [], error: [], warning: [], info: [] };
        }
        if (type && message) {
            if (!req.session.flash[type]) req.session.flash[type] = [];
            req.session.flash[type].push(message);
            return;
        }
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }
        const allMessages = req.session.flash || { success: [], error: [], warning: [], info: [] };
        req.session.flash = { success: [], error: [], warning: [], info: [] };
        return allMessages;
    };
    next();
};

const flashLocals = (req, res, next) => {
    res.locals.flash = req.flash;
    next();
};

const flash = (req, res, next) => {
    flashMiddleware(req, res, () => flashLocals(req, res, next));
};
// ================================================

// Session middleware (must come before flash)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Flash middleware
app.use(flash);

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// ========== VIEW ENGINE SETUP ==========
app.set('view engine', 'ejs');
// Now looks in src/views for templates
app.set('views', path.join(__dirname, 'src', 'views'));
// =======================================

// Make user available to all templates
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// ✅ Make NODE_ENV available to all templates (fixes footer.ejs error)
app.use((req, res, next) => {
    res.locals.NODE_ENV = process.env.NODE_ENV;
    next();
});

// Routes
app.use('/', mainRoutes);

// Test database connection
testConnection().catch(console.error);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});