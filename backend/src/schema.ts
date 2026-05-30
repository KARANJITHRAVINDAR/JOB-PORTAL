import mysql from 'mysql2/promise';

async function initSchema() {
  try {
    // Connect without database selected first to create it
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Ks@kbd23777',
    });

    console.log('Connected to MySQL server.');

    await connection.query(`CREATE DATABASE IF NOT EXISTS workforce_platform;`);
    console.log('Database workforce_platform created or already exists.');

    await connection.query(`USE workforce_platform;`);

    // Create Tables
    const schemaQueries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        role ENUM('WORKER', 'EMPLOYER', 'BOTH') NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        age INT,
        address TEXT,
        photo_url VARCHAR(255),
        category_sought VARCHAR(100),
        preferred_language VARCHAR(50) DEFAULT 'English',
        xp INT DEFAULT 0,
        level INT DEFAULT 1,
        trust_score INT DEFAULT 100,
        squad_size INT DEFAULT 1,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location POINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        SPATIAL INDEX(location)
      );`,
      
      `CREATE TABLE IF NOT EXISTS worker_availability (
        user_id VARCHAR(36) PRIMARY KEY,
        is_available BOOLEAN DEFAULT false,
        schedule_json JSON,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        badge_name VARCHAR(100) NOT NULL,
        awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );`,

      `CREATE TABLE IF NOT EXISTS jobs (
        id VARCHAR(36) PRIMARY KEY,
        employer_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT,
        slots_required INT NOT NULL DEFAULT 1,
        wage DECIMAL(10, 2),
        status ENUM('POSTED', 'PENDING', 'IN_PROGRESS', 'OTP_PENDING', 'COMPLETED') DEFAULT 'POSTED',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        location POINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        SPATIAL INDEX(location),
        FOREIGN KEY (employer_id) REFERENCES users(id)
      );`,

      `CREATE TABLE IF NOT EXISTS applications (
        id VARCHAR(36) PRIMARY KEY,
        job_id VARCHAR(36) NOT NULL,
        worker_id VARCHAR(36) NOT NULL,
        status ENUM('QUEUED', 'PENDING', 'ACCEPTED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'QUEUED',
        queue_position INT,
        slots_taken INT DEFAULT 1,
        clocked_in_at TIMESTAMP NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (worker_id) REFERENCES users(id),
        UNIQUE KEY unique_application (job_id, worker_id)
      );`,
      
      `CREATE TABLE IF NOT EXISTS chat_messages (
        id VARCHAR(36) PRIMARY KEY,
        job_id VARCHAR(36) NOT NULL,
        sender_id VARCHAR(36) NOT NULL,
        receiver_id VARCHAR(36) NOT NULL,
        original_text TEXT,
        translated_text TEXT,
        source_lang VARCHAR(10),
        target_lang VARCHAR(10),
        audio_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id),
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      );`,

      `CREATE TABLE IF NOT EXISTS wallet_escrows (
        id VARCHAR(36) PRIMARY KEY,
        job_id VARCHAR(36) NOT NULL,
        employer_id VARCHAR(36) NOT NULL,
        worker_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        advance_paid DECIMAL(10, 2) DEFAULT 0,
        status ENUM('PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
      );`,

      `CREATE TABLE IF NOT EXISTS tools (
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
      );`,
      
      `CREATE TABLE IF NOT EXISTS completion_otps (
        job_id VARCHAR(36) PRIMARY KEY,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INT DEFAULT 0,
        FOREIGN KEY (job_id) REFERENCES jobs(id)
      );`
    ];

    for (const query of schemaQueries) {
      await connection.query(query);
    }
    
    console.log('Schema tables created successfully.');
    
    await connection.end();
  } catch (error) {
    console.error('Error initializing schema:', error);
    process.exit(1);
  }
}

initSchema();
