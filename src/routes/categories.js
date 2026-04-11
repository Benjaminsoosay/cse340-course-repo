// app.js (or server.js)
const express = require('express');
const session = require('express-session'); // if you use sessions
const app = express();

// ... other middleware (body-parser, static files, etc.)

// Import route files
const organizationRoutes = require('./routes/organizations');
const projectRoutes = require('./routes/projects');
const categoryRoutes = require('./routes/categories');

// Mount routes
app.use('/organizations', organizationRoutes);
app.use('/projects', projectRoutes);
app.use('/categories', categoryRoutes);

// ... 