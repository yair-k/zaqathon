import fs from 'fs';
import path from 'path';

// Simple JSON file-based storage for MVP
const dataDir = path.join(__dirname, '../data');
const catalogFile = path.join(dataDir, 'catalog.json');
const ordersFile = path.join(dataDir, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export interface CatalogRecord {
  sku: string;
  name: string;
  price: number;
  stock: number;
  moq: number;
  description: string;
}

export interface OrderRecord {
  id: string;
  email_file: string;
  processed_at: string;
  customer_name: string;
  customer_address: string;
  delivery_date: string;
  delivery_address: string;
  overall_confidence: number;
  pdf_path: string;
  data: string;
}

class SimpleDB {
  // Catalog operations
  insertCatalogItem(item: CatalogRecord) {
    const catalog = this.getCatalog();
    const existingIndex = catalog.findIndex(c => c.sku === item.sku);
    if (existingIndex >= 0) {
      catalog[existingIndex] = item;
    } else {
      catalog.push(item);
    }
    this.saveCatalog(catalog);
  }

  getCatalogItem(sku: string): CatalogRecord | null {
    const catalog = this.getCatalog();
    return catalog.find(item => item.sku === sku) || null;
  }

  searchCatalog(query: string): CatalogRecord[] {
    const catalog = this.getCatalog();
    const searchTerm = query.toLowerCase();
    return catalog
      .filter(item => 
        item.name.toLowerCase().includes(searchTerm) || 
        item.sku.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => {
        const aExact = a.name.toLowerCase().includes(searchTerm) ? 1 : 0;
        const bExact = b.name.toLowerCase().includes(searchTerm) ? 1 : 0;
        if (aExact !== bExact) return bExact - aExact;
        return a.name.length - b.name.length;
      })
      .slice(0, 5);
  }

  private getCatalog(): CatalogRecord[] {
    if (!fs.existsSync(catalogFile)) {
      return [];
    }
    try {
      const data = fs.readFileSync(catalogFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveCatalog(catalog: CatalogRecord[]) {
    fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2));
  }

  // Order operations
  insertOrder(order: OrderRecord) {
    const orders = this.getOrders();
    const existingIndex = orders.findIndex(o => o.id === order.id);
    if (existingIndex >= 0) {
      orders[existingIndex] = order;
    } else {
      orders.push(order);
    }
    this.saveOrders(orders);
  }

  getOrder(id: string): OrderRecord | null {
    const orders = this.getOrders();
    return orders.find(order => order.id === id) || null;
  }

  getAllOrders(): OrderRecord[] {
    return this.getOrders().sort((a, b) => 
      new Date(b.processed_at).getTime() - new Date(a.processed_at).getTime()
    );
  }

  private getOrders(): OrderRecord[] {
    if (!fs.existsSync(ordersFile)) {
      return [];
    }
    try {
      const data = fs.readFileSync(ordersFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private saveOrders(orders: OrderRecord[]) {
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  }
}

export const db = new SimpleDB();
