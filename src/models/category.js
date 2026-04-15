// src/models/category.js
import db from './db.js';

export const getAllCategories = async () => {
    const query = `SELECT category_id, name FROM category ORDER BY name;`;
    const result = await db.query(query);
    return result.rows;
};

export const getCategoryById = async (categoryId) => {
    const query = `SELECT category_id, name FROM category WHERE category_id = $1;`;
    const result = await db.query(query, [categoryId]);
    return result.rows[0] || null;
};

export const createCategory = async (name) => {
    const query = `INSERT INTO category (name) VALUES ($1) RETURNING category_id;`;
    const result = await db.query(query, [name]);
    return result.rows[0].category_id;
};

export const updateCategory = async (categoryId, name) => {
    const query = `UPDATE category SET name = $1 WHERE category_id = $2 RETURNING category_id;`;
    const result = await db.query(query, [name, categoryId]);
    if (result.rows.length === 0) throw new Error('Category not found');
    return result.rows[0].category_id;
};

export const getCategoriesForProject = async (projectId) => {
    const query = `
        SELECT c.category_id, c.name
        FROM category c
        JOIN project_category pc ON c.category_id = pc.category_id
        WHERE pc.project_id = $1
        ORDER BY c.name;
    `;
    const result = await db.query(query, [projectId]);
    return result.rows;
};

export const updateCategoryAssignments = async (projectId, categoryIds) => {
    // Remove all existing assignments
    await db.query(`DELETE FROM project_category WHERE project_id = $1`, [projectId]);
    // Insert new ones
    for (let catId of categoryIds) {
        await db.query(`INSERT INTO project_category (project_id, category_id) VALUES ($1, $2)`, [projectId, catId]);
    }
};
