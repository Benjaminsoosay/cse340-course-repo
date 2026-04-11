// routes/index.js (or routes/projectRoutes.js)

import express from 'express';
import { handleAddVolunteer, handleRemoveVolunteer, showVolunteeringPage } from './volunteerController.js';
import { requireLogin } from '../middleware/auth.js'; // adjust path if needed

const router = express.Router();

// ==================== HOME PAGE ====================
const showHomePage = (req, res) => {
    const title = 'Home';
    res.render('home', { title });
};

// ==================== ROUTES ====================

// Home route
router.get('/', showHomePage);

// Volunteer routes (must be logged in)
router.post('/project/:id/volunteer', requireLogin, handleAddVolunteer);
router.post('/project/:id/remove-volunteer', requireLogin, handleRemoveVolunteer);
router.get('/dashboard/volunteering', requireLogin, showVolunteeringPage);

// ==================== EXPORT ====================
export default router;