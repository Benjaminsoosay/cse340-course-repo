import db from './db.js';

// Get all projects (for reference, not used on main page now)
const getAllProjects = async () => {
    const query = `
        SELECT p.id, p.name, p.description, p.start_date, p.end_date,
               p.location, p.image_filename, o.name AS organization_name
        FROM projects p
        JOIN organization o ON p.organization_id = o.organization_id
        ORDER BY p.start_date DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

// Get upcoming projects (limited to given number)
const getUpcomingProjects = async (limit = 5) => {
    const query = `
        SELECT 
            p.id AS project_id,
            p.name AS title,
            p.description,
            p.start_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM projects p
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE p.start_date >= CURRENT_DATE
        ORDER BY p.start_date ASC
        LIMIT $1;
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
};

// Get details of a single project by ID
const getProjectDetails = async (projectId) => {
    const query = `
        SELECT 
            p.id AS project_id,
            p.name AS title,
            p.description,
            p.start_date AS date,
            p.location,
            p.organization_id,
            o.name AS organization_name
        FROM projects p
        JOIN organization o ON p.organization_id = o.organization_id
        WHERE p.id = $1;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Get projects by organization ID (used in organization details page)
const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT
            p.id AS project_id,
            p.organization_id,
            p.name,
            p.description,
            p.location,
            p.start_date,
            p.end_date,
            p.image_filename
        FROM projects p
        WHERE p.organization_id = $1
        ORDER BY p.start_date DESC;
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
};

export { getAllProjects, getUpcomingProjects, getProjectDetails, getProjectsByOrganizationId };