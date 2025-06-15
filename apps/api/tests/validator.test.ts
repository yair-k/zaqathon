import { describe, it, expect, vi } from 'vitest';
import { enrichOrder } from '../src/validator';
import { ExtractedOrder } from '../src/llm';

// Mock catalog module
vi.mock('../src/catalog', () => ({
  getCatalogItem: vi.fn((sku: string) => {
    if (sku === 'DSK-0001') {
      return {
        sku: 'DSK-0001',
        description: 'Desk TRÄNHOLM 19',
        price: 902.78,
        stock: 31,
        moq: 2
      };
    }
    return null;
  }),
  searchCatalog: vi.fn((query: string) => {
    if (query.includes('TRÄNHOLM')) {
      return [{
        sku: 'DSK-0001',
        description: 'Desk TRÄNHOLM 19',
        price: 902.78,
        stock: 31,
        moq: 2
      }];
    }
    return [];
  })
}));

describe('Order Validator', () => {
  it('should validate a perfect order', () => {
    const extracted: ExtractedOrder = {
      customer: {
        name: 'John Doe',
        address: '123 Main St'
      },
      items: [{
        product: 'DSK-0001',
        quantity: 5,
        confidence: 0.9
      }],
      delivery: {
        date: '2025-06-20',
        address: '123 Main St'
      }
    };

    const result = enrichOrder(extracted, 'test-123', 'test.txt');

    expect(result.items[0].validations).toHaveLength(0);
    expect(result.items[0].sku).toBe('DSK-0001');
    expect(result.overallConfidence).toBe(0.9);
  });

  it('should detect stock issues', () => {
    const extracted: ExtractedOrder = {
      customer: {
        name: 'John Doe',
        address: '123 Main St'
      },
      items: [{
        product: 'DSK-0001',
        quantity: 50, // More than available stock (31)
        confidence: 0.9
      }],
      delivery: {
        date: '2025-06-20',
        address: '123 Main St'
      }
    };

    const result = enrichOrder(extracted, 'test-123', 'test.txt');

    expect(result.items[0].validations).toContain('Insufficient stock. Available: 31, Requested: 50');
  });

  it('should detect MOQ violations', () => {
    const extracted: ExtractedOrder = {
      customer: {
        name: 'John Doe',
        address: '123 Main St'
      },
      items: [{
        product: 'DSK-0001',
        quantity: 1, // Below MOQ of 2
        confidence: 0.9
      }],
      delivery: {
        date: '2025-06-20',
        address: '123 Main St'
      }
    };

    const result = enrichOrder(extracted, 'test-123', 'test.txt');

    expect(result.items[0].validations).toContain('Below minimum order quantity. MOQ: 2, Requested: 1');
  });
});
