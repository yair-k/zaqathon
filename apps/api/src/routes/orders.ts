import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { OrderJSON } from '../types';
import fs from 'fs';

export default async function (fastify: FastifyInstance) {  // Get all orders
  fastify.get('/orders', async (request, reply) => {
    const orders = db.getAllOrders();
    return orders.map(order => ({
      id: order.id,
      email_file: order.email_file,
      processed_at: order.processed_at,
      customer_name: order.customer_name,
      overall_confidence: order.overall_confidence,
      pdf_path: order.pdf_path
    }));
  });
  // Get single order
  fastify.get<{ Params: { id: string } }>('/orders/:id', async (request, reply) => {
    const { id } = request.params;
    const order = db.getOrder(id);
    
    if (!order) {
      reply.code(404);
      return { error: 'Order not found' };
    }

    const orderData: OrderJSON = JSON.parse(order.data);
    return orderData;
  });
  // Get order PDF
  fastify.get<{ Params: { id: string } }>('/orders/:id/pdf', async (request, reply) => {
    const { id } = request.params;
    const order = db.getOrder(id);
    
    if (!order) {
      reply.code(404);
      return { error: 'Order not found' };
    }

    const pdfPath = order.pdf_path;
    const fullPath = pdfPath.startsWith('/') ? pdfPath : `${__dirname}/../../${pdfPath}`;
    
    if (!fs.existsSync(fullPath)) {
      reply.code(404);
      return { error: 'PDF not found' };
    }

    reply.type('application/pdf');
    return fs.createReadStream(fullPath);
  });  // Refresh all orders (re-process samples)
  fastify.post('/orders/refresh', async (request, reply) => {
    try {
      // Import and run the ingest function directly
      const { ingestSamples } = await import('../ingestSamples');
      
      // Run in background
      ingestSamples().catch(error => {
        console.error('Background ingest failed:', error);
      });

      return { message: 'Refresh initiated' };
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to refresh orders' };
    }
  });
}
