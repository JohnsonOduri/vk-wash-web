import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAuthCard } from "@/components/auth/CustomerAuthCard";
import { DeliveryAuthCard } from "@/components/auth/DeliveryAuthCard";
import Navigation from "@/components/Navigation";

const Login = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCustomerLogin = () => {
    // Simulate a check for Delivery Staff using Customer login
    const isDeliveryStaff = true; // Replace with actual logic
    if (isDeliveryStaff) {
      setError("Please use the Delivery Staff Login.");
    } else {
      setError("");
      // Proceed with Customer login
    }
  };

  const handleDeliveryLogin = () => {
    // Simulate successful Delivery Staff login
    const isLoginSuccessful = true; // Replace with actual logic
    if (isLoginSuccessful) {
      navigate("/delivery-dashboard"); // Redirect to Delivery Dashboard
    } else {
      setError("Invalid login credentials.");
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
            
            <TabsContent value="customer">
              {error && <p className="text-red-500">{error}</p>}
              <CustomerAuthCard onLogin={handleCustomerLogin} />
            </TabsContent>
            
            <TabsContent value="delivery">
              {error && <p className="text-red-500">{error}</p>}
              <DeliveryAuthCard onLogin={handleDeliveryLogin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
