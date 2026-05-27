import { Request, Response } from 'express';
import pool from '../db';
import crypto from 'crypto';

export const postJob = async (req: Request, res: Response) => {
  try {
    const { employer_id, title, category, description, slots_required, wage, lat, lng, negotiable } = req.body;

    if (!employer_id || !title || !category || !lat || !lng) {
      return res.status(400).json({ error: 'Missing required job fields' });
    }

    const jobId = crypto.randomUUID();

    const query = `
      INSERT INTO jobs (id, employer_id, title, category, description, slots_required, wage, latitude, longitude, location, negotiable)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ST_GeomFromText(?), ?)
    `;

    const pointStr = `POINT(${lat} ${lng})`;

    await pool.query(query, [
      jobId, employer_id, title, category, description, slots_required || 1, wage, lat, lng, pointStr, negotiable ? 1 : 0
    ]);

    res.status(201).json({ message: 'Job posted successfully', jobId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post job' });
  }
};

export const applyJob = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { job_id, worker_id } = req.body;

    // 1. Check current slots and pending applications
    const [jobRows]: any = await connection.query('SELECT slots_required FROM jobs WHERE id = ? FOR UPDATE', [job_id]);
    if (jobRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ error: 'Job not found' });
    }

    const slotsRequired = jobRows[0].slots_required;

    const [pendingRows]: any = await connection.query(
      "SELECT COUNT(*) as count FROM applications WHERE job_id = ? AND status IN ('PENDING', 'ACCEPTED') FOR UPDATE",
      [job_id]
    );

    const currentFilled = pendingRows[0].count;

    let newStatus = 'QUEUED';
    let queuePos = null;

    if (currentFilled < slotsRequired) {
      newStatus = 'PENDING';
    } else {
      // Find max queue position
      const [queueRows]: any = await connection.query(
        "SELECT MAX(queue_position) as max_pos FROM applications WHERE job_id = ? AND status = 'QUEUED'",
        [job_id]
      );
      queuePos = (queueRows[0].max_pos || 0) + 1;
    }

    const applicationId = crypto.randomUUID();

    await connection.query(
      `INSERT INTO applications (id, job_id, worker_id, status, queue_position) VALUES (?, ?, ?, ?, ?)`,
      [applicationId, job_id, worker_id, newStatus, queuePos]
    );

    await connection.commit();

    res.json({ message: 'Application submitted', status: newStatus, queue_position: queuePos });

  } catch (error: any) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Already applied for this job' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to apply' });
  } finally {
    connection.release();
  }
};

export const getNearbyJobs = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radiusKm = 10, category } = req.query;

    if (!lat || !lng) return res.status(400).json({ error: 'Missing coordinates' });

    const pointStr = `POINT(${lat} ${lng})`;
    const radiusMeters = Number(radiusKm) * 1000;
    const params: any[] = [pointStr, pointStr, radiusMeters];

    // Using ST_Distance_Sphere (MySQL 5.7+) to get distance in meters
    let query = `
      SELECT id, title, category, wage, status, latitude, longitude, ST_Distance_Sphere(location, ST_GeomFromText(?)) as distance
      FROM jobs
      WHERE ST_Distance_Sphere(location, ST_GeomFromText(?)) <= ?
      AND status != 'COMPLETED'
    `;

    if (category && category !== 'undefined' && category !== '') {
      query += ` AND category = ?`;
      params.push(category);
    }

    query += ` ORDER BY distance ASC`;

    const [rows] = await pool.query(query, params);

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch nearby jobs' });
  }
};

