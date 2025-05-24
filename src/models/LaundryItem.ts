
export interface LaundryItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  category?: string;
  total?: number;
}

export interface Bill {
  id: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'upi' | 'card' | 'phonepe';
  createdAt: Date;
  date?: Date;
  paidAt?: Date;
}
