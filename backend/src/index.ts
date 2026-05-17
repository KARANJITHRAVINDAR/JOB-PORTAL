import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import pool from './db';
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import escrowRoutes from './routes/escrow';
import aiRoutes from './routes/ai';
import { setupSockets } from './socket';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSockets(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/ai', aiRoutes);

// Basic Health Check Route
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS solution');
    res.json({ status: 'healthy', db: 'connected', solution: rows });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Workforce backend running on port ${PORT}`);
});
