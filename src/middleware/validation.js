import { body, validationResult } from 'express-validator';

// Organization validation rules
export const validateOrganization = [
    body('name').trim().notEmpty().withMessage('Organization name is required')
        .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),
    body('description').trim().notEmpty().withMessage('Description is required')
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
    body('contactEmail').normalizeEmail().isEmail().withMessage('Valid email is required'),
    body('logoFilename').optional().isString().withMessage('Invalid logo filename')
];

// Project validation rules
export const validateProject = [
    body('name').trim().notEmpty().withMessage('Project name is required')
        .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('organizationId').isInt().withMessage('Valid organization is required'),
    body('startDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid start date'),
    body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
    body('location').optional().trim().isLength({ max: 255 })
];

// Category validation rules
export const validateCategory = [
    body('name').trim().notEmpty().withMessage('Category name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters')
        .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage('Name can only contain letters, numbers, spaces, hyphens, and ampersands')
];

// Check validation result and redirect with flash errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(err => req.flash('error', err.msg));
        return res.redirect('back');
    }
    next();
};