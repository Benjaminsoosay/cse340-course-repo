import { getUpcomingProjects, getProjectDetails, createProject, updateProject } from '../models/projects.js';
import { getCategoriesForProject } from '../models/categories.js';
import { getAllOrganizations } from '../models/organizations.js';
import { body, validationResult } from 'express-validator';
import { isVolunteer } from '../models/volunteerModel.js';   // ✅ function to check if user volunteers

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// ==================== VALIDATION RULES ====================
const projectValidation = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description must be less than 1000 characters'),
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required')
        .isLength({ max: 200 }).withMessage('Location must be less than 200 characters'),
    body('date')
        .notEmpty().withMessage('Date is required')
        .isISO8601().withMessage('Date must be a valid date format'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isInt().withMessage('Organization must be a valid integer')
];

// ==================== CONTROLLER FUNCTIONS ====================

// Controller for the main projects page (shows upcoming projects)
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });
    } catch (error) {
        next(error);
    }
};

// Controller for a single project details page (includes volunteer check)
const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        // Get categories for this project
        const categories = await getCategoriesForProject(projectId);
        
        // ✅ Check if logged-in user is a volunteer for this project
        let userIsVolunteer = false;
        const user = req.session.user || null;   // get user from session
        if (user && user.id) {
            userIsVolunteer = await isVolunteer(user.id, projectId);
        }
        
        const title = project.title || 'Project Details';
        res.render('project', { 
            title, 
            project, 
            categories, 
            userIsVolunteer,   // ✅ boolean flag for the view
            user               // ✅ full user object (may be null)
        });
    } catch (error) {
        next(error);
    }
};

// Controller to display the new project form (GET)
const showNewProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        const title = 'Add New Service Project';
        res.render('new-project', { title, organizations });
    } catch (error) {
        next(error);
    }
};

// Controller to process the new project form submission (POST)
const processNewProjectForm = async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect('/new-project');
    }

    try {
        const { title, description, location, date, organizationId } = req.body;
        const newProjectId = await createProject(title, description, location, date, organizationId);
        req.flash('success', 'New service project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating new project:', error);
        req.flash('error', 'There was an error creating the service project.');
        res.redirect('/new-project');
    }
};

// Controller to display the edit project form (GET)
const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        const organizations = await getAllOrganizations();
        const title = 'Edit Service Project';
        res.render('update-project', { title, project, organizations });
    } catch (error) {
        next(error);
    }
};

// Controller to process the edit project form submission (POST)
const processEditProjectForm = async (req, res, next) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        return res.redirect(`/edit-project/${req.params.id}`);
    }

    try {
        const projectId = req.params.id;
        const { title, description, location, date, organizationId } = req.body;
        await updateProject(projectId, title, description, location, date, organizationId);
        req.flash('success', 'Project updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating project:', error);
        req.flash('error', 'There was an error updating the project.');
        res.redirect(`/edit-project/${req.params.id}`);
    }
};

export { 
    showProjectsPage, 
    showProjectDetailsPage, 
    showNewProjectForm, 
    processNewProjectForm,
    showEditProjectForm,
    processEditProjectForm,
    projectValidation
};