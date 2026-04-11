// src/models/organization.js

import db from './db.js';

/**
 * Get all organizations from the database.
 * @returns {Promise<Array>} Array of organization objects.
 */
export const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM organization
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get details of a single organization by ID (alias for getOrganizationById).
 * @param {number|string} organizationId - The organization ID.
 * @returns {Promise<Object|null>} Organization object or null if not found.
 */
export const getOrganizationDetails = async (organizationId) => {
    return getOrganizationById(organizationId);
};

/**
 * Get an organization by its ID.
 * @param {number|string} organizationId - The organization ID.
 * @returns {Promise<Object|null>} Organization object or null if not found.
 */
export const getOrganizationById = async (organizationId) => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM organization
        WHERE organization_id = $1;
    `;
    const result = await db.query(query, [organizationId]);
    return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Creates a new organization in the database.
 * @param {string} name - The name of the organization.
 * @param {string} description - A description of the organization.
 * @param {string} contactEmail - The contact email for the organization.
 * @param {string} logoFilename - The filename of the organization's logo (optional, defaults to placeholder).
 * @returns {Promise<number>} The id of the newly created organization.
 */
export const createOrganization = async (name, description, contactEmail, logoFilename = 'placeholder-logo.png') => {
    const query = `
        INSERT INTO organization (name, description, contact_email, logo_filename)
        VALUES ($1, $2, $3, $4)
        RETURNING organization_id
    `;
    const result = await db.query(query, [name, description, contactEmail, logoFilename]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create organization');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new organization with ID:', result.rows[0].organization_id);
    }

    return result.rows[0].organization_id;
};

/**
 * Updates an existing organization in the database.
 * @param {number|string} organizationId - The ID of the organization to update.
 * @param {string} name - The updated name.
 * @param {string} description - The updated description.
 * @param {string} contactEmail - The updated contact email.
 * @param {string} logoFilename - The updated logo filename.
 * @returns {Promise<number>} The ID of the updated organization.
 */
export const updateOrganization = async (organizationId, name, description, contactEmail, logoFilename) => {
    const query = `
        UPDATE organization
        SET name = $1, description = $2, contact_email = $3, logo_filename = $4
        WHERE organization_id = $5
        RETURNING organization_id;
    `;
    const result = await db.query(query, [name, description, contactEmail, logoFilename, organizationId]);

    if (result.rows.length === 0) {
        throw new Error('Organization not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Updated organization with ID:', organizationId);
    }

    return result.rows[0].organization_id;
};

/**
 * Deletes an organization from the database.
 * @param {number|string} organizationId - The ID of the organization to delete.
 * @returns {Promise<void>}
 */
export const deleteOrganization = async (organizationId) => {
    const query = `
        DELETE FROM organization
        WHERE organization_id = $1
        RETURNING organization_id;
    `;
    const result = await db.query(query, [organizationId]);

    if (result.rows.length === 0) {
        throw new Error('Organization not found');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Deleted organization with ID:', organizationId);
    }
};

// No separate export block – all functions are already exported individually.