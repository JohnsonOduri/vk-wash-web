import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";

export const CustomerAuthCard = ({ onLogin }: { onLogin: () => void }) => {
  const { user } = useFirebaseAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  const handleCustomerLogin = () => {
    if (user?.role === "delivery") {
      toast({
        title: "Access Denied",
        description: "You are logged in as Delivery Staff. Please use the Delivery Staff Login section.",
        variant: "destructive",
      });
    } else {
      onLogin();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRegistering ? "Customer Registration" : "Customer Login"}</CardTitle>
        <CardDescription>
          {isRegistering 
            ? "Create a new customer account" 
            : "Sign in with your email and password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRegistering 
          ? <RegisterForm onToggleForm={toggleForm} /> 
          : <LoginForm onToggleForm={toggleForm} onSubmit={handleCustomerLogin} />}
      </CardContent>
    </Card>
  );
};
