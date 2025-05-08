
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
  serviceType: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'picked' | 'processing' | 'delivering' | 'delivered' | 'cancelled';
  pickupAddress: string;
  pickupDate: string;
  specialInstructions?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  deliveryPersonId?: string;
  cancelReason?: string;
}

export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<string> => {
  const orderWithTimestamps = {
    ...orderData,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
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
      ...docSnap.data()
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

export const assignDeliveryPerson = async (orderId: string, deliveryPersonId: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    deliveryPersonId,
    updatedAt: serverTimestamp(),
  });
};

export const getAllPendingOrders = async (): Promise<Order[]> => {
  try {
    // Fetch orders with status "pending" or "active"
    const q = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'active'])
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
    console.error("Error fetching pending/active orders:", error); // Log the error
    throw error; // Re-throw the error to handle it in the calling function
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
