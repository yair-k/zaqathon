import { ExtractedItem, OrderJSON } from './types';
import { getCatalogItem, searchCatalog } from './catalog';
import { ExtractedOrder } from './llm';

export function enrichOrder(extracted: ExtractedOrder, orderId: string, emailFile: string): OrderJSON {
  const items: ExtractedItem[] = extracted.items.map(item => {
    const validations: string[] = [];
    const suggestions: string[] = [];
    let sku = item.product;
    let conf = item.confidence;

    // Try to find exact SKU match
    let catalogItem = getCatalogItem(item.product);
    
    if (!catalogItem) {
      // Search for similar products
      const searchResults = searchCatalog(item.product);
      if (searchResults.length > 0) {
        catalogItem = searchResults[0];
        sku = catalogItem.sku;
        suggestions.push(`Mapped "${item.product}" to ${catalogItem.sku}: ${catalogItem.description}`);
        conf = Math.min(conf, 0.8); // Reduce confidence for mapped items
      } else {
        validations.push(`Product "${item.product}" not found in catalog`);
        conf = 0.1;
      }
    }

    if (catalogItem) {
      // Check stock availability
      if (catalogItem.stock === 0) {
        validations.push('Out of stock');
      } else if (item.quantity > catalogItem.stock) {
        validations.push(`Insufficient stock. Available: ${catalogItem.stock}, Requested: ${item.quantity}`);
      }

      // Check minimum order quantity
      if (item.quantity < catalogItem.moq) {
        validations.push(`Below minimum order quantity. MOQ: ${catalogItem.moq}, Requested: ${item.quantity}`);
      }
    }

    return {
      sku,
      qty: item.quantity,
      validations,
      suggestions,
      conf
    };
  });

  // Calculate overall confidence
  const overallConfidence = items.length > 0 
    ? items.reduce((sum, item) => sum + item.conf, 0) / items.length 
    : 0;

  return {
    orderId,    meta: {
      emailFile,
      processedAt: new Date().toISOString(),
      confidence: overallConfidence
    },
    customer: extracted.customer,
    items,
    delivery: extracted.delivery,
    overallConfidence,
    pdfPath: `generated/${orderId}.pdf`
  };
}
