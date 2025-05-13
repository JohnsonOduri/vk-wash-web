
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Review {
  id?: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date | any;
}

export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  const reviewWithTimestamp = {
    ...reviewData,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, 'reviews'), reviewWithTimestamp);
  return docRef.id;
};

export const getReviewById = async (reviewId: string): Promise<Review | null> => {
  const docRef = doc(db, 'reviews', reviewId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Review;
  }
  
  return null;
};

export const getAllReviews = async (): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const reviews: Review[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    reviews.push({
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date()
    } as Review);
  });
  
  return reviews;
};

export const getReviewsByUserId = async (userId: string): Promise<Review[]> => {
  const q = query(
    collection(db, 'reviews'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  
  const reviews: Review[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.userId === userId) {
      reviews.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      } as Review);
    }
  });
  
  return reviews;
};

export const calculateAverageRating = async (): Promise<number> => {
  const reviews = await getAllReviews();
  
  if (reviews.length === 0) {
    return 0;
  }
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return sum / reviews.length;
};
