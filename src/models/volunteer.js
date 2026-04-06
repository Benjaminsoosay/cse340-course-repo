// Add a volunteer to a project
async function addVolunteer(userId, projectId) {
    const query = `
        INSERT INTO project_volunteers (user_id, project_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
    `;
    await db.query(query, [userId, projectId]);
}

// Remove a volunteer from a project
async function removeVolunteer(userId, projectId) {
    const query = `
        DELETE FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2
    `;
    await db.query(query, [userId, projectId]);
}

// Get all projects a user is volunteering for
async function getUserVolunteerProjects(userId) {
    const query = `
        SELECT p.* 
        FROM projects p
        JOIN project_volunteers pv ON p.id = pv.project_id
        WHERE pv.user_id = $1
        ORDER BY pv.volunteered_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
}

// Check if a user is already volunteering for a project (optional but useful)
async function isVolunteer(userId, projectId) {
    const query = `
        SELECT 1 FROM project_volunteers
        WHERE user_id = $1 AND project_id = $2
    `;
    const result = await db.query(query, [userId, projectId]);
    return result.rowCount > 0;
}