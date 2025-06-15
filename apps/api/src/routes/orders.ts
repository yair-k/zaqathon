import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { OrderJSON } from '../types';
import fs from 'fs';
import path from 'path';

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
    return orderData;  });
  
  // Get original email content
  fastify.get<{ Params: { id: string } }>('/orders/:id/email', async (request, reply) => {
    const { id } = request.params;
    const order = db.getOrder(id);
    
    if (!order) {
      reply.code(404);
      return { error: 'Order not found' };
    }

    // Get the email file path from the order
    const emailFile = order.email_file;
    const emailPath = path.join(__dirname, '../../../data', emailFile);
    
    if (!fs.existsSync(emailPath)) {
      reply.code(404);
      return { error: 'Email file not found' };
    }

    try {
      const emailContent = fs.readFileSync(emailPath, 'utf-8');
      return { content: emailContent };
    } catch (error) {
      reply.code(500);
      return { error: 'Failed to read email file' };
    }
  });

  // Get order PDF
  fastify.get<{ Params: { id: string } }>('/orders/:id/pdf', async (request, reply) => {
    const { id } = request.params;
    const order = db.getOrder(id);
    
    if (!order) {
      reply.code(404);
      return { error: 'Order not found' };
    }    const pdfPath = order.pdf_path;
    // Handle both absolute and relative paths
    let fullPath;
    if (path.isAbsolute(pdfPath)) {
      fullPath = pdfPath;
    } else {
      fullPath = path.join(__dirname, '../../', pdfPath);
    }
    
    console.log(`Looking for PDF at: ${fullPath}`);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`PDF not found at: ${fullPath}`);
      // Also check in generated directory with just the order ID
      const altPath = path.join(__dirname, '../generated', `${id}.pdf`);
      console.log(`Trying alternative path: ${altPath}`);
      if (fs.existsSync(altPath)) {
        fullPath = altPath;
      } else {
        reply.code(404);
        return { error: 'PDF not found' };
      }
    }

    reply.type('application/pdf');
    return fs.createReadStream(fullPath);
  });  // Refresh all orders (re-process samples)
  let refreshInProgress = false;
  fastify.post('/orders/refresh', async (request, reply) => {
    if (refreshInProgress) {
      return { message: 'Refresh already in progress' };
    }
    
    try {
      refreshInProgress = true;
      // Import and run the ingest function directly
      const { ingestSamples } = await import('../ingestSamples');
      
      // Run in background
      ingestSamples().catch(error => {
        console.error('Background ingest failed:', error);
      }).finally(() => {
        refreshInProgress = false;
      });

      return { message: 'Refresh initiated' };
    } catch (error) {
      refreshInProgress = false;
      reply.code(500);
      return { error: 'Failed to refresh orders' };
    }
  });
}
