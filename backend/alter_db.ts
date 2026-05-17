import pool from './src/db';

async function alterTable() {
  try {
    console.log('Altering users table...');
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN age INT,
      ADD COLUMN address TEXT,
      ADD COLUMN photo_url VARCHAR(255),
      ADD COLUMN category_sought VARCHAR(100);
    `);
    console.log('Successfully altered users table');
  } catch (error: any) {
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
