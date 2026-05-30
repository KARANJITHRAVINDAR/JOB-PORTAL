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

    // Add xp and level columns to users table
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN xp INT DEFAULT 0,
        ADD COLUMN level INT DEFAULT 1;
      `);
      console.log('Added xp and level columns to users table.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log('xp/level columns already exist, ignoring.');
      } else {
        throw e;
      }
    }

    // Create user_badges table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Created user_badges table.');

    await connection.end();
  } catch (error) {
    console.error('Error altering schema:', error);
    process.exit(1);
  }
}

alterDb();
