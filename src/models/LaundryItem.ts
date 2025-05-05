
export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: Date;
}

export interface BillItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date: Date;
  items: BillItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  paymentDate?: Date;
}

// Adding OrderItem interface that was missing
export interface OrderItem extends LaundryItem {
  quantity: number;
  total: number;
}
