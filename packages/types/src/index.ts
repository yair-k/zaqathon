export interface CatalogItem {
  sku: string;
  description: string;
  moq: number;
  price: number;
  stock: number;
}

export interface ExtractedItem {
  sku: string;
  qty: number;
  validations: string[];
  suggestions: string[];
  conf: number;
}

export interface OrderJSON {
  orderId: string;
  meta: {
    emailFile: string;
    processedAt: string;
  };
  customer: {
    name: string;
    address: string;
  };
  items: ExtractedItem[];
  delivery: {
    date: string;
    address: string;
  };
  overallConfidence: number;
  pdfPath: string;
}
