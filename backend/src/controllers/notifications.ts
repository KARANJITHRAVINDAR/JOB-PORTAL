import { Request, Response } from 'express';
import pool from '../db';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 20
    `;
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;
    const query = `UPDATE notifications SET is_read = TRUE WHERE id = ?`;
    await pool.query(query, [notificationId]);
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
};
