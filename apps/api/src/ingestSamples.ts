import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables - try multiple paths to ensure it works
const envPaths = [
  path.join(process.cwd(), '.env'),
  path.join(__dirname, '../.env'),
  path.join(__dirname, '../../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment from: ${envPath}`);
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.error('Could not find .env file in any of the expected locations');
  console.error('Tried:', envPaths);
}
import { loadCatalog } from './catalog';
import { extractOrder } from './llm';
import { enrichOrder } from './validator';
import { generatePDF } from './pdf';
import { db } from './db';

export async function ingestSamples() {
  console.log('Starting sample ingestion...');
  
  // Verify environment variables are loaded
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY not found in environment variables');
    console.error('Please check your .env file contains GROQ_API_KEY');
    process.exit(1);
  }
    console.log('Environment variables loaded successfully');
    // Load catalog first
  await loadCatalog();
  
  // Clear existing orders to avoid duplicates
  db.clearOrders();
  
  // Point to the correct data directory (up two levels from apps/api/src to reach zaqathon/data)
  const samplesDir = path.join(__dirname, '../../../data');
  
  // Check both locations for email files
  let emailFiles: string[] = [];
  
  // First check sample_emails subdirectory
  const emailsSubDir = path.join(samplesDir, 'sample_emails');
  if (fs.existsSync(emailsSubDir)) {
    emailFiles = fs.readdirSync(emailsSubDir)
      .filter(file => file.startsWith('sample_email_') && file.endsWith('.txt'))
      .map(file => path.join('sample_emails', file));
  }
  
  // If no files found, check main data directory
  if (emailFiles.length === 0) {
    emailFiles = fs.readdirSync(samplesDir)
      .filter(file => file.startsWith('sample_email_') && file.endsWith('.txt'));
  }
  
  console.log(`Found ${emailFiles.length} email samples`);
    for (const emailFile of emailFiles) {
    try {
      console.log(`Processing ${emailFile}...`);
      
      const emailPath = path.join(samplesDir, emailFile);
      const emailContent = fs.readFileSync(emailPath, 'utf-8');
      
      // Extract order using LLM
      const extracted = await extractOrder(emailContent);
      
      // Generate order ID
      const orderId = uuidv4();
      
      // Enrich with catalog validation
      const order = enrichOrder(extracted, orderId, emailFile);
      
      // Generate PDF
      const pdfPath = await generatePDF(order);
      order.pdfPath = pdfPath;
        // Save to database
      db.insertOrder({
        id: order.orderId,
        email_file: order.meta.emailFile,
        processed_at: order.meta.processedAt,
        customer_name: order.customer.name,
        customer_address: order.customer.address,
        delivery_date: order.delivery.date,
        delivery_address: order.delivery.address,
        overall_confidence: order.overallConfidence,
        pdf_path: order.pdfPath,
        data: JSON.stringify(order)
      });
      
      console.log(`✓ Processed ${emailFile} -> Order ${orderId}`);
      console.log(`  Confidence: ${(order.overallConfidence * 100).toFixed(1)}%`);
      console.log(`  Items: ${order.items.length}`);
      console.log(`  Issues: ${order.items.reduce((sum: number, item: any) => sum + item.validations.length, 0)}`);
      
    } catch (error) {
      console.error(`✗ Failed to process ${emailFile}:`, error);
    }
  }
    console.log('Sample ingestion completed!');
  // Don't exit when called programmatically
  if (require.main === module) {
    process.exit(0);
  }
}

if (require.main === module) {
  ingestSamples();
}
