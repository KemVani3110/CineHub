import mysql from 'mysql2/promise';

// Create connection pool with optimized settings
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, // Reduced connection limit
  queueLimit: 10, // Added queue limit
  enableKeepAlive: true, // Enable keep-alive
  keepAliveInitialDelay: 10000, // Keep-alive initial delay
  idleTimeout: 60000, // Idle timeout in milliseconds
});

// Export both pool and query function
export const db = {
  query: pool.query.bind(pool),
  execute: pool.execute.bind(pool)
};

export default pool; 