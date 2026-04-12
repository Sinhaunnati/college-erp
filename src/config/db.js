const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle
  connectionTimeoutMillis: 20000, // how long to wait for connection
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    await pool.connect();
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection error:', err);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};

connectDB();

module.exports = pool;