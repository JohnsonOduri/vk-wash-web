
// For basic type definitions in the laundry management system

export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: 'regular' | 'premium' | 'express';
  createdAt: Date;
  updatedAt: Date;
  status?: string;
  quantity?: number;
  customerId?: string;
}

export interface OrderItem extends LaundryItem {
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date?: Date;
  createdAt: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'card' | 'upi' | 'google pay' | 'phone pay' | 'paytm' | 'internet banking';
  paymentDate?: Date;
  orderId?: string;
}
