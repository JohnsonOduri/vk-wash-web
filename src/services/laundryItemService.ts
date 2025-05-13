import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  deleteDoc,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LaundryItem, Bill, OrderItem } from '@/models/LaundryItem';

export const createLaundryItem = async (itemData: Partial<LaundryItem>): Promise<string> => {
  const itemWithTimestamp = {
    ...itemData,
    createdAt: serverTimestamp(),
    status: itemData.status || 'pending',
    quantity: itemData.quantity || 1,
    customerId: itemData.customerId || '',
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(db, 'laundryItems'), itemWithTimestamp);
  return docRef.id;
};

export const getAllLaundryItems = async (): Promise<LaundryItem[]> => {
  const querySnapshot = await getDocs(collection(db, 'laundryItems'));
  
  const items: LaundryItem[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    items.push({
      id: doc.id,
      name: data.name,
      price: data.price,
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status || 'pending',
      quantity: data.quantity || 1, 
      customerId: data.customerId || '',
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as LaundryItem);
  });
  
  return items;
};

export const getLaundryItemByCategory = async (category: string): Promise<LaundryItem[]> => {
  const q = query(
    collection(db, 'laundryItems'),
    where('category', '==', category)
  );
  
  const querySnapshot = await getDocs(q);
  
  const items: LaundryItem[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    items.push({
      id: doc.id,
      name: data.name,
      price: data.price,
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status || 'pending',
      quantity: data.quantity || 1, 
      customerId: data.customerId || '',
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as LaundryItem);
  });
  
  return items;
};

export const getLaundryItemById = async (itemId: string): Promise<LaundryItem | null> => {
  const docRef = doc(db, 'laundryItems', itemId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      price: data.price,
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      status: data.status || 'pending',
      quantity: data.quantity || 1,
      customerId: data.customerId || '',
      updatedAt: data.updatedAt?.toDate() || new Date()
    } as LaundryItem;
  }
  
  return null;
};

export const deleteLaundryItem = async (itemId: string): Promise<void> => {
  const docRef = doc(db, 'laundryItems', itemId);
  await deleteDoc(docRef);
};

export const createBill = async (billData: Omit<Bill, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  const billWithDetails = {
    ...billData,
    createdAt: serverTimestamp(),
    date: serverTimestamp(), // Adding for backwards compatibility
    status: 'pending'
  };

  const docRef = await addDoc(collection(db, 'bills'), billWithDetails);
  return docRef.id;
};

export const getBillsByCustomerId = async (customerId: string): Promise<Bill[]> => {
  const q = query(collection(db, 'bills'), where('customerId', '==', customerId));
  const querySnapshot = await getDocs(q);
  
  const bills: Bill[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    bills.push({
      id: doc.id,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined,
      orderId: data.orderId
    } as Bill);
  });
  
  return bills;
};

export const getBillById = async (billId: string): Promise<Bill | null> => {
  const docRef = doc(db, 'bills', billId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined,
      orderId: data.orderId
    } as Bill;
  }
  
  return null;
};

export const getBillsByStatus = async (status: 'pending' | 'paid' | 'cancelled'): Promise<Bill[]> => {
  const q = query(
    collection(db, 'bills'), 
    where('status', '==', status),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const bills: Bill[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    bills.push({
      id: doc.id,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
      items: data.items,
      subtotal: data.subtotal,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined,
      orderId: data.orderId
    } as Bill);
  });
  
  return bills;
};

export const updateBillPayment = async (
  billId: string,
  paymentMethod: Bill['paymentMethod'],
  paidAmount?: number,
  pendingAmount?: number
): Promise<void> => {
  const docRef = doc(db, 'bills', billId);

  if (typeof paidAmount === 'number' && typeof pendingAmount === 'number') {
    // Partial payment: update total to pending amount and keep status as pending
    await updateDoc(docRef, {
      total: pendingAmount,
      status: 'pending',
      paymentMethod,
      paymentDate: serverTimestamp(),
    });
  } else {
    // Full payment: mark as paid
    await updateDoc(docRef, {
      status: 'paid',
      paymentMethod,
      paymentDate: serverTimestamp(),
    });
  }
};

export const getBillsByOrderId = async (orderId: string): Promise<Bill | null> => {
  const q = query(collection(db, 'bills'), where('orderId', '==', orderId));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  const doc = querySnapshot.docs[0];
  const data = doc.data();
  
  return {
    id: doc.id,
    customerId: data.customerId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    date: data.date?.toDate(),
    createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
    items: data.items,
    subtotal: data.subtotal,
    total: data.total,
    status: data.status,
    paymentMethod: data.paymentMethod,
    paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined,
    orderId: data.orderId
  } as Bill;
};
