const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterTable() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'workforce_platform'
    });
    
    console.log('Altering users table...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN age INT,
      ADD COLUMN address TEXT,
      ADD COLUMN photo_url VARCHAR(255),
      ADD COLUMN category_sought VARCHAR(100);
    `);
    console.log('Successfully altered users table');
    await connection.end();
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Columns already exist.');
    } else {
      console.error('Error altering table:', error);
    }
  } finally {
    process.exit(0);
  }
}

alterTable();
