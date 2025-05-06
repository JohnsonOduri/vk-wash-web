
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAuthCard } from "@/components/auth/CustomerAuthCard";
import { DeliveryAuthCard } from "@/components/auth/DeliveryAuthCard";
import Navigation from "@/components/Navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useFirebaseAuth();
  
  useEffect(() => {
    // Check if user is already logged in and redirect accordingly
    if (user) {
      if (user.role === "customer") {
        navigate("/customer-dashboard");
      } else if (user.role === "delivery") {
        navigate("/delivery-dashboard");
      }
    }
  }, [user, navigate]);

  const handleCustomerLogin = () => {
    const { user } = useFirebaseAuth();
    // Check if user is trying to use wrong login section
    if (user?.role === "delivery") {
      setError("You are logged in as Delivery Staff. Please use the Delivery Staff Login section.");
    } else {
      setError("");
      navigate("/customer-dashboard");
    }
  };

  const handleDeliveryLogin = () => {
    const { user } = useFirebaseAuth();
    // Check if user is trying to use wrong login section
    if (user?.role === "customer") {
      setError("You are logged in as a Customer. Please use the Customer Login section.");
    } else {
      setError("");
      navigate("/delivery-dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Staff</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="customer">
              <CustomerAuthCard onLogin={handleCustomerLogin} />
            </TabsContent>
            
            <TabsContent value="delivery">
              <DeliveryAuthCard onLogin={handleDeliveryLogin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
