
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt?: Date;
}

export const createCustomer = async (customerData: Omit<Customer, 'createdAt'>): Promise<string> => {
  try {
    // Check if customer exists first
    const exists = await checkCustomerExists(customerData.phone);
    
    if (exists) {
      throw new Error('Customer with this phone number already exists');
    }
    
    const customerWithTimestamps = {
      ...customerData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'customers'), customerWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
  try {
    const docRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Customer;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting customer:', error);
    throw error;
  }
};

export const getCustomerByPhone = async (phone: string): Promise<Customer | null> => {
  try {
    const q = query(collection(db, 'customers'), where('phone', '==', phone));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Customer;
    }
    
    return null;
  } catch (error) {
    console.error('Error finding customer by phone:', error);
    throw error;
  }
};

export const checkCustomerExists = async (phone: string): Promise<boolean> => {
  try {
    const customer = await getCustomerByPhone(phone);
    return customer !== null;
  } catch (error) {
    console.error('Error checking customer existence:', error);
    throw error;
  }
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'customers'));
    
    const customers: Customer[] = [];
    querySnapshot.forEach((doc) => {
      customers.push({
        id: doc.id,
        ...doc.data()
      } as Customer);
    });
    
    return customers;
  } catch (error) {
    console.error('Error getting all customers:', error);
    throw error;
  }
};
