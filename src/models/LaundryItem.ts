
// Add the OrderItem interface which was missing
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface LaundryItem {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'processing' | 'completed';
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillItem {
  id?: string;
  name: string;
  price: number;
  quantity: number;
  total: number; // Added the total property
}

export interface Bill {
  id: string;
  customerId: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  createdAt: Date;
  paymentMethod?: string;
  orderId?: string;
}

export type LaundryItemStatus = 'pending' | 'processing' | 'completed';
