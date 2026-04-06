import { getVolunteeredProjects, removeVolunteer } from '../models/projectModel.js';

// Show dashboard with user info and volunteered projects
export const showDashboard = async (req, res) => {
    try {
        // Assuming you store user info in session or res.locals after authentication
        const user = req.user; // or req.session.user, depending on your auth setup
        if (!user) {
            return res.redirect('/login');
        }

        const userId = user.id;
        const volunteeredProjects = await getVolunteeredProjects(userId);

        res.render('dashboard', {
            title: 'My Dashboard',
            name: user.name,
            email: user.email,
            role: user.role,
            isAdmin: user.role === 'admin',
            volunteeredProjects: volunteeredProjects
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).send('Internal Server Error');
    }
};

// Remove a volunteer from a project
export const removeVolunteerFromProject = async (req, res) => {
    try {
        const projectId = parseInt(req.params.projectId);
        const user = req.user; // logged-in user
        if (!user) {
            return res.redirect('/login');
        }

        await removeVolunteer(user.id, projectId);
        
        // Redirect back to dashboard after removal
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error removing volunteer:', error);
        res.status(500).send('Internal Server Error');
    }
};