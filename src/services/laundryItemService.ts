
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LaundryItem, Bill, OrderItem } from '@/models/LaundryItem';

export const getLaundryItems = async (): Promise<LaundryItem[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'laundryItems'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LaundryItem));
  } catch (error) {
    console.error('Error getting laundry items:', error);
    throw error;
  }
};

export const getAllLaundryItems = async (): Promise<LaundryItem[]> => {
  return getLaundryItems();
};

export const getLaundryItemByCategory = async (category: string): Promise<LaundryItem[]> => {
  try {
    const q = query(collection(db, 'laundryItems'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as LaundryItem));
  } catch (error) {
    console.error('Error getting laundry items by category:', error);
    throw error;
  }
};

export const addLaundryItem = async (item: Omit<LaundryItem, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'laundryItems'), item);
    return docRef.id;
  } catch (error) {
    console.error('Error adding laundry item:', error);
    throw error;
  }
};

export const createLaundryItem = async (item: Omit<LaundryItem, 'id'>): Promise<string> => {
  return addLaundryItem(item);
};

export const updateLaundryItem = async (id: string, item: Partial<LaundryItem>): Promise<void> => {
  try {
    const itemRef = doc(db, 'laundryItems', id);
    await updateDoc(itemRef, item);
  } catch (error) {
    console.error('Error updating laundry item:', error);
    throw error;
  }
};

export const deleteLaundryItem = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'laundryItems', id));
  } catch (error) {
    console.error('Error deleting laundry item:', error);
    throw error;
  }
};

export const createBill = async (billData: Omit<Bill, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'bills'), {
      ...billData,
      createdAt: new Date(),
      status: 'pending'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
};

export const getBillsByCustomerId = async (customerId: string): Promise<Bill[]> => {
  try {
    const q = query(
      collection(db, 'bills'), 
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Bill));
  } catch (error) {
    console.error('Error getting bills by customer ID:', error);
    throw error;
  }
};

export const getBillsByStatus = async (status: string): Promise<Bill[]> => {
  try {
    const q = query(collection(db, 'bills'), where('status', '==', status), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Bill));
  } catch (error) {
    console.error('Error getting bills by status:', error);
    throw error;
  }
};

export const getBillsByOrderId = async (orderId: string): Promise<Bill | null> => {
  try {
    const q = query(collection(db, 'bills'), where('orderId', '==', orderId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Bill;
  } catch (error) {
    console.error('Error getting bill by order ID:', error);
    throw error;
  }
};

export const updateBillPayment = async (
  billId: string, 
  paymentMethod: 'cash' | 'upi' | 'card' | 'phonepe',
  amountPaid?: number,
  remainingAmount?: number
): Promise<void> => {
  try {
    const billRef = doc(db, 'bills', billId);
    
    if (amountPaid && remainingAmount !== undefined) {
      // Partial payment
      await updateDoc(billRef, {
        status: remainingAmount <= 0.01 ? 'paid' : 'partial',
        paymentMethod,
        paidAt: new Date(),
        paidAmount: amountPaid,
        total: remainingAmount <= 0.01 ? amountPaid : remainingAmount
      });
    } else {
      // Full payment
      await updateDoc(billRef, {
        status: 'paid',
        paymentMethod,
        paidAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error updating bill payment:', error);
    throw error;
  }
};

export const updateBillPartialPayment = async (
  billId: string,
  amountPaid: number,
  paymentMethod: 'cash' | 'upi' | 'card' | 'phonepe'
): Promise<void> => {
  try {
    const billRef = doc(db, 'bills', billId);
    const billDoc = await getDoc(billRef);
    
    if (!billDoc.exists()) {
      throw new Error('Bill not found');
    }
    
    const billData = billDoc.data() as Bill;
    const newPaidAmount = (billData.paidAmount || 0) + amountPaid;
    const isFullyPaid = newPaidAmount >= billData.total;
    
    await updateDoc(billRef, {
      paidAmount: newPaidAmount,
      status: isFullyPaid ? 'paid' : 'partial',
      paymentMethod,
      paidAt: new Date()
    });
  } catch (error) {
    console.error('Error updating bill partial payment:', error);
    throw error;
  }
};

export const getAllBills = async (): Promise<Bill[]> => {
  try {
    const q = query(collection(db, 'bills'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date()
    } as Bill));
  } catch (error) {
    console.error('Error getting all bills:', error);
    throw error;
  }
};

export const updateBillItems = async (billId: string, items: OrderItem[]): Promise<void> => {
  try {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + tax;

    const billRef = doc(db, 'bills', billId);
    await updateDoc(billRef, {
      items,
      subtotal,
      tax,
      total
    });
  } catch (error) {
    console.error('Error updating bill items:', error);
    throw error;
  }
};
