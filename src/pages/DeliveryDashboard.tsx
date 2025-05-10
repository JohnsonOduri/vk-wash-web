
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DeliveryOrders from '@/components/delivery/DeliveryOrders';
import ManageItems from '@/components/delivery/ManageItems';
import CreateBill from '@/components/delivery/CreateBill';

const DeliveryDashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('activeOrders');
  
  useEffect(() => {
    // Redirect to login if not authenticated or not a delivery person
    if (!user || user.role !== 'delivery') {
      navigate('/login');
    }
  }, [user, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out'
    });
  };
  
  const handleCreateBill = (order) => {
    setSelectedOrder(order);
    setActiveTab('bill');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/lovable-uploads/f6071df1-f9c6-4598-90f2-6eb900efc9aa.png" alt="VK Wash Logo" className="h-8" />
              <div>
                <h1 className="text-lg font-bold">Delivery Dashboard</h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-custom py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="activeOrders">Active Orders</TabsTrigger>
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="bill">Create Bill</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activeOrders">
            <DeliveryOrders onCreateBill={handleCreateBill} />
          </TabsContent>
          
          <TabsContent value="items">
            <ManageItems />
          </TabsContent>
          
          <TabsContent value="bill">
            <CreateBill 
              orderId={selectedOrder?.id} 
              customerInfo={selectedOrder ? {
                customerId: selectedOrder.customerId,
                customerName: selectedOrder.customerName,
                customerPhone: selectedOrder.customerPhone
              } : null}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeliveryDashboard;
