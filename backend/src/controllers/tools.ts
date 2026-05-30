import { Request, Response } from 'express';
import pool from '../db';
import crypto from 'crypto';

export const getAvailableTools = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radiusKm = 20, category } = req.query;

    let query = `
      SELECT t.*, u.name as owner_name, u.phone as owner_phone, u.trust_score
      FROM tools t
      JOIN users u ON t.owner_id = u.id
      WHERE t.is_available = TRUE
    `;
    const params: any[] = [];

    // Optional location filtering
    if (lat && lng) {
      const pointStr = `POINT(${lat} ${lng})`;
      const radiusMeters = Number(radiusKm) * 1000;
      query += ` AND ST_Distance_Sphere(u.location, ST_GeomFromText(?)) <= ?`;
      params.push(pointStr, radiusMeters);
    }

    if (category) {
      query += ` AND t.category = ?`;
      params.push(category);
    }

    query += ` ORDER BY t.daily_rate ASC`;

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
};

export const postTool = async (req: Request, res: Response) => {
  try {
    const { owner_id, name, category, daily_rate, image_url } = req.body;
    
    if (!owner_id || !name || !daily_rate) {
      return res.status(400).json({ error: 'owner_id, name, and daily_rate are required' });
    }

    const toolId = crypto.randomUUID();
    
    await pool.query(
      `INSERT INTO tools (id, owner_id, name, category, daily_rate, image_url, is_available) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [toolId, owner_id, name, category || 'General', daily_rate, image_url || null]
    );

    res.status(201).json({ message: 'Tool posted successfully', id: toolId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post tool' });
  }
};

export const rentTool = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { tool_id, renter_id, days = 1 } = req.body;

    const [toolRows]: any = await connection.query(`SELECT is_available, daily_rate FROM tools WHERE id = ? FOR UPDATE`, [tool_id]);
    
    if (toolRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Tool not found' });
    }

    if (!toolRows[0].is_available) {
      await connection.rollback();
      return res.status(400).json({ error: 'Tool is currently not available' });
    }

    await connection.query(
      `UPDATE tools SET is_available = FALSE WHERE id = ?`,
      [tool_id]
    );

    await connection.commit();
    res.json({ message: 'Tool rented successfully', cost: toolRows[0].daily_rate * days });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to rent tool' });
  } finally {
    connection.release();
  }
};
