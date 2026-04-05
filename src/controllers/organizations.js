// Import model functions
import { getAllOrganizations, getOrganizationDetails, createOrganization, updateOrganization } from '../models/organizations.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import { body, validationResult } from 'express-validator';

// ==================== VALIDATION RULES ====================
const organizationValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Organization name is required')
        .isLength({ min: 3, max: 150 })
        .withMessage('Organization name must be between 3 and 150 characters'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Organization description is required')
        .isLength({ max: 500 })
        .withMessage('Organization description cannot exceed 500 characters'),
    body('contactEmail')
        .normalizeEmail()
        .notEmpty()
        .withMessage('Contact email is required')
        .isEmail()
        .withMessage('Please provide a valid email address')
];

// ==================== CONTROLLER FUNCTIONS ====================
// Controller for the list of all organizations
const showOrganizationsPage = async (req, res) => {
    const organizations = await getAllOrganizations();
    const title = 'Our Partner Organizations';
    res.render('organizations', { title, organizations });
};

// Controller for a single organization's details page
const showOrganizationDetailsPage = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);
    const projects = await getProjectsByOrganizationId(organizationId);
    const title = 'Organization Details';
    res.render('organization', { title, organizationDetails, projects });
};

// Controller for the "Add New Organization" form (GET)
const showNewOrganizationForm = async (req, res) => {
    const title = 'Add New Organization';
    res.render('new-organization', { title });
};

// Controller to process the form submission (POST)
const processNewOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors and add to flash
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        // Redirect back to the new organization form
        return res.redirect('/new-organization');
    }

    // No validation errors – create the organization
    const { name, description, contactEmail } = req.body;
    const logoFilename = 'placeholder-logo.png';

    const organizationId = await createOrganization(name, description, contactEmail, logoFilename);
    
    // Set a success flash message
    req.flash('success', 'Organization added successfully!');
    
    res.redirect(`/organization/${organizationId}`);
};

// Controller to display the edit organization form (GET)
const showEditOrganizationForm = async (req, res) => {
    const organizationId = req.params.id;
    const organizationDetails = await getOrganizationDetails(organizationId);

    const title = 'Edit Organization';
    res.render('edit-organization', { title, organizationDetails });
};

// Controller to process the edit organization form submission (POST)
const processEditOrganizationForm = async (req, res) => {
    // Check for validation errors
    const results = validationResult(req);
    if (!results.isEmpty()) {
        // Validation failed - loop through errors and add to flash
        results.array().forEach((error) => {
            req.flash('error', error.msg);
        });
        // Redirect back to the edit organization form
        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    // No validation errors – update the organization
    const organizationId = req.params.id;
    const { name, description, contactEmail, logoFilename } = req.body;

    await updateOrganization(organizationId, name, description, contactEmail, logoFilename);
    
    // Set a success flash message
    req.flash('success', 'Organization updated successfully!');

    res.redirect(`/organization/${organizationId}`);
};

// ==================== EXPORTS ====================
export {
    showOrganizationsPage,
    showOrganizationDetailsPage,
    showNewOrganizationForm,
    processNewOrganizationForm,
    organizationValidation,
    showEditOrganizationForm,
    processEditOrganizationForm
};