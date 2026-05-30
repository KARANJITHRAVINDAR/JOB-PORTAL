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

    // Add squad_size to users
    try {
      await connection.query(`ALTER TABLE users ADD COLUMN squad_size INT DEFAULT 1;`);
      console.log('Added squad_size to users.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('squad_size already exists.');
      else throw e;
    }

    // Add slots_taken and clocked_in_at to applications
    try {
      await connection.query(`
        ALTER TABLE applications 
        ADD COLUMN slots_taken INT DEFAULT 1,
        ADD COLUMN clocked_in_at TIMESTAMP NULL;
      `);
      console.log('Added slots_taken and clocked_in_at to applications.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('applications columns already exist.');
      else throw e;
    }

    // Modify application status ENUM to include IN_PROGRESS
    try {
      await connection.query(`
        ALTER TABLE applications 
        MODIFY COLUMN status ENUM('QUEUED', 'PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'QUEUED';
      `);
      console.log('Updated application status ENUM.');
    } catch (e) {
      console.log('Failed to update enum, maybe already updated.', e.message);
    }

    // Add advance_paid to wallet_escrows
    try {
      await connection.query(`ALTER TABLE wallet_escrows ADD COLUMN advance_paid DECIMAL(10, 2) DEFAULT 0;`);
      console.log('Added advance_paid to wallet_escrows.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('advance_paid already exists.');
      else throw e;
    }

    // Create tools table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS tools (
        id VARCHAR(36) PRIMARY KEY,
        owner_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        hourly_rate DECIMAL(10, 2) NOT NULL,
        status ENUM('AVAILABLE', 'RENTED', 'UNAVAILABLE') DEFAULT 'AVAILABLE',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location POINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        SPATIAL INDEX(location),
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Created tools table.');

    await connection.end();
  } catch (error) {
    console.error('Error altering schema:', error);
    process.exit(1);
  }
}

alterDb();
