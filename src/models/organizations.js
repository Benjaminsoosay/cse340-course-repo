import db from './db.js';

// Get all organizations
const getAllOrganizations = async () => {
    const query = `
        SELECT organization_id, name, description, contact_email, logo_filename
        FROM organization
        ORDER BY name;
    `;
    const result = await db.query(query);
    return result.rows;
};

// Get details of a single organization by ID
const getOrganizationDetails = async (organizationId) => {
    const query = `
        SELECT
            organization_id,
            name,
            description,
            contact_email,
            logo_filename
        FROM organization
        WHERE organization_id = $1;
    `;
    const query_params = [organizationId];
    const result = await db.query(query, query_params);
    return result.rows.length > 0 ? result.rows[0] : null;
};

// Export the model functions
export { getAllOrganizations, getOrganizationDetails };