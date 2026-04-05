// Import needed model functions
import { getAllCategories, getCategoryById, getProjectsByCategoryId } from '../models/categories.js';

// Controller for categories list page
const showCategoriesPage = async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        const title = 'Service Categories';
        res.render('categories/index', { title, categories });
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
        res.render('categories/details', { title, category, projects });
    } catch (error) {
        next(error);
    }
};

// Export controller functions
export { showCategoriesPage, showCategoryDetailsPage };