import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export const CustomerAuthCard = ({ onLogin }: { onLogin: () => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
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
          : <LoginForm onToggleForm={toggleForm} onSubmit={onLogin} />}
      </CardContent>
    </Card>
  );
};
