import { Server, Socket } from 'socket.io';
import pool from './db';
import crypto from 'crypto';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected to socket:', socket.id);

    // Join a specific job room (for tracking queue / applicants / chat)
    socket.on('join_job', (jobId: string) => {
      socket.join(`job_${jobId}`);
      console.log(`Socket ${socket.id} joined job_${jobId}`);
    });

    // Send a chat message
    socket.on('send_message', async (data) => {
      const { job_id, sender_id, receiver_id, original_text } = data;

      try {
        const messageId = crypto.randomUUID();
        
        // Save to DB
        await pool.query(
          `INSERT INTO chat_messages (id, job_id, sender_id, receiver_id, original_text) VALUES (?, ?, ?, ?, ?)`,
          [messageId, job_id, sender_id, receiver_id, original_text]
        );

        // Broadcast to the job room
        io.to(`job_${job_id}`).emit('new_message', {
          id: messageId,
          job_id,
          sender_id,
          receiver_id,
          original_text,
          created_at: new Date()
        });

      } catch (error) {
        console.error('Error saving chat message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from socket:', socket.id);
    });
  });
};
