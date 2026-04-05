import { getUpcomingProjects, getProjectDetails } from '../models/projects.js';
import { getCategoriesForProject } from '../models/categories.js';

const NUMBER_OF_UPCOMING_PROJECTS = 5;

// Controller for the main projects page (shows upcoming projects)
const showProjectsPage = async (req, res, next) => {
    try {
        const projects = await getUpcomingProjects(NUMBER_OF_UPCOMING_PROJECTS);
        const title = 'Upcoming Service Projects';
        res.render('projects', { title, projects });  // ✅ correct view name
    } catch (error) {
        next(error);
    }
};

// Controller for a single project details page
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
        const title = project.title || 'Project Details';
        res.render('project', { title, project, categories });  // ✅ correct view name
    } catch (error) {
        next(error);
    }
};

export { showProjectsPage, showProjectDetailsPage };