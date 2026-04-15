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
        // Admin role id is 2
        const adminRoleId = 2;

        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        const query = `
            INSERT INTO users (name, email, password, role_id, created_at)
            VALUES ($1, $2, $3, $4, NOW())
            ON CONFLICT (email) DO UPDATE SET
                password = EXCLUDED.password,
                role_id = EXCLUDED.role_id
            RETURNING email, role_id
        `;
        const values = ['Admin', 'grader@example.com', hashedPassword, adminRoleId];
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