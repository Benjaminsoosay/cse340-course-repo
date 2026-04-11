// src/controllers/organizations.js

import { body, validationResult } from 'express-validator';
import {
    getAllOrganizations,
    getOrganizationDetails,
    createOrganization as insertOrg,
    updateOrganization as updateOrg
} from '../models/organization.js';
import { getProjectsByOrganizationId } from '../models/projects.js';
import db from '../models/db.js';

// ==================== VALIDATION RULES ====================
export const organizationValidation = [
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

// ==================== LIST PAGE (public) ====================
export const showOrganizationsPage = async (req, res, next) => {
    try {
        const organizations = await getAllOrganizations();
        res.render('organizations', {
            title: 'Our Partner Organizations',
            organizations,
            isAdmin: req.session.user && req.session.user.role_name === 'admin'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== DETAIL PAGE (public) ====================
export const showOrganizationDetailsPage = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        if (!organizationDetails) {
            req.flash('error', 'Organization not found');
            return res.redirect('/organizations');
        }
        const projects = await getProjectsByOrganizationId(organizationId);
        res.render('organization-details', {   // ✅ matches your view name
            title: organizationDetails.name,
            organization: organizationDetails,  // consistent naming for the template
            projects,
            isAdmin: req.session.user && req.session.user.role_name === 'admin'
        });
    } catch (error) {
        next(error);
    }
};

// ==================== CREATE ORGANIZATION (admin only) ====================
// GET – show form
export const showNewOrganizationForm = async (req, res, next) => {
    try {
        res.render('new-organization', { title: 'Add New Organization' });
    } catch (error) {
        next(error);
    }
};

// POST – process creation
export const createOrganization = async (req, res, next) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(err => req.flash('error', err.msg));
        return res.redirect('/new-organization');
    }

    try {
        const { name, description, contactEmail } = req.body;
        const logoFilename = 'placeholder-logo.png';
        await insertOrg(name, description, contactEmail, logoFilename);
        req.flash('success', 'Organization created successfully.');
        res.redirect('/organizations');
    } catch (error) {
        console.error('Error creating organization:', error);
        req.flash('error', 'Failed to create organization.');
        res.redirect('/new-organization');
    }
};

// ==================== EDIT ORGANIZATION (admin only) ====================
// GET – show edit form
export const showEditOrganizationForm = async (req, res, next) => {
    try {
        const organizationId = req.params.id;
        const organizationDetails = await getOrganizationDetails(organizationId);
        if (!organizationDetails) {
            req.flash('error', 'Organization not found');
            return res.redirect('/organizations');
        }
        res.render('edit-organization', {
            title: 'Edit Organization',
            organization: organizationDetails   // consistent variable name
        });
    } catch (error) {
        next(error);
    }
};

// POST – process update
export const updateOrganization = async (req, res, next) => {
    const results = validationResult(req);
    if (!results.isEmpty()) {
        results.array().forEach(err => req.flash('error', err.msg));
        return res.redirect(`/edit-organization/${req.params.id}`);
    }

    try {
        const organizationId = req.params.id;
        const { name, description, contactEmail, logoFilename } = req.body;
        let finalLogo = logoFilename;
        if (!finalLogo) {
            const existing = await getOrganizationDetails(organizationId);
            finalLogo = existing ? existing.logo_filename : 'placeholder-logo.png';
        }
        await updateOrg(organizationId, name, description, contactEmail, finalLogo);
        req.flash('success', 'Organization updated successfully.');
        res.redirect(`/organization/${organizationId}`);
    } catch (error) {
        console.error('Error updating organization:', error);
        req.flash('error', 'Failed to update organization.');
        res.redirect(`/edit-organization/${req.params.id}`);
    }
};

// ==================== DELETE ORGANIZATION (admin only) ====================
export const deleteOrganization = async (req, res, next) => {
    const orgId = req.params.id;
    try {
        // Check if organization exists
        const checkQuery = 'SELECT organization_id FROM organization WHERE organization_id = $1';
        const checkResult = await db.query(checkQuery, [orgId]);
        if (checkResult.rows.length === 0) {
            req.flash('error', 'Organization not found.');
            return res.redirect('/organizations');
        }

        // Delete (projects will cascade if ON DELETE CASCADE is set)
        const deleteQuery = 'DELETE FROM organization WHERE organization_id = $1';
        await db.query(deleteQuery, [orgId]);

        req.flash('success', 'Organization deleted successfully.');
        res.redirect('/organizations');
    } catch (error) {
        console.error('Error deleting organization:', error);
        req.flash('error', 'Unable to delete organization. It may have associated projects.');
        res.redirect('/organizations');
    }
};

// ==================== LEGACY ALIASES (optional, for backward compatibility) ====================
export const showCreateOrganizationForm = showNewOrganizationForm;
export const createOrganizationHandler = createOrganization;
export const editOrganizationHandler = updateOrganization;
export const processNewOrganizationForm = createOrganization;
export const processEditOrganizationForm = updateOrganization;