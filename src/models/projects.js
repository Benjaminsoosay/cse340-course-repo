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

/**
 * Creates a new project in the database.
 * @param {string} title - The name/title of the project.
 * @param {string} description - Project description.
 * @param {string} location - Project location.
 * @param {string|Date} date - Start date (will be stored as start_date).
 * @param {number} organizationId - ID of the associated organization.
 * @returns {number} The ID of the newly created project.
 */
const createProject = async (title, description, location, date, organizationId) => {
    const query = `
        INSERT INTO projects (name, description, location, start_date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id;
    `;
    const query_params = [title, description, location, date, organizationId];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Failed to create project');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new project with ID:', result.rows[0].id);
    }

    return result.rows[0].id;
};

/**
 * Updates an existing project in the database.
 * @param {number} projectId - The ID of the project to update.
 * @param {string} title - Updated title.
 * @param {string} description - Updated description.
 * @param {string} location - Updated location.
 * @param {string|Date} date - Updated start date.
 * @param {number} organizationId - Updated organization ID.
 * @returns {number} The ID of the updated project.
 */
const updateProject = async (projectId, title, description, location, date, organizationId) => {
    const query = `
        UPDATE projects
        SET name = $1, description = $2, location = $3, start_date = $4, organization_id = $5
        WHERE id = $6
        RETURNING id;
    `;
    const query_params = [title, description, location, date, organizationId, projectId];
    const result = await db.query(query, query_params);

    if (result.rows.length === 0) {
        throw new Error('Project not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated project with ID:', projectId);
    }

    return result.rows[0].id;
};

export { getAllProjects, getUpcomingProjects, getProjectDetails, getProjectsByOrganizationId, createProject, updateProject };