export const getEmployerJobs = async (req: Request, res: Response) => {
  try {
    const { employerId } = req.params;
    const query = `
      SELECT j.*, 
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('id', a.id, 'worker_id', u.id, 'name', u.name, 'phone', u.phone, 'trust_score', u.trust_score, 'status', a.status, 'photo_url', u.photo_url))
         FROM applications a JOIN users u ON a.worker_id = u.id 
         WHERE a.job_id = j.id) as applications
      FROM jobs j
      WHERE j.employer_id = ?
      ORDER BY j.created_at DESC
    `;
    const [rows]: any = await pool.query(query, [employerId]);

    // MySQL JSON_ARRAYAGG might return string or parsed array depending on driver, parse if string
    const formatted = rows.map((r: any) => ({
      ...r,
      applications: typeof r.applications === 'string' ? JSON.parse(r.applications) : (r.applications || [])
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employer jobs' });
  }
};

export const acceptApplication = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { job_id, worker_id } = req.body;

    // Update application status to ACCEPTED
    await connection.query(
      `UPDATE applications SET status = 'ACCEPTED' WHERE job_id = ? AND worker_id = ?`,
      [job_id, worker_id]
    );

    // Fetch worker phone number
    const [worker]: any = await connection.query(`SELECT name, phone FROM users WHERE id = ?`, [worker_id]);

    await connection.commit();
    res.json({ message: 'Worker accepted', worker: worker[0] });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to accept application' });
  } finally {
    connection.release();
  }
};

export const getSeekerApplications = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const query = `
      SELECT a.id as application_id, a.status, j.id as job_id, j.title, j.wage, j.category, j.negotiable, j.status as job_status,
             j.latitude, j.longitude, u.id as employer_id, u.name as employer_name, u.phone as employer_phone
      FROM applications a
      JOIN jobs j ON a.job_id = j.id
      JOIN users u ON j.employer_id = u.id
      WHERE a.worker_id = ?
      ORDER BY a.applied_at DESC
    `;
    const [rows] = await pool.query(query, [workerId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch seeker applications' });
  }
};

export const editJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, wage, slots_required } = req.body;

    const query = `
      UPDATE jobs 
      SET title = ?, wage = ?, slots_required = ?
      WHERE id = ?
    `;
    await pool.query(query, [title, wage, slots_required, id]);

    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update job' });
  }
};

export const completeJob = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;

    // Update job status
    const query = `UPDATE jobs SET status = 'COMPLETED' WHERE id = ?`;
    await connection.query(query, [id]);

    // Update all ACCEPTED applications to COMPLETED
    await connection.query(
      `UPDATE applications SET status = 'COMPLETED' WHERE job_id = ? AND status = 'ACCEPTED'`,
      [id]
    );

    // Update all PENDING/QUEUED applications to REJECTED
    await connection.query(
      `UPDATE applications SET status = 'REJECTED' WHERE job_id = ? AND status IN ('PENDING', 'QUEUED')`,
      [id]
    );

    await connection.commit();
    res.json({ message: 'Job marked as completed' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to complete job' });
  } finally {
    connection.release();
  }
};

export const rejectApplication = async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { job_id, worker_id } = req.body;

    // Update application status to REJECTED
    await connection.query(
      `UPDATE applications SET status = 'REJECTED' WHERE job_id = ? AND worker_id = ?`,
      [job_id, worker_id]
    );

    // Promote a QUEUED applicant to PENDING if applicable
    const [jobRows]: any = await connection.query('SELECT slots_required FROM jobs WHERE id = ?', [job_id]);
    if (jobRows.length > 0) {
      const slotsRequired = jobRows[0].slots_required;
      const [pendingRows]: any = await connection.query(
        "SELECT COUNT(*) as count FROM applications WHERE job_id = ? AND status IN ('PENDING', 'ACCEPTED')",
        [job_id]
      );
      const currentFilled = pendingRows[0].count;

      if (currentFilled < slotsRequired) {
        // Find the first QUEUED application
        const [queuedRows]: any = await connection.query(
          "SELECT id FROM applications WHERE job_id = ? AND status = 'QUEUED' ORDER BY queue_position ASC LIMIT 1",
          [job_id]
        );
        if (queuedRows.length > 0) {
          await connection.query(
            "UPDATE applications SET status = 'PENDING', queue_position = NULL WHERE id = ?",
            [queuedRows[0].id]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Worker rejected' });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Failed to reject application' });
  } finally {
    connection.release();
  }
};
