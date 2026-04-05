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

/**
 * Get a single category by ID
 * @param {number} categoryId - The category ID
 * @returns {Promise<Object|null>} Category object or null if not found
 */
export const getCategoryById = async (categoryId) => {
    try {
        const query = `SELECT id, name FROM categories WHERE id = $1;`;
        const result = await db.query(query, [categoryId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error(`Error fetching category ${categoryId}:`, error.message);
        throw error;
    }
};

/**
 * Get all projects for a given category
 * @param {number} categoryId - The category ID
 * @returns {Promise<Array>} Array of project objects with project details and organization name
 */
export const getProjectsByCategoryId = async (categoryId) => {
    try {
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
            JOIN project_categories pc ON p.id = pc.project_id
            JOIN organization o ON p.organization_id = o.organization_id
            WHERE pc.category_id = $1
            ORDER BY p.start_date ASC;
        `;
        const result = await db.query(query, [categoryId]);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching projects for category ${categoryId}:`, error.message);
        throw error;
    }
};

/**
 * Get all categories for a specific project
 * @param {number} projectId - The project ID
 * @returns {Promise<Array>} Array of category objects
 */
export const getCategoriesForProject = async (projectId) => {
    try {
        const query = `
            SELECT c.id, c.name
            FROM categories c
            JOIN project_categories pc ON c.id = pc.category_id
            WHERE pc.project_id = $1
            ORDER BY c.name;
        `;
        const result = await db.query(query, [projectId]);
        return result.rows;
    } catch (error) {
        console.error(`Error fetching categories for project ${projectId}:`, error.message);
        throw error;
    }
};