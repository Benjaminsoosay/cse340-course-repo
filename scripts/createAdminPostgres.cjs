// scripts/createAdminPostgres.cjs
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createAdmin() {
    const client = await pool.connect();
    try {
        // Admin role id is 2 (from your roles table)
        const adminRoleId = 2;

        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        // Use password_hash (not password)
        const query = `
            INSERT INTO users (email, password_hash, role_id, name, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                role_id = EXCLUDED.role_id,
                name = EXCLUDED.name
            RETURNING email, role_id
        `;
        const values = ['grader@example.com', hashedPassword, adminRoleId, 'Admin'];
        const result = await client.query(query, values);
        console.log(`✅ Admin user ready: ${result.rows[0].email} (role_id = ${result.rows[0].role_id})`);
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

createAdmin();