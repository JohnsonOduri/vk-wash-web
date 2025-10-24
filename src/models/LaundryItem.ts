
export interface LaundryItem {
  id: string;
  name: string;
  price: number;
  category: "regular" | "premium" | "express";
  description?: string;
  createdAt: Date;
  status?: string;
  quantity?: number;
  customerId?: string;
  updatedAt?: Date;
}

export interface OrderItem extends LaundryItem {
  quantity: number;
  total: number;
}

export interface Bill {
  id?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  date?: Date;
  createdAt?: Date;
  items: OrderItem[];
  subtotal: number;
  tax: number; // Added tax property
  total: number;
  status?: 'pending' | 'paid' | 'cancelled';
  paymentMethod?: 'cash' | 'online' | 'card' | 'upi';
  paymentDate?: Date;
  orderId?: string;
  // Optional delivery / metadata
  branch?: string;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  // Array of partial payments if any
  payments?: Array<{
    amount: number;
    method?: string;
    date?: Date;
  }>;
}
