
export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: Date;
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
  date: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'google_pay' | 'internet_banking' | 'phone_pay' | 'paytm';
  paymentDate?: Date;
}
