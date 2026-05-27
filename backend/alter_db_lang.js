const mysql = require('mysql2/promise');

async function alterDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ks@kbd23777',
      database: 'workforce_platform'
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
