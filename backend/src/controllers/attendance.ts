import { Request, Response } from 'express';
import pool from '../db';

export const clockIn = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { job_id, worker_id } = req.body;
    
    if (!job_id || !worker_id) {
      return res.status(400).json({ error: 'Missing job_id or worker_id' });
    }

    // Check if the application exists and is ACCEPTED
    const [rows]: any = await connection.query(
      "SELECT * FROM applications WHERE job_id = ? AND worker_id = ? AND status = 'ACCEPTED' FOR UPDATE",
      [job_id, worker_id]
    );

    if (rows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Valid accepted application not found.' });
    }

    // Update status to IN_PROGRESS and set clocked_in_at
    await connection.query(
      "UPDATE applications SET status = 'IN_PROGRESS', clocked_in_at = CURRENT_TIMESTAMP WHERE job_id = ? AND worker_id = ?",
      [job_id, worker_id]
    );

    await connection.commit();
    res.json({ message: 'Clocked in successfully', status: 'IN_PROGRESS' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to clock in' });
  } finally {
    connection.release();
  }
};
