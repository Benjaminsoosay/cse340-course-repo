// src/controllers/projects.js

// ==================== IMPORTS ====================
import { body, validationResult } from 'express-validator';
import { 
    getUpcomingProjects, 
    getProjectDetails, 
    createProject, 
    updateProject, 
    deleteAllProjectCategories, 
    addCategoryToProject 
} from '../models/projects.js';
import { getCategoriesForProject, getAllCategories } from '../models/categories.js';
import { getAllOrganizations } from '../models/organization.js';
import { isVolunteer, addVolunteer as addVolunteerToDb, removeVolunteer as removeVolunteerFromDb } from '../models/volunteerModel.js';

// ==================== CONSTANTS ====================
const NUMBER_OF_UPCOMING_PROJECTS = 5;

// ==================== VALIDATION RULES ====================
export const projectValidation = [
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

// ----- LIST UPCOMING PROJECTS (Projects page) -----
export const showProjectsPage = async (req, res, next) => {
    try {
        let projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        
        // Normalize property names for consistent view rendering
        projects = projects.map(project => ({
            ...project,
            id: project.project_id || project.id,
            name: project.title || project.name
        }));
        
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects, user: req.session.user || null });
    } catch (error) {
        next(error);
    }
};

// ----- SINGLE PROJECT DETAILS (with volunteer check & categories) -----
export const showProjectDetailsPage = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        let project = await getProjectDetails(projectId);
        
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        // Normalize property names
        project = {
            ...project,
            id: project.project_id || project.id,
            name: project.title || project.name
        };
        
        // Get categories for this project
        const assignedCategories = await getCategoriesForProject(projectId);
        
        // Check if logged-in user is a volunteer for this project
        let isVolunteerFlag = false;
        const user = req.session.user || null;
        if (user && user.user_id) {
            isVolunteerFlag = await isVolunteer(user.user_id, projectId);
        }
        
        const isAdmin = user && user.role_name === 'admin';
        
        const title = project.name;
        res.render('project', { 
            title, 
            project, 
            assignedCategories,
            userIsVolunteer: isVolunteerFlag,
            isAdmin,
            user
        });
    } catch (error) {
        next(error);
    }
};

// ----- CREATE PROJECT -----
export const showCreateProjectForm = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('new-project', { title: 'Add New Project', project: null, organizations });
    } catch (error) {
        next(error);
    }
};

export const createProjectHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => req.flash('error', err.msg));
        return res.redirect('/new-project');
    }

    try {
        const { title, description, location, date, organizationId } = req.body;
        const newProjectId = await createProject(title, description, location, date, organizationId);
        req.flash('success', 'Project created successfully!');
        res.redirect(`/project/${newProjectId}`);
    } catch (error) {
        console.error('Error creating project:', error);
        req.flash('error', 'There was an error creating the project.');
        res.redirect('/new-project');
    }
};

// ----- EDIT PROJECT -----
export const showEditProjectForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        let project = await getProjectDetails(projectId);
        if (!project) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        project = {
            ...project,
            id: project.project_id || project.id,
            name: project.title || project.name
        };
        const organizations = await getAllOrganizations();
        res.render('update-project', { title: 'Edit Project', project, organizations });
    } catch (error) {
        next(error);
    }
};

export const editProjectHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => req.flash('error', err.msg));
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

// ----- ASSIGN CATEGORIES TO PROJECT -----
export const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        let project = await getProjectDetails(projectId);
        if (!project) {
            req.flash('error', 'Project not found');
            return res.redirect('/projects');
        }
        project = {
            ...project,
            id: project.project_id || project.id,
            name: project.title || project.name
        };
        const allCategories = await getAllCategories();
        const assignedCategories = await getCategoriesForProject(projectId);
        const assignedIds = assignedCategories.map(c => c.id || c.category_id);
        res.render('assign-categories', { title: 'Assign Categories to Project', project, allCategories, assignedIds });
    } catch (error) {
        next(error);
    }
};

export const assignCategoriesHandler = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        let selectedCategories = req.body.categories || [];
        if (!Array.isArray(selectedCategories)) {
            selectedCategories = [selectedCategories];
        }
        
        await deleteAllProjectCategories(projectId);
        for (let catId of selectedCategories) {
            await addCategoryToProject(projectId, catId);
        }
        
        req.flash('success', 'Category assignments updated successfully!');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating category assignments:', error);
        req.flash('error', 'There was an error updating category assignments.');
        res.redirect(`/assign-categories/${req.params.id}`);
    }
};

// ==================== VOLUNTEER MANAGEMENT ====================
export const addVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;

        await addVolunteerToDb(userId, projectId);
        req.flash('success', 'You are now volunteering for this project.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error adding volunteer:', error);
        req.flash('error', 'Unable to volunteer for this project.');
        res.redirect(`/project/${projectId}`);
    }
};

export const removeVolunteer = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.user.user_id;

        await removeVolunteerFromDb(userId, projectId);
        req.flash('success', 'You have been removed from this project.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error removing volunteer:', error);
        req.flash('error', 'Unable to remove you from this project.');
        res.redirect(`/project/${projectId}`);
    }
};

// ==================== LEGACY ALIASES ====================
export const showNewProjectForm = showCreateProjectForm;
export const processNewProjectForm = createProjectHandler;
export const processEditProjectForm = editProjectHandler;