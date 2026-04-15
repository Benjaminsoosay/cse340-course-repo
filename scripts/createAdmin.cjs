// scripts/createAdmin.cjs
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const createAdmin = async () => {
  try {
    const hashed = await bcrypt.hash('Admin123!', 10);
    await pool.query(
      `INSERT INTO users (name, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (email) DO NOTHING`,
      ['Grader Admin', 'grader@example.com', hashed, 'admin']
    );
    console.log('Admin user created: grader@example.com / Admin123!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();