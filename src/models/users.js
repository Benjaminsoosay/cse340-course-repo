// models/users.js

import db from './db.js';
import bcrypt from 'bcrypt';

/**
 * Creates a new user in the database.
 * @param {string} name - User's full name.
 * @param {string} email - User's email address.
 * @param {string} passwordHash - Already-hashed password.
 * @returns {Promise<number>} The new user's ID.
 */
const createUser = async (name, email, passwordHash) => {
    const defaultRole = 'user';
    const query = `
        INSERT INTO users (name, email, password_hash, role_id) 
        VALUES ($1, $2, $3, (SELECT role_id FROM roles WHERE role_name = $4)) 
        RETURNING user_id
    `;
    const result = await db.query(query, [name, email, passwordHash, defaultRole]);

    if (result.rows.length === 0) {
        throw new Error('Failed to create user');
    }

    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log('Created new user with ID:', result.rows[0].user_id);
    }

    return result.rows[0].user_id;
};

/**
 * Internal: Find a user by email address (includes role_name via JOIN).
 * @param {string} email - User's email.
 * @returns {Promise<Object|null>} User object or null if not found.
 */
const findUserByEmail = async (email) => {
    const query = `
        SELECT u.user_id, u.name, u.email, u.password_hash, r.role_name 
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.email = $1
    `;
    const result = await db.query(query, [email]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Internal: Compare a plain text password with its stored hash.
 * @param {string} password - Plain text password.
 * @param {string} passwordHash - Stored bcrypt hash.
 * @returns {Promise<boolean>} True if password matches.
 */
const verifyPassword = async (password, passwordHash) => {
    return bcrypt.compare(password, passwordHash);
};

/**
 * Authenticate a user by email and password.
 * @param {string} email - User's email.
 * @param {string} password - Plain text password.
 * @returns {Promise<Object|null>} User object (without password_hash) or null if authentication fails.
 */
const authenticateUser = async (email, password) => {
    const user = await findUserByEmail(email);
    if (!user) return null;

    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) return null;

    // Remove password hash before returning
    const { password_hash, ...userWithoutHash } = user;
    return userWithoutHash;
};

/**
 * Get all users with their role names (admin only).
 * @returns {Promise<Array>} Array of user objects (user_id, name, email, role_name).
 */
const getAllUsers = async () => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        ORDER BY u.user_id;
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get a single user by ID (includes role name).
 * @param {number} userId - User ID.
 * @returns {Promise<Object|null>} User object or null if not found.
 */
const getUserById = async (userId) => {
    const query = `
        SELECT u.user_id, u.name, u.email, r.role_name
        FROM users u
        JOIN roles r ON u.role_id = r.role_id
        WHERE u.user_id = $1;
    `;
    const result = await db.query(query, [userId]);
    return result.rows.length ? result.rows[0] : null;
};

/**
 * Update a user's role.
 * @param {number} userId - User ID.
 * @param {string} roleName - New role name (e.g., 'admin', 'user').
 * @returns {Promise<Object>} The updated user object (user_id only).
 */
const updateUserRole = async (userId, roleName) => {
    const query = `
        UPDATE users 
        SET role_id = (SELECT role_id FROM roles WHERE role_name = $2)
        WHERE user_id = $1
        RETURNING user_id;
    `;
    const result = await db.query(query, [userId, roleName]);
    if (result.rows.length === 0) {
        throw new Error('User not found or role invalid');
    }
    if (process.env.ENABLE_SQL_LOGGING === 'true') {
        console.log(`Updated user ${userId} role to ${roleName}`);
    }
    return result.rows[0];
};

export {
    createUser,
    authenticateUser,
    getAllUsers,
    getUserById,
    updateUserRole
};