
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
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
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  registerWithEmail: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  generateUniqueId: (identifier: string) => string;
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
            name: firebaseUser.displayName || undefined,
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

  // Generate a 5-digit unique ID based on identifier (email or phone)
  const generateUniqueId = (identifier: string): string => {
    // Take last 5 digits of phone number or hash if not enough digits
    const digits = identifier.replace(/\D/g, '');
    if (digits.length >= 5) {
      return digits.slice(-5);
    } else {
      // Simple hash function for short identifiers
      let hash = 0;
      for (let i = 0; i < identifier.length; i++) {
        hash = ((hash << 5) - hash) + identifier.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash % 100000).toString().padStart(5, '0');
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        const uniqueId = generateUniqueId(firebaseUser.email || firebaseUser.uid);
        await setDoc(doc(db, "users", firebaseUser.uid), {
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          role: "customer",
          uniqueId
        });
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Google login error:", error);
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
    loginWithGoogle,
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
