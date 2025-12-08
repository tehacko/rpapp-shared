// Shared API utilities

export const API_ENDPOINTS = {
  // Product endpoints
  PRODUCTS: '/api/products',
  PRODUCT_CLICK: '/api/products/:id/click',
  
  // Payment endpoints
  PAYMENT_CREATE_QR: '/api/payments/create-qr',
  PAYMENT_CREATE_MULTI_QR: '/api/payments/create-multi-qr',
  PAYMENT_CHECK_STATUS: '/api/payments/check-status/:paymentId',
  PAYMENT_COMPLETE: '/api/payments/complete',
  PAYMENT_COMPLETE_MULTI: '/api/payments/complete-multi',
  PAYMENT_CANCEL: '/api/payments/cancel',
  PAYMENT_START_MONITORING: '/api/payments/start-monitoring',
  PAYMENT_STOP_MONITORING: '/api/payments/stop-monitoring',
  
  // ThePay.eu payment endpoints
  PAYMENT_THEPAY_CREATE: '/api/payments/create-thepay',
  PAYMENT_THEPAY_STATUS: '/api/payments/thepay-status/:paymentId',
  PAYMENT_THEPAY_CANCEL: '/api/payments/thepay-cancel',
  PAYMENT_THEPAY_METHODS: '/api/payments/thepay-methods',
  
  // Admin endpoints
  ADMIN_LOGIN: '/api/admin/login',
  ADMIN_PRODUCTS: '/api/admin/products',
  ADMIN_PRODUCTS_INVENTORY: '/api/admin/products/inventory/:kioskId',
  ADMIN_PRODUCT_INVENTORY: '/api/admin/products/:id/inventory',
  ADMIN_PRODUCT_INVENTORY_UPDATE: '/api/admin/products/:productId/inventory/:kioskId',
  ADMIN_PRODUCT_KIOSK_VISIBILITY: '/api/admin/products/:productId/kiosk/:kioskId',
  ADMIN_KIOSKS: '/api/admin/kiosks',
  ADMIN_KIOSK_DETAILS: '/api/admin/kiosks/:id',
  ADMIN_LOGS: '/api/admin/logs',
  
  // System endpoints
  HEALTH: '/health',
  HEALTH_PAYMENT_PROVIDERS: '/health/payment-providers',
  CHECK_TRANSACTIONS: '/api/check-new-transactions',
  EVENTS: '/events/:kioskId'
} as const;

export class APIClient {
  private baseUrl: string;
  private kioskSecret?: string;

  constructor(baseUrl: string, kioskSecret?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.kioskSecret = kioskSecret;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add kiosk secret if available
    if (this.kioskSecret) {
      headers['X-Kiosk-Secret'] = this.kioskSecret;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

import { getEnvironmentConfig } from './config/environments';

export const createAPIClient = (baseUrl?: string, kioskSecret?: string) => {
  const url = baseUrl || getEnvironmentConfig().apiUrl;
  return new APIClient(url, kioskSecret);
};
