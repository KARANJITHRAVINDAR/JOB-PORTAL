import { Request, Response } from 'express';
import pool from '../db';
import crypto from 'crypto';

export const createReport = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { reporter_id, reported_id, job_id, reason } = req.body;
    
    if (!reporter_id || !reported_id || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reportId = crypto.randomUUID();
    
    await connection.query(
      `INSERT INTO reports (id, reporter_id, reported_id, job_id, reason) VALUES (?, ?, ?, ?, ?)`,
      [reportId, reporter_id, reported_id, job_id || null, reason]
    );

    // Reduce trust score by 5 points
    const penalty = 5;
    await connection.query(
      `UPDATE users SET trust_score = GREATEST(0, trust_score - ?) WHERE id = ?`,
      [penalty, reported_id]
    );

    // Create a notification for the reported user
    const notificationId = crypto.randomUUID();
    const message = `Your trust score has decreased by ${penalty} points due to a recent report against you.`;
    await connection.query(
      `INSERT INTO notifications (id, user_id, message) VALUES (?, ?, ?)`,
      [notificationId, reported_id, message]
    );

    await connection.commit();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to submit report' });
  } finally {
    connection.release();
  }
};
