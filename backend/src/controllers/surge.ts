import { Request, Response } from 'express';
import pool from '../db';

export const getSurgeEstimate = async (req: Request, res: Response) => {
  try {
    const { lat, lng, category, radiusKm = 10 } = req.query;
    
    if (!lat || !lng || !category) {
      return res.status(400).json({ error: 'Missing lat, lng, or category' });
    }

    const pointStr = `POINT(${lat} ${lng})`;
    const radiusMeters = Number(radiusKm) * 1000;

    // Count active jobs in this category within radius
    const [jobsRows]: any = await pool.query(`
      SELECT COUNT(*) as count 
      FROM jobs 
      WHERE status IN ('POSTED', 'PENDING') 
      AND category = ? 
      AND ST_Distance_Sphere(location, ST_GeomFromText(?)) <= ?
    `, [category, pointStr, radiusMeters]);

    const activeJobs = jobsRows[0].count;

    // Count available workers in this category within radius
    const [workersRows]: any = await pool.query(`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role = 'WORKER' 
      AND category_sought = ? 
      AND ST_Distance_Sphere(location, ST_GeomFromText(?)) <= ?
    `, [category, pointStr, radiusMeters]);

    const availableWorkers = workersRows[0].count;

    // Basic Surge Logic:
    // If jobs > workers, calculate surge multiplier
    let surgeMultiplier = 1.0;
    let isSurge = false;

    if (activeJobs > availableWorkers && availableWorkers > 0) {
      const ratio = activeJobs / availableWorkers;
      // Cap at 2.0x
      surgeMultiplier = Math.min(1.0 + (ratio * 0.15), 2.0); 
      isSurge = true;
    } else if (activeJobs > 0 && availableWorkers === 0) {
      // Extremely high demand
      surgeMultiplier = 1.5;
      isSurge = true;
    }

    res.json({
      active_jobs: activeJobs,
      available_workers: availableWorkers,
      surge_multiplier: Number(surgeMultiplier.toFixed(2)),
      is_high_demand: isSurge
    });
    
  } catch (error) {
    console.error('Error calculating surge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
