
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type UserRole = "customer" | "delivery" | null;

interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: UserRole;
  uniqueId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithOTP: (phone: string, otp: string) => Promise<boolean>;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  generateUniqueId: (phone: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check localStorage for existing user
    const storedUser = localStorage.getItem('vkwash_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
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
      // Simulate OTP verification (in a real app, this would call an API)
      // For demo purposes, we accept any OTP
      if (otp.length === 6) {
        const uniqueId = generateUniqueId(phone);
        const newUser = {
          id: crypto.randomUUID(),
          phone,
          role: "customer" as UserRole,
          uniqueId
        };
        setUser(newUser);
        localStorage.setItem('vkwash_user', JSON.stringify(newUser));
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
      // Simulate email login (in a real app, this would call an API)
      // For demo purposes, any non-empty password works
      if (password.length > 0) {
        const newUser = {
          id: crypto.randomUUID(),
          email,
          role: "delivery" as UserRole,
          name: "Delivery Staff" // Default name
        };
        setUser(newUser);
        localStorage.setItem('vkwash_user', JSON.stringify(newUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vkwash_user');
  };

  const value = {
    user,
    isLoading,
    loginWithOTP,
    loginWithEmail,
    logout,
    generateUniqueId
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
