import { addVolunteer, removeVolunteer, getUserVolunteerProjects, isVolunteer } from '../models/volunteerModel.js';

// Handle user volunteering for a project
export async function handleAddVolunteer(req, res) {
    try {
        // ✅ Get user_id from session – adjust property name if needed
        const userId = req.session.user?.user_id || req.session.user?.id;
        if (!userId) {
            req.flash('error', 'You must be logged in to volunteer.');
            return res.redirect('/login');
        }

        const projectId = req.params.id;

        // Optional: check if already volunteering (prevents duplicate entries)
        const already = await isVolunteer(userId, projectId);
        if (already) {
            req.flash('error', 'You are already volunteering for this project.');
            return res.redirect(`/project/${projectId}`);
        }

        await addVolunteer(userId, projectId);
        req.flash('success', 'You are now a volunteer for this project.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error adding volunteer:', error);
        req.flash('error', 'Unable to volunteer. Please try again.');
        res.redirect(`/project/${req.params.id}`);
    }
}

// Handle removing a volunteer
export async function handleRemoveVolunteer(req, res) {
    try {
        const userId = req.session.user?.user_id || req.session.user?.id;
        if (!userId) {
            req.flash('error', 'You must be logged in to remove yourself.');
            return res.redirect('/login');
        }

        const projectId = req.params.id;
        await removeVolunteer(userId, projectId);
        req.flash('success', 'You have been removed as a volunteer.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error removing volunteer:', error);
        req.flash('error', 'Unable to remove you from the project.');
        res.redirect(`/project/${req.params.id}`);
    }
}

// Display the volunteering dashboard
export async function showVolunteeringPage(req, res) {
    try {
        const userId = req.session.user?.user_id || req.session.user?.id;
        if (!userId) {
            req.flash('error', 'You must be logged in to view your volunteering projects.');
            return res.redirect('/login');
        }

        const projects = await getUserVolunteerProjects(userId);
        res.render('volunteering', {
            title: 'My Volunteering Projects',
            projects,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error loading volunteering page:', error);
        req.flash('error', 'Unable to load your volunteering projects.');
        res.redirect('/dashboard');
    }
}