import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// Use DATABASE_URL (primary) or DB_URL (legacy)
const connectionString = process.env.DATABASE_URL || process.env.DB_URL;

// Enable SSL only for Render (or any remote host that requires it)
const useSSL = connectionString && (
  connectionString.includes('render.com') ||
  process.env.DB_SSL === 'true' ||
  process.env.NODE_ENV === 'production'
);

const pool = new Pool({
  connectionString: connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

let db = null;

if (process.env.NODE_ENV === 'development' && process.env.ENABLE_SQL_LOGGING === 'true') {
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
  db = pool;
}

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