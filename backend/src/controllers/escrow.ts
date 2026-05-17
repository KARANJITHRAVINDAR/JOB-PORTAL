import { Request, Response } from 'express';
import pool from '../db';
import crypto from 'crypto';

// Step 1: Worker marks job as finished, system generates OTP
export const requestCompletion = async (req: Request, res: Response) => {
  try {
    const { job_id, worker_id } = req.body;
    
    // Check if job is in progress
    const [jobRows]: any = await pool.query("SELECT * FROM jobs WHERE id = ? AND status = 'IN_PROGRESS'", [job_id]);
    if (jobRows.length === 0) {
      return res.status(400).json({ error: 'Job is not in progress' });
    }

    // Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60000); // 15 mins expiry

    // Save OTP
    await pool.query(
      `INSERT INTO completion_otps (job_id, otp_code, expires_at) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp_code = ?, expires_at = ?, attempts = 0`,
      [job_id, otpCode, expiresAt, otpCode, expiresAt]
    );

    // Update job status
    await pool.query("UPDATE jobs SET status = 'OTP_PENDING' WHERE id = ?", [job_id]);

    // In a real app, this OTP would be sent via SMS to Employer
    // For MVP, we return it so we can test easily
    res.json({ message: 'Completion requested. OTP sent to employer.', otp_mock: otpCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to request completion' });
  }
};

// Step 2: Employer enters OTP to release escrow
export const verifyCompletion = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { job_id, otp_code } = req.body;

    const [otpRows]: any = await connection.query("SELECT * FROM completion_otps WHERE job_id = ?", [job_id]);
    
    if (otpRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'No OTP found for this job' });
    }

    const otpData = otpRows[0];

    if (new Date() > new Date(otpData.expires_at)) {
      await connection.rollback();
      return res.status(400).json({ error: 'OTP has expired' });
    }

    if (otpData.attempts >= 3) {
      await connection.rollback();
      return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
    }

    if (otpData.otp_code !== otp_code) {
      await connection.query("UPDATE completion_otps SET attempts = attempts + 1 WHERE job_id = ?", [job_id]);
      await connection.commit();
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    // OTP Valid! Mark job completed
    await connection.query("UPDATE jobs SET status = 'COMPLETED' WHERE id = ?", [job_id]);
    
    // Release Escrow
    await connection.query("UPDATE wallet_escrows SET status = 'RELEASED' WHERE job_id = ?", [job_id]);

    // Clean up OTP
    await connection.query("DELETE FROM completion_otps WHERE job_id = ?", [job_id]);

    await connection.commit();
    res.json({ message: 'Job completed successfully. Escrow released to worker.' });

  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to verify completion' });
  } finally {
    connection.release();
  }
};
