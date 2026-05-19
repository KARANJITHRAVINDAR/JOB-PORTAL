import pool from './src/db';

async function alterTableV2() {
  try {
    console.log('Altering jobs table...');
    try {
      await pool.query(`ALTER TABLE jobs ADD COLUMN negotiable BOOLEAN DEFAULT FALSE;`);
      console.log('Added negotiable column to jobs table.');
    } catch (e: any) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('jobs.negotiable already exists.');
      else throw e;
    }

    console.log('Creating reports table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reports (
        id VARCHAR(36) PRIMARY KEY,
        reporter_id VARCHAR(36) NOT NULL,
        reported_id VARCHAR(36) NOT NULL,
        job_id VARCHAR(36),
        reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reporter_id) REFERENCES users(id),
        FOREIGN KEY (reported_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES jobs(id)
      );
    `);
    console.log('Created reports table.');

    console.log('Creating notifications table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);
    console.log('Created notifications table.');

  } catch (error: any) {
    console.error('Error altering table v2:', error);
  } finally {
    process.exit(0);
  }
}

alterTableV2();
