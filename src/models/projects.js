import db from './db.js';

/**
 * Get all projects along with their organization names
 * @returns {Promise<Array>} Array of project objects with organization name
 */
export const getAllProjects = async () => {
    try {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.description,
                p.start_date,
                p.end_date,
                p.location,
                p.image_filename,
                o.name AS organization_name
            FROM projects p
            JOIN organization o ON p.organization_id = o.organization_id
            ORDER BY p.start_date DESC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        console.error('Error fetching projects:', error.message);
        throw error;
    }
};