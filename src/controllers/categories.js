// src/controllers/categories.js

// ==================== IMPORTS ====================
import { body, validationResult } from 'express-validator';
import {
    getAllCategories,
    getCategoryById,
    getProjectsByCategoryId,
    getCategoriesForProject,
    updateCategoryAssignments,
    createCategory,
    updateCategory
} from '../models/categories.js';
import { getProjectDetails } from '../models/projects.js';

// ==================== VALIDATION RULES ====================
export const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage('Only letters, numbers, spaces, hyphens, and ampersands allowed')
];

// ==================== LIST ALL CATEGORIES (public) ====================
export const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.render('categories', {
            title: 'Service Categories',
            categories,
            user: req.session.user || null,
            isAdmin: req.session.user && req.session.user.role_name === 'admin'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== CATEGORY DETAILS PAGE (public) ====================
export const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/categories');
        }
        const projects = await getProjectsByCategoryId(categoryId);
        res.render('category-details', {
            title: category.name,
            category,
            projects,
            user: req.session.user || null,
            isAdmin: req.session.user && req.session.user.role_name === 'admin'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== ASSIGN CATEGORIES TO A PROJECT (admin) ====================
export const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        const project = await getProjectDetails(projectId);
        if (!project) {
            req.flash('error', 'Project not found');
            return res.redirect('/projects');
        }
        const allCategories = await getAllCategories();
        const assignedCategories = await getCategoriesForProject(projectId);
        const assignedIds = assignedCategories.map(c => c.category_id || c.id);
        res.render('assign-categories', {
            title: 'Assign Categories',
            project,
            allCategories,
            assignedIds,
            user: req.session.user || null
        });
    } catch (error) {
        next(error);
    }
};

export const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId || req.params.id;
        let selectedCategoryIds = req.body.categories || [];
        if (!Array.isArray(selectedCategoryIds)) {
            selectedCategoryIds = [selectedCategoryIds];
        }
        await updateCategoryAssignments(projectId, selectedCategoryIds);
        req.flash('success', 'Category assignments updated successfully.');
        res.redirect(`/projects/${projectId}`);
    } catch (error) {
        console.error('Error updating category assignments:', error);
        req.flash('error', 'There was an error updating categories.');
        res.redirect(`/assign-categories/${req.params.projectId || req.params.id}`);
    }
};

// ==================== CREATE NEW CATEGORY (admin) ====================
export const showCreateCategoryForm = async (req, res, next) => {
    try {
        res.render('new-category', { title: 'Add New Category' });
    } catch (error) {
        next(error);
    }
};

export const createCategoryHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => req.flash('error', err.msg));
        return res.redirect('/new-category');
    }
    try {
        const { name } = req.body;
        await createCategory(name);
        req.flash('success', 'Category created successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error creating category:', error);
        req.flash('error', 'There was an error creating the category.');
        res.redirect('/new-category');
    }
};

// ==================== EDIT CATEGORY (admin) ====================
export const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        if (!category) {
            req.flash('error', 'Category not found');
            return res.redirect('/categories');
        }
        res.render('edit-category', { title: 'Edit Category', category });
    } catch (error) {
        next(error);
    }
};

export const editCategoryHandler = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => req.flash('error', err.msg));
        return res.redirect(`/edit-category/${req.params.id}`);
    }
    try {
        const categoryId = req.params.id;
        const { name } = req.body;
        await updateCategory(categoryId, name);
        req.flash('success', 'Category updated successfully!');
        res.redirect('/categories');
    } catch (error) {
        console.error('Error updating category:', error);
        req.flash('error', 'There was an error updating the category.');
        res.redirect(`/edit-category/${req.params.id}`);
    }
};

// ==================== LEGACY ALIASES (optional, for backward compatibility) ====================
export const showNewCategoryForm = showCreateCategoryForm;
export const processNewCategoryForm = createCategoryHandler;
export const processEditCategoryForm = editCategoryHandler;