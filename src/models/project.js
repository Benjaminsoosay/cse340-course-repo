// src/models/project.js
import db from './db.js';

export const getAllProjects = async () => {
    const query = `
        SELECT p.project_id, p.name, p.description, p.location, p.date, p.organization_id,
               o.name as organization_name
        FROM project p
        LEFT JOIN organization o ON p.organization_id = o.organization_id
        ORDER BY p.name;
    `;
    const result = await db.query(query);
    return result.rows;
};

export const getProjectById = async (projectId) => {
    const query = `
        SELECT project_id, name, description, location, date, organization_id
        FROM project
        WHERE project_id = $1;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows[0] || null;
};

export const createProject = async (name, description, location, date, organization_id) => {
    const query = `
        INSERT INTO project (name, description, location, date, organization_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING project_id;
    `;
    const result = await db.query(query, [name, description, location, date, organization_id]);
    return result.rows[0].project_id;
};

export const updateProject = async (projectId, name, description, location, date, organization_id) => {
    const query = `
        UPDATE project
        SET name = $1, description = $2, location = $3, date = $4, organization_id = $5
        WHERE project_id = $6
        RETURNING project_id;
    `;
    const result = await db.query(query, [name, description, location, date, organization_id, projectId]);
    if (result.rows.length === 0) throw new Error('Project not found');
    return result.rows[0].project_id;
};

export const getProjectsByOrganizationId = async (organizationId) => {
    const query = `
        SELECT project_id, name, description, location, date
        FROM project
        WHERE organization_id = $1
        ORDER BY name;
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows;
};
