// src/models/volunteerModel.js
import db from './db.js';

/**
 * Add a volunteer to a project
 * @param {number} userId - ID of the user
 * @param {number} projectId - ID of the project
 * @returns {Promise<object>} The inserted volunteer record
 */
export async function addVolunteer(userId, projectId) {
    // Validate inputs
    if (!userId || !projectId) {
        throw new Error('User ID and Project ID are required');
    }

    const query = `
        INSERT INTO project_volunteers (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, project_id) DO NOTHING
        RETURNING *;
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rows[0]; // May be undefined if already existed
}

/**
 * Remove a volunteer from a project
 * @param {number} userId - ID of the user
 * @param {number} projectId - ID of the project
 */
export async function removeVolunteer(userId, projectId) {
    if (!userId || !projectId) {
        throw new Error('User ID and Project ID are required');
    }

    const query = `
        DELETE FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2;
    `;
    await db.query(query, [userId, projectId]);
}

/**
 * Get all projects a user has volunteered for
 * @param {number} userId - ID of the user
 * @returns {Promise<Array>} List of project objects
 */
export async function getUserVolunteerProjects(userId) {
    if (!userId) {
        throw new Error('User ID is required');
    }

    const query = `
        SELECT p.*
        FROM projects p
        JOIN project_volunteers pv ON p.id = pv.project_id
        WHERE pv.user_id = $1
        ORDER BY pv.volunteered_at DESC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
}

/**
 * Check if a user is a volunteer for a specific project
 * @param {number} userId - ID of the user
 * @param {number} projectId - ID of the project
 * @returns {Promise<boolean>} True if volunteer, false otherwise
 */
export async function isVolunteer(userId, projectId) {
    if (!userId || !projectId) {
        return false; // Invalid inputs cannot be volunteers
    }

    const query = `
        SELECT 1 FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2;
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rowCount > 0;
}