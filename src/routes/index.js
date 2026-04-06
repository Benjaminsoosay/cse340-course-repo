import { handleAddVolunteer, handleRemoveVolunteer, showVolunteeringPage } from './volunteerController.js';
import { requireLogin } from '../middleware/auth.js'; // adjust path if needed

// Volunteer routes (protected by requireLogin)
router.post('/projects/:id/volunteer', requireLogin, handleAddVolunteer);
router.post('/projects/:id/remove-volunteer', requireLogin, handleRemoveVolunteer);
router.get('/dashboard/volunteering', requireLogin, showVolunteeringPage);