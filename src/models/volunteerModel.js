// src/models/volunteerModel.js
import db from './db.js';

export async function addVolunteer(userId, projectId) {
    await db.query(
        `INSERT INTO project_volunteers (user_id, project_id)
         VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
        [userId, projectId]
    );
}

export async function removeVolunteer(userId, projectId) {
    await db.query(
        `DELETE FROM project_volunteers
         WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
    );
}

export async function getUserVolunteerProjects(userId) {
    const result = await db.query(
        `SELECT p.*
         FROM projects p
         JOIN project_volunteers pv ON p.id = pv.project_id
         WHERE pv.user_id = $1
         ORDER BY pv.volunteered_at DESC`,
        [userId]
    );
    return result.rows;
}

export async function isVolunteer(userId, projectId) {
    const result = await db.query(
        `SELECT 1 FROM project_volunteers
         WHERE user_id = $1 AND project_id = $2`,
        [userId, projectId]
    );
    return result.rowCount > 0;
}