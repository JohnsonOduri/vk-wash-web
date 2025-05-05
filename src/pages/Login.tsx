
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerAuthCard } from "@/components/auth/CustomerAuthCard";
import { DeliveryAuthCard } from "@/components/auth/DeliveryAuthCard";
import Navigation from "@/components/Navigation";

const Login = () => {
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
              <CustomerAuthCard />
            </TabsContent>
            
            <TabsContent value="delivery">
              <DeliveryAuthCard />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
