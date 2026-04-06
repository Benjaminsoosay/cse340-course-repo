import { addVolunteer, removeVolunteer, getUserVolunteerProjects } from '../models/volunteerModel.js';

export async function handleAddVolunteer(req, res) {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    await addVolunteer(userId, projectId);
    req.flash('success', 'You are now a volunteer for this project.');
    res.redirect(`/project/${projectId}`);
}

export async function handleRemoveVolunteer(req, res) {
    const projectId = req.params.id;
    const userId = req.session.user.id;
    await removeVolunteer(userId, projectId);
    req.flash('success', 'You have been removed as a volunteer.');
    res.redirect(`/project/${projectId}`);
}

export async function showVolunteeringPage(req, res) {
    const userId = req.session.user.id;
    const projects = await getUserVolunteerProjects(userId);
    res.render('volunteering', { 
        title: 'My Volunteering Projects',
        projects, 
        user: req.session.user 
    });
}