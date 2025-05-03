
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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LaundryItem, Bill } from '@/models/LaundryItem';

export const createLaundryItem = async (itemData: Omit<LaundryItem, 'id' | 'createdAt'>): Promise<string> => {
  const itemWithTimestamp = {
    ...itemData,
    createdAt: serverTimestamp()
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
      createdAt: data.createdAt.toDate()
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
      createdAt: data.createdAt.toDate()
    } as LaundryItem;
  }
  
  return null;
};

export const createBill = async (billData: Omit<Bill, 'id' | 'date' | 'status'>): Promise<string> => {
  const billWithDetails = {
    ...billData,
    date: serverTimestamp(),
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
      date: data.date.toDate(),
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
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
      date: data.date.toDate(),
      items: data.items,
      subtotal: data.subtotal,
      tax: data.tax,
      total: data.total,
      status: data.status,
      paymentMethod: data.paymentMethod,
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
    } as Bill;
  }
  
  return null;
};

export const updateBillPayment = async (billId: string, paymentMethod: Bill['paymentMethod']): Promise<void> => {
  const docRef = doc(db, 'bills', billId);
  await updateDoc(docRef, {
    status: 'paid',
    paymentMethod,
    paymentDate: serverTimestamp()
  });
};
