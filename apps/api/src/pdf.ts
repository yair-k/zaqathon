import fs from 'fs';
import path from 'path';
import { PDFDocument, PDFForm, PDFTextField, rgb } from 'pdf-lib';
import { OrderJSON } from './types';
import { getCatalogItem } from './catalog';

export async function generatePDF(order: OrderJSON): Promise<string> {
  const templatePath = path.join(__dirname, '../../../data/sales_order_form_full.pdf');
  const outputDir = path.join(__dirname, '../generated');
  const outputPath = path.join(outputDir, `${order.orderId}.pdf`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Read the template PDF
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Create a new PDF document since the template might not have form fields
    const newPdfDoc = await PDFDocument.create();
    
    // Copy the first page from template
    const [templatePage] = await newPdfDoc.copyPages(pdfDoc, [0]);
    const page = newPdfDoc.addPage(templatePage);
    
    const { width, height } = page.getSize();
    
    // Add text content to the PDF
    const fontSize = 10;
    const font = await newPdfDoc.embedFont('Helvetica');
    
    // Order details
    page.drawText(`Order ID: ${order.orderId}`, {
      x: 50,
      y: height - 100,
      size: fontSize + 2,
      font
    });
    
    page.drawText(`Date: ${order.meta.processedAt.split('T')[0]}`, {
      x: 50,
      y: height - 120,
      size: fontSize,
      font
    });
    
    // Customer information
    page.drawText('Customer:', {
      x: 50,
      y: height - 150,
      size: fontSize + 1,
      font
    });
    
    page.drawText(order.customer.name, {
      x: 50,
      y: height - 170,
      size: fontSize,
      font
    });
    
    page.drawText(order.customer.address, {
      x: 50,
      y: height - 190,
      size: fontSize,
      font
    });
    
    // Delivery information
    page.drawText('Delivery:', {
      x: 50,
      y: height - 220,
      size: fontSize + 1,
      font
    });
    
    page.drawText(`Date: ${order.delivery.date}`, {
      x: 50,
      y: height - 240,
      size: fontSize,
      font
    });
    
    page.drawText(`Address: ${order.delivery.address}`, {
      x: 50,
      y: height - 260,
      size: fontSize,
      font
    });
    
    // Items table header
    page.drawText('Items:', {
      x: 50,
      y: height - 300,
      size: fontSize + 1,
      font
    });
    
    page.drawText('SKU', {
      x: 50,
      y: height - 320,
      size: fontSize,
      font
    });
    
    page.drawText('Description', {
      x: 150,
      y: height - 320,
      size: fontSize,
      font
    });
    
    page.drawText('Qty', {
      x: 350,
      y: height - 320,
      size: fontSize,
      font
    });
    
    page.drawText('Price', {
      x: 400,
      y: height - 320,
      size: fontSize,
      font
    });
    
    page.drawText('Total', {
      x: 450,
      y: height - 320,
      size: fontSize,
      font
    });
    
    // Items
    let y = height - 350;
    let grandTotal = 0;
    
    for (const item of order.items) {
      const catalogItem = getCatalogItem(item.sku);
      const price = catalogItem?.price || 0;
      const total = price * item.qty;
      grandTotal += total;
      
      page.drawText(item.sku, {
        x: 50,
        y,
        size: fontSize,
        font
      });
      
      page.drawText(catalogItem?.description || 'Unknown', {
        x: 150,
        y,
        size: fontSize - 1,
        font
      });
      
      page.drawText(item.qty.toString(), {
        x: 350,
        y,
        size: fontSize,
        font
      });
      
      page.drawText(`$${price.toFixed(2)}`, {
        x: 400,
        y,
        size: fontSize,
        font
      });
      
      page.drawText(`$${total.toFixed(2)}`, {
        x: 450,
        y,
        size: fontSize,
        font
      });
      
      // Add validation issues
      if (item.validations.length > 0) {
        y -= 15;
        page.drawText(`Issues: ${item.validations.join(', ')}`, {
          x: 70,
          y,
          size: fontSize - 1,
          font,
          color: rgb(0.8, 0, 0)
        });
      }
      
      y -= 25;
      
      if (y < 100) break; // Prevent overflow
    }
    
    // Grand total
    page.drawText(`Grand Total: $${grandTotal.toFixed(2)}`, {
      x: 400,
      y: y - 20,
      size: fontSize + 1,
      font
    });
    
    // Confidence score
    page.drawText(`Confidence: ${(order.overallConfidence * 100).toFixed(1)}%`, {
      x: 50,
      y: 50,
      size: fontSize,
      font
    });
    
    // Save the PDF
    const pdfBytes = await newPdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    return outputPath;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}
