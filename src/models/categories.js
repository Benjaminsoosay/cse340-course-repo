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

/**
 * INTERNAL: Assign a single category to a project in the junction table.
 * @param {number} categoryId - The category ID
 * @param {number} projectId - The project ID
 */
const assignCategoryToProject = async (categoryId, projectId) => {
    try {
        const query = `
            INSERT INTO project_categories (category_id, project_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
        `;
        await db.query(query, [categoryId, projectId]);
    } catch (error) {
        console.error(`Error assigning category ${categoryId} to project ${projectId}:`, error.message);
        throw error;
    }
};

/**
 * Update category assignments for a project.
 * Replaces all existing categories with the new list.
 * @param {number} projectId - The project ID
 * @param {number[]} categoryIds - Array of category IDs to assign
 */
export const updateCategoryAssignments = async (projectId, categoryIds) => {
    try {
        // Delete all existing assignments for this project
        const deleteQuery = `
            DELETE FROM project_categories
            WHERE project_id = $1;
        `;
        await db.query(deleteQuery, [projectId]);

        // Insert new assignments
        for (const categoryId of categoryIds) {
            await assignCategoryToProject(categoryId, projectId);
        }
    } catch (error) {
        console.error(`Error updating category assignments for project ${projectId}:`, error.message);
        throw error;
    }
};

// ==================== NEW MODEL FUNCTIONS FOR CREATE/EDIT CATEGORY ====================

/**
 * Creates a new category.
 * @param {string} name - Category name
 * @returns {number} The ID of the newly created category
 */
export const createCategory = async (name) => {
    const query = `
        INSERT INTO categories (name)
        VALUES ($1)
        RETURNING id;
    `;
    const result = await db.query(query, [name.trim()]);
    if (result.rows.length === 0) {
        throw new Error('Failed to create category');
    }
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new category with ID:', result.rows[0].id);
    }
    return result.rows[0].id;
};

/**
 * Updates an existing category.
 * @param {number} categoryId - Category ID
 * @param {string} name - New category name
 * @returns {number} The ID of the updated category
 */
export const updateCategory = async (categoryId, name) => {
    const query = `
        UPDATE categories
        SET name = $1
        WHERE id = $2
        RETURNING id;
    `;
    const result = await db.query(query, [name.trim(), categoryId]);
    if (result.rows.length === 0) {
        throw new Error('Category not found');
    }
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated category with ID:', categoryId);
    }
    return result.rows[0].id;
};