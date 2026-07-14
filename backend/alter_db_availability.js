const mysql = require('mysql2/promise');

async function alterDb() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ks@kbd23777',
    database: 'workforce_platform',
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
