
// Define all interfaces in a consistent way that matches their usage in the app

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  category?: string;
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed';
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  category: string;
}

export interface BillItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  paymentMethod?: string;
  paymentDate?: Date;
  date?: Date; // Added for compatibility with existing code
  orderId?: string;
}

export type LaundryItemStatus = 'pending' | 'processing' | 'completed';
