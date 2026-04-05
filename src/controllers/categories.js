// Import needed model functions
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
import { body, validationResult } from 'express-validator';

// ==================== VALIDATION RULES ====================
export const categoryValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
];

// ==================== EXISTING CONTROLLER FUNCTIONS ====================
// Controller for categories list page
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories', { title, categories });
    } catch (error) {
        next(error);
    }
};

// Controller for single category details page
const showCategoryDetailsPage = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        
        const projects = await getProjectsByCategoryId(categoryId);
        const title = `Category: ${category.name}`;
        res.render('category', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

// Controller to display the assign categories form (GET)
const showAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        
        const projectDetails = await getProjectDetails(projectId);
        if (!projectDetails) {
            const err = new Error('Project not found');
            err.status = 404;
            return next(err);
        }
        
        const categories = await getAllCategories();
        const assignedCategories = await getCategoriesForProject(projectId);
        
        const title = 'Assign Categories to Project';
        res.render('assign-categories', { 
            title, 
            projectId, 
            projectDetails, 
            categories, 
            assignedCategories 
        });
    } catch (error) {
        next(error);
    }
};

// Controller to process the assign categories form submission (POST)
const processAssignCategoriesForm = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const selectedCategoryIds = req.body.categoryIds || [];
        
        const categoryIdsArray = Array.isArray(selectedCategoryIds) ? selectedCategoryIds : [selectedCategoryIds];
        await updateCategoryAssignments(projectId, categoryIdsArray);
        
        req.flash('success', 'Categories updated successfully.');
        res.redirect(`/project/${projectId}`);
    } catch (error) {
        console.error('Error updating category assignments:', error);
        req.flash('error', 'There was an error updating categories.');
        res.redirect(`/project/${req.params.projectId}`);
    }
};

// ==================== NEW CATEGORY CONTROLLERS (CREATE / EDIT) ====================
// Display the "Create New Category" form (GET)
const showNewCategoryForm = async (req, res, next) => {
    try {
        const title = 'Add New Category';
        res.render('new-category', { title });
    } catch (error) {
        next(error);
    }
};

// Process creation of a new category (POST) – uses validationResult
const processNewCategoryForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
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

// Display the "Edit Category" form (GET)
const showEditCategoryForm = async (req, res, next) => {
    try {
        const categoryId = req.params.id;
        const category = await getCategoryById(categoryId);
        if (!category) {
            const err = new Error('Category not found');
            err.status = 404;
            return next(err);
        }
        const title = 'Edit Category';
        res.render('edit-category', { title, category });
    } catch (error) {
        next(error);
    }
};

// Process update of an existing category (POST) – uses validationResult
const processEditCategoryForm = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach((error) => {
            req.flash('error', error.msg);
        });
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

// ==================== EXPORT ALL CONTROLLERS ====================
// NOTE: categoryValidation is already exported at the top, do NOT include it here.
export { 
    showCategoriesPage, 
    showCategoryDetailsPage,
    showAssignCategoriesForm,
    processAssignCategoriesForm,
    showNewCategoryForm,
    processNewCategoryForm,
    showEditCategoryForm,
    processEditCategoryForm
};