import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { db } from './db';
import { CatalogItem } from './types';

export async function loadCatalog(): Promise<CatalogItem[]> {
  const catalogPath = path.join(__dirname, '../../../data/Product Catalog.csv');
  const items: CatalogItem[] = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(catalogPath)
      .pipe(csv())
      .on('data', (row) => {
        const item: CatalogItem = {
          sku: row.Product_Code,
          description: row.Product_Name,
          price: parseFloat(row.Price),
          stock: parseInt(row.Available_in_Stock),
          moq: parseInt(row.Min_Order_Quantity)
        };
        items.push(item);

        // Insert into database
        db.insertCatalogItem({
          sku: item.sku,
          name: item.description,
          price: item.price,
          stock: item.stock,
          moq: item.moq,
          description: row.Description || item.description
        });
      })
      .on('end', () => {
        console.log(`Loaded ${items.length} catalog items`);
        resolve(items);
      })
      .on('error', reject);
  });
}

export function searchCatalog(query: string): CatalogItem[] {
  const results = db.searchCatalog(query);
  return results.map(item => ({
    sku: item.sku,
    description: item.name,
    price: item.price,
    stock: item.stock,
    moq: item.moq
  }));
}

export function getCatalogItem(sku: string): CatalogItem | null {
  const item = db.getCatalogItem(sku);
  if (!item) return null;
  
  return {
    sku: item.sku,
    description: item.name,
    price: item.price,
    stock: item.stock,
    moq: item.moq
  };
}
