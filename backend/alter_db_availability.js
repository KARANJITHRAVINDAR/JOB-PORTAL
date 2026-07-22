const mysql = require('mysql2/promise');
require('dotenv').config();

async function alterDb() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'workforce_platform',
  });

  console.log('Connected to MySQL. Adding is_available column to users table...');

  try {
    await connection.query(`ALTER TABLE users ADD COLUMN is_available BOOLEAN DEFAULT true;`);
    console.log('✅ Column is_available added to users table.');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  Column is_available already exists. Skipping.');
    } else {
      throw err;
    }
  }

  await connection.end();
  console.log('Done.');
}

alterDb().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
