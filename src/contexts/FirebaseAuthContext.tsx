
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  PhoneAuthProvider,
  signInWithCredential,
  User as FirebaseUser
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserRole = "customer" | "delivery" | null;

interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: UserRole;
  uniqueId?: string;
}

interface FirebaseAuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithOTP: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  generateUniqueId: (phone: string) => string;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export const FirebaseAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoading(true);
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as Omit<User, "id">;
          setUser({
            id: firebaseUser.uid,
            ...userData
          });
        } else {
          // If no user document exists yet, create minimal user object
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined,
            role: "customer", // Default role
          });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Generate a 5-digit unique ID based on phone number
  const generateUniqueId = (phone: string): string => {
    // Take last 5 digits of phone number or hash if not enough digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 5) {
      return digits.slice(-5);
    } else {
      // Simple hash function for short phone numbers
      let hash = 0;
      for (let i = 0; i < phone.length; i++) {
        hash = ((hash << 5) - hash) + phone.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash % 100000).toString().padStart(5, '0');
    }
  };

  const loginWithOTP = async (phone: string, otp: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // In a real implementation, you would verify the OTP with Firebase
      // This is a simplified example
      if (otp.length === 6) {
        // For demo purposes only - in a real app you would use Firebase phone auth
        const uniqueId = generateUniqueId(phone);
        const newUser = {
          phone,
          role: "customer" as UserRole,
          uniqueId
        };
        
        // Create/update user document in Firestore
        // Note: In a real implementation, this would happen after successful phone authentication
        await setDoc(doc(db, "users", "phone_" + phone.replace(/\D/g, '')), {
          ...newUser
        }, { merge: true });
        
        // Set local user state
        setUser({
          id: "phone_" + phone.replace(/\D/g, ''),
          ...newUser
        });
        
        setIsLoading(false);
        return true;
      }
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create user document if it doesn't exist
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email,
          role: "delivery", // Default role for email login
          name: "Delivery Staff" // Default name
        });
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      return false;
    }
  };
  
  const registerWithEmail = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        role,
        name: role === "delivery" ? "Delivery Staff" : undefined
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    isLoading,
    loginWithOTP,
    loginWithEmail,
    registerWithEmail,
    logout,
    generateUniqueId
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error("useFirebaseAuth must be used within a FirebaseAuthProvider");
  }
  return context;
};
