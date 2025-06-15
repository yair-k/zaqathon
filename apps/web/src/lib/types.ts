// Local types file to replace @zaqathon/types workspace dependency

export interface CatalogItem {
  sku: string;
  description: string;
  price: number;
  stock: number;
  moq: number;
}

export interface ExtractedItem {
  product: string;
  quantity: number;
  confidence: number;
}

export interface ValidatedItem extends ExtractedItem {
  sku?: string;
  catalogItem?: CatalogItem;
  validations: string[];
  unitPrice?: number;
  totalPrice?: number;
  qty: number; // alias for quantity
  conf: number; // alias for confidence
  suggestions: string[]; // list of suggestions for validation issues
}

export interface Order {
  orderId: string;
  customer: {
    name: string;
    address: string;
  };
  items: ValidatedItem[];
  delivery: {
    date: string;
    address: string;
  };
  overallConfidence: number;
  meta: {
    emailFile: string;
    processedAt: string;
    confidence: number;
  };
  pdfPath?: string;
}

export interface OrderSummary {
  id: string;
  email_file: string;
  processed_at: string;
  customer_name: string;
  overall_confidence: number;
  items_count: number;
  total_value: number;
}
