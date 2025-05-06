
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Home, Package, Image, CheckCircle, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DeliveryOrderCard from '@/components/delivery/DeliveryOrderCard';
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
            <TabsTrigger value="myOrders">My Orders</TabsTrigger>
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="bill">Create Bill</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activeOrders">
            <DeliveryOrders />
          </TabsContent>
          
          <TabsContent value="myOrders" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">My Assigned Orders</h2>
              {/* This would be populated with orders assigned to this delivery person */}
              {/* For now, displaying a placeholder */}
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Orders Assigned</h3>
                  <p className="text-gray-500 text-center">
                    You haven't accepted any orders yet
                  </p>
                </CardContent>
              </Card>
            </div>
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
