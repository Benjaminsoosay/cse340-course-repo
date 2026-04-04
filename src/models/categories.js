import db from './db.js';

/**
 * Get all categories from the database
 * @returns {Promise<Array>} Array of category objects with id and name
 */
export const getAllCategories = async () => {
    try {
        const result = await db.query('SELECT id, name FROM categories ORDER BY name');
        return result.rows;
    } catch (error) {
        console.error('Error fetching categories:', error.message);
        throw error;
    }
};