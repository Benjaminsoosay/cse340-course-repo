// models/db.js

import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// Use DATABASE_URL (primary) or DB_URL (legacy)
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

/**
 * Enable SSL only for Render (or any remote host that requires it).
 * You may encounter SSL connection errors depending on your operating system,
 * Node.js version, or PostgreSQL server settings. If you have confirmed your
 * credentials are correct but still see SSL errors, try adjusting the SSL
 * configuration below (e.g., { rejectUnauthorized: false }).
 */
const useSSL = connectionString && (
  connectionString.includes('render.com') ||
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

/**
 * Since we may modify the normal pool object in development mode, we create
 * and export a reference to the pool object. This allows us to use the same
 * name for the export regardless of whether we are in development or production.
 */
let db = null;

if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
  /**
   * In development mode, wrap the pool to provide query logging.
   * This helps with debugging by showing all executed queries in the console.
   * The wrapper also adds timing information to help identify slow queries
   * and tracks the number of rows affected by each query.
   */
  db = {
    async query(text, params) {
      try {
        const start = Date.now();
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query:', {
          text: text.replace(/\s+/g, ' ').trim(),
          duration: `${duration}ms`,
          rows: res.rowCount,
        });
        return res;
      } catch (error) {
        console.error('Error in query:', {
          text: text.replace(/\s+/g, ' ').trim(),
          error: error.message,
        });
        throw error;
      }
    },
    async close() {
      await pool.end();
    },
  };
} else {
  // In production, export the pool directly without logging overhead
  db = pool;
}

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
  try {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
};

export { db as default, testConnection };