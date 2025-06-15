import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import path from 'path';
import { Server } from 'socket.io';

// Initialize database and catalog
import { loadCatalog } from './catalog';

const fastify = Fastify({
  logger: {
    level: 'info'
  }
});

// Register plugins
fastify.register(cors, {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000']
});

fastify.register(staticFiles, {
  root: path.join(__dirname, '../generated'),
  prefix: '/static/'
});

// Register routes
fastify.register(import('./routes/health'));
fastify.register(import('./routes/orders'));

// Socket.IO setup
const io = new Server(fastify.server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const start = async () => {
  try {
    // Load catalog data
    await loadCatalog();
    console.log('Catalog loaded successfully');
    
    const port = parseInt(process.env.PORT || '4000');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
