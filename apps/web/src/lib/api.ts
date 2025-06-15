import { Order, OrderSummary } from './types';

const API_BASE = 'http://localhost:4000';

export const api = {
  async getOrders() {
    const response = await fetch(`${API_BASE}/orders`);
    if (!response.ok) throw new Error('Failed to fetch orders');
    return response.json();
  },

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${API_BASE}/orders/${id}`);
    if (!response.ok) throw new Error('Failed to fetch order');
    return response.json();
  },

  async getOrderPDF(id: string) {
    const response = await fetch(`${API_BASE}/orders/${id}/pdf`);
    if (!response.ok) throw new Error('Failed to fetch PDF');
    return response.blob();
  },

  async refreshOrders() {
    const response = await fetch(`${API_BASE}/orders/refresh`, {
      method: 'POST'
    });
    if (!response.ok) throw new Error('Failed to refresh orders');
    return response.json();
  }
};
