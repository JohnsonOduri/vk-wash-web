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
  deleteDoc,
  orderBy,
  increment,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LaundryItem, Bill } from '@/models/LaundryItem';

/* --------------------------- Laundry Item APIs --------------------------- */

export const createLaundryItem = async (itemData: Partial<LaundryItem>): Promise<string> => {
  const itemWithTimestamp = {
    ...itemData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: itemData.status || 'pending',
    quantity: itemData.quantity || 1,
    customerId: itemData.customerId || '',
  };

  const docRef = await addDoc(collection(db, 'laundryItems'), itemWithTimestamp);
  return docRef.id;
};

export const getAllLaundryItems = async (): Promise<LaundryItem[]> => {
  const querySnapshot = await getDocs(collection(db, 'laundryItems'));
  
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      price: data.price,
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      status: data.status || 'pending',
      quantity: data.quantity || 1,
      customerId: data.customerId || ''
    } as LaundryItem;
  });
};

export const getLaundryItemByCategory = async (category: string): Promise<LaundryItem[]> => {
  const q = query(collection(db, 'laundryItems'), where('category', '==', category));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name,
      price: data.price,
      category: data.category,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      status: data.status || 'pending',
      quantity: data.quantity || 1,
      customerId: data.customerId || ''
    } as LaundryItem;
  });
};

export const getLaundryItemById = async (itemId: string): Promise<LaundryItem | null> => {
  const docRef = doc(db, 'laundryItems', itemId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    name: data.name,
    price: data.price,
    category: data.category,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    status: data.status || 'pending',
    quantity: data.quantity || 1,
    customerId: data.customerId || ''
  } as LaundryItem;
};

export const deleteLaundryItem = async (itemId: string): Promise<void> => {
  await deleteDoc(doc(db, 'laundryItems', itemId));
};

/* ------------------------------ Bill APIs ------------------------------ */

/**
 * Create a new Bill with branch-specific atomic counter
 * Uses Firestore increment() instead of transaction to prevent 429 errors
 */
export const createBill = async (billData: Omit<Bill, 'id' | 'status' | 'createdAt'>): Promise<string> => {
  // Normalize branch code
  const branchRaw = (billData as any).branch ? String((billData as any).branch) : 'DEF';
  const branchCode = branchRaw.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase().padEnd(3, 'X');

  const counterDocRef = doc(db, 'counters', `bills_${branchCode}`);

  // Step 1: Safely increment counter atomically
  try {
    await updateDoc(counterDocRef, { count: increment(1) });
  } catch (err: any) {
    // If counter document doesn’t exist yet, create it
    if (err.code === 'not-found') {
      await setDoc(counterDocRef, { count: 1 });
    } else {
      console.error('Error updating counter:', err);
      throw err;
    }
  }

  // Step 2: Read updated counter value once (not in a transaction)
  const counterSnap = await getDoc(counterDocRef);
  const nextSeq = (counterSnap.data()?.count as number) || 1;

  // Step 3: Generate formatted Order ID
  const width = Math.max(4, String(nextSeq).length);
  const padded = String(nextSeq).padStart(width, '0');
  const orderId = `VK-${branchCode}-${padded}`;

  // Step 4: Add bill document
  const billWithDetails = {
    ...billData,
    orderId,
    createdAt: serverTimestamp(),
    date: serverTimestamp(),
    status: 'pending'
  };

  const docRef = await addDoc(collection(db, 'bills'), billWithDetails);
  return docRef.id;
};

export const getBillsByCustomerId = async (customerId: string): Promise<Bill[]> => {
  const q = query(collection(db, 'bills'), where('customerId', '==', customerId));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
    } as Bill;
  });
};

export const getBillById = async (billId: string): Promise<Bill | null> => {
  const docRef = doc(db, 'bills', billId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate(),
    createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
    paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
  } as Bill;
};

export const getBillsByStatus = async (status: 'pending' | 'paid' | 'cancelled'): Promise<Bill[]> => {
  const q = query(collection(db, 'bills'), where('status', '==', status), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      date: data.date?.toDate(),
      createdAt: data.createdAt?.toDate() || new Date(),
      paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
    } as Bill;
  });
};

export const updateBillPayment = async (
  billId: string,
  paymentMethod: Bill['paymentMethod'],
  paidAmount?: number,
  pendingAmount?: number
): Promise<void> => {
  const docRef = doc(db, 'bills', billId);

  if (typeof paidAmount === 'number' && typeof pendingAmount === 'number') {
    await updateDoc(docRef, {
      total: pendingAmount,
      status: 'pending',
      paymentMethod,
      paymentDate: serverTimestamp(),
    });
  } else {
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

  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();

  return {
    id: docSnap.id,
    ...data,
    date: data.date?.toDate(),
    createdAt: data.createdAt?.toDate() || data.date?.toDate() || new Date(),
    paymentDate: data.paymentDate ? data.paymentDate.toDate() : undefined
  } as Bill;
};

export const updateBillPartialPayment = async (billId: string, amount: number) => {
  try {
    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);

    if (!billDoc.exists()) throw new Error('Bill not found');

    const billData = billDoc.data();
    const currentAmountPaid = billData.amountPaid || 0;
    const newAmountPaid = currentAmountPaid + amount;
    const totalAmount = billData.totalAmount || 0;
    const remainingBalance = totalAmount - newAmountPaid;
    const paymentStatus = newAmountPaid >= totalAmount ? 'Paid' : 'Partially Paid';

    await updateDoc(billRef, {
      amountPaid: newAmountPaid,
      remainingBalance,
      paymentStatus,
      lastUpdated: new Date().toISOString(),
    });

    return {
      success: true,
      message: `Payment of ${amount} recorded successfully.`,
      paymentStatus,
    };
  } catch (error: any) {
    console.error('Error updating bill partial payment:', error);
    return {
      success: false,
      message: `Error updating payment: ${error.message}`,
    };
  }
};
