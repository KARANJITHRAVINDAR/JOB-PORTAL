const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workforce_platform'
    });

    console.log('Connected to MySQL server.');

    // Add preferred_language column if it doesn't exist
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English';
    `);

    console.log('Added preferred_language column to users table.');

    await connection.end();
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists, ignoring.');
    } else {
      console.error('Error altering schema:', error);
    }
    process.exit(1);
  }
}

alterDb();
