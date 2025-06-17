import mysql, { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';

// Create connection pool with optimized settings
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 10,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  idleTimeout: 60000,
});

// Test database connection
pool.getConnection()
  .then(async (connection) => {

    try {
      // Test query to check if local_movies table exists
      const [tables] = await connection.query<RowDataPacket[]>(
        "SHOW TABLES LIKE 'local_movies'"
      );
    } catch (error) {
      console.error('Error checking local_movies table:', error);
    } finally {
      connection.release();
    }
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

// Export both pool and query function
export const db = {
  query: async <T extends RowDataPacket[] | ResultSetHeader | OkPacket>(
    sql: string,
    values?: any[]
  ): Promise<[T, mysql.FieldPacket[]]> => {
    try {
      return await pool.query<T>(sql, values);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  execute: async <T extends RowDataPacket[] | ResultSetHeader | OkPacket>(
    sql: string,
    values?: any[]
  ): Promise<[T, mysql.FieldPacket[]]> => {
    try {
      return await pool.execute<T>(sql, values);
    } catch (error) {
      console.error('Database execute error:', error);
      throw error;
    }
  },
  transaction: async (callback: (connection: mysql.Connection) => Promise<any>) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

export default pool; 