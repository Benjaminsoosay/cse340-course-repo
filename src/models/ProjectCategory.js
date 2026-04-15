// models/ProjectCategory.js
import db from './db.js';

/**
 * Assign a category to a project.
 * @param {number} projectId - The project ID.
 * @param {number} categoryId - The category ID.
 * @returns {Promise<void>}
 */
export const addCategoryToProject = async (projectId, categoryId) => {
    const query = `
        INSERT INTO project_categories (project_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT (project_id, category_id) DO NOTHING
        RETURNING project_id;
    `;
    const result = await db.query(query, [projectId, categoryId]);
    if (result.rows.length === 0 && process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Category ${categoryId} already assigned to project ${projectId}`);
    } else if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Assigned category ${categoryId} to project ${projectId}`);
    }
};

/**
 * Remove a category from a project.
 * @param {number} projectId - The project ID.
 * @param {number} categoryId - The category ID.
 * @returns {Promise<void>}
 */
export const removeCategoryFromProject = async (projectId, categoryId) => {
    const query = `
        DELETE FROM project_categories
        WHERE project_id = $1 AND category_id = $2
        RETURNING project_id;
    `;
    const result = await db.query(query, [projectId, categoryId]);
    if (result.rows.length === 0) {
        throw new Error(`Category ${categoryId} not assigned to project ${projectId}`);
    }
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Removed category ${categoryId} from project ${projectId}`);
    }
};

/**
 * Get all category IDs for a given project.
 * @param {number} projectId - The project ID.
 * @returns {Promise<number[]>} Array of category IDs.
 */
export const getCategoryIdsForProject = async (projectId) => {
    const query = `
        SELECT category_id
        FROM project_categories
        WHERE project_id = $1
        ORDER BY category_id;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows.map(row => row.category_id);
};

/**
 * Get all project IDs for a given category.
 * @param {number} categoryId - The category ID.
 * @returns {Promise<number[]>} Array of project IDs.
 */
export const getProjectIdsForCategory = async (categoryId) => {
    const query = `
        SELECT project_id
        FROM project_categories
        WHERE category_id = $1
        ORDER BY project_id;
    `;
    const result = await db.query(query, [categoryId]);
    return result.rows.map(row => row.project_id);
};

/**
 * Replace all category assignments for a project with a new set.
 * @param {number} projectId - The project ID.
 * @param {number[]} categoryIds - Array of category IDs to assign.
 * @returns {Promise<void>}
 */
export const setProjectCategories = async (projectId, categoryIds) => {
    const client = await db.connect(); // Use a transaction if your db supports it
    try {
        await client.query('BEGIN');
        // Remove all existing assignments
        await client.query('DELETE FROM project_categories WHERE project_id = $1', [projectId]);
        // Insert new assignments
        for (const categoryId of categoryIds) {
            if (categoryId && !isNaN(parseInt(categoryId))) {
                await client.query(
                    'INSERT INTO project_categories (project_id, category_id) VALUES ($1, $2)',
                    [projectId, parseInt(categoryId)]
                );
            }
        }
        await client.query('COMMIT');
        if (process.env.ENABLE_SQL_LOGGING === 'true') {
            console.log(`Replaced categories for project ${projectId} with [${categoryIds.join(', ')}]`);
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Error setting categories for project ${projectId}:`, error.message);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Remove all category assignments for a project.
 * @param {number} projectId - The project ID.
 * @returns {Promise<void>}
 */
export const clearProjectCategories = async (projectId) => {
    const query = 'DELETE FROM project_categories WHERE project_id = $1';
    const result = await db.query(query, [projectId]);
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Removed all categories from project ${projectId} (${result.rowCount} assignments)`);
    }
};

/**
 * Check if a category is assigned to a project.
 * @param {number} projectId - The project ID.
 * @param {number} categoryId - The category ID.
 * @returns {Promise<boolean>} True if assigned.
 */
export const isCategoryAssignedToProject = async (projectId, categoryId) => {
    const query = `
        SELECT 1 FROM project_categories
        WHERE project_id = $1 AND category_id = $2
        LIMIT 1;
    `;
    const result = await db.query(query, [projectId, categoryId]);
    return result.rows.length > 0;
};