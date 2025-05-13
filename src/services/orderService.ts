import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc,
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId: string;
  customerName?: string;
  customerPhone?: string;
  serviceType: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'picked' | 'processing' | 'ready' | 'delivering' | 'delivered' | 'cancelled'; // Include 'ready'
  pickupAddress: string; // Ensure address is included
  pickupDate: string;
  specialInstructions?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  cancelReason?: string;
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  const orderWithTimestamps = {
    ...orderData,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'orders'), orderWithTimestamps);
  return docRef.id;
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data()
    } as Order);
  });
  
  return orders;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const docRef = doc(db, 'orders', orderId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data() // Ensure all fields, including name, phone, and address, are retrieved
    } as Order;
  }
  
  return null;
};

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const assignDeliveryPerson = async (orderId: string, deliveryPersonId: string, deliveryPersonName: string, deliveryPersonPhone: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    deliveryPersonId,
    deliveryPersonName,
    deliveryPersonPhone,
    updatedAt: serverTimestamp(),
  });
};

export const getAllPendingOrders = async (): Promise<Order[]> => {
  try {
    // Fetch orders with status "pending", "ready"
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'ready'])
    );
    const querySnapshot = await getDocs(q);

    const orders: Order[] = [];
    querySnapshot.forEach((doc) => {
      orders.push({
        id: doc.id,
        ...doc.data()
      } as Order);
    });

    return orders;
  } catch (error) {
    console.error("Error fetching pending/ready orders:", error);
    throw error;
  }
};

export const getDeliveryPersonOrders = async (deliveryPersonId: string): Promise<Order[]> => {
  const q = query(collection(db, 'orders'), where('deliveryPersonId', '==', deliveryPersonId));
  const querySnapshot = await getDocs(q);

  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data(),
    } as Order);
  });

  return orders;
};

export const deleteOrder = async (orderId: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await deleteDoc(docRef);
};

export const rejectOrder = async (orderId: string, reason: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    status: 'cancelled',
    cancelReason: reason,
    updatedAt: serverTimestamp()
  });
};
