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
  Timestamp,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface OrderItem {
  category: any;
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
  status: 'pending' | 'picked' | 'processing' | 'ready' | 'delivering' | 'delivered' | 'completed' | 'cancelled';
  pickupAddress: string;
  pickupDate: string;
  specialInstructions?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  deliveryPersonId?: string;
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  cancelReason?: string;
  billId?: string;
  reviewId?: string;
  rating?: number;
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
  const q = query(
    collection(db, 'orders'), 
    where('userId', '==', userId),
    orderBy('pickupDate', 'desc')
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
};

export const getActiveOrdersByUser = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    where('status', 'in', ['pending', 'picked', 'processing', 'ready', 'delivering'])
  );
  
  const querySnapshot = await getDocs(q);
  
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data()
    } as Order);
  });
  
  // Sort by pickup date (oldest first)
  orders.sort((a, b) => {
    const dateA = new Date(a.pickupDate);
    const dateB = new Date(b.pickupDate);
    return dateA.getTime() - dateB.getTime();
  });
  
  return orders;
};

export const getCompletedOrdersByUser = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId),
    where('status', 'in', ['delivered', 'completed', 'cancelled'])
  );
  
  const querySnapshot = await getDocs(q);
  
  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data()
    } as Order);
  });
  
  // Sort by date (newest first)
  orders.sort((a, b) => {
    const dateA = a.updatedAt instanceof Date ? a.updatedAt : a.updatedAt.toDate();
    const dateB = b.updatedAt instanceof Date ? b.updatedAt : b.updatedAt.toDate();
    return dateB.getTime() - dateA.getTime();
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

    // Sort by pickup date (oldest first)
    orders.sort((a, b) => {
      const dateA = new Date(a.pickupDate);
      const dateB = new Date(b.pickupDate);
      return dateA.getTime() - dateB.getTime();
    });

    return orders;
  } catch (error) {
    console.error("Error fetching pending/ready orders:", error);
    throw error;
  }
};

export const getDeliveryPersonOrders = async (deliveryPersonId: string): Promise<Order[]> => {
  const q = query(
    collection(db, 'orders'), 
    where('deliveryPersonId', '==', deliveryPersonId),
    where('status', 'in', ['picked', 'processing', 'ready', 'delivering'])
  );
  const querySnapshot = await getDocs(q);

  const orders: Order[] = [];
  querySnapshot.forEach((doc) => {
    orders.push({
      id: doc.id,
      ...doc.data(),
    } as Order);
  });

  // Sort by pickup date (oldest first)
  orders.sort((a, b) => {
    const dateA = new Date(a.pickupDate);
    const dateB = new Date(b.pickupDate);
    return dateA.getTime() - dateB.getTime();
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

export const updateOrderBillId = async (orderId: string, billId: string): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    billId,
    updatedAt: serverTimestamp()
  });
};

export const addOrderReview = async (orderId: string, reviewId: string, rating: number): Promise<void> => {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, {
    reviewId,
    rating,
    updatedAt: serverTimestamp()
  });
};

// Add this function to get bills by order ID
export const getBillsByOrderId = async (orderId: string): Promise<any | null> => {
  const q = query(collection(db, 'bills'), where('orderId', '==', orderId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    ...data
  };
};
