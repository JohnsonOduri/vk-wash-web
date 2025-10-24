
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { LogOut, Home, Package, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DeliveryOrders from '@/components/delivery/DeliveryOrders';
import ManageItems from '@/components/delivery/ManageItems';
import CreateBill from '@/components/delivery/CreateBill';
import ManagePayments from '@/components/delivery/ManagePayments';
import CustomersTab from '@/components/delivery/CustomersTab';

const DeliveryDashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('activeOrders');
  const location = useLocation();
  
  useEffect(() => {
    // Redirect to login if not authenticated or not a delivery person
    if (!user || user.role !== 'delivery') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Check location state for initial active tab (e.g., coming from ManagePayments or other pages)
  useEffect(() => {
    try {
      const state = (location && (location as any).state) || {};
      if (state && state.activeTab) {
        setActiveTab(state.activeTab);
      }
    } catch (err) {
      // ignore
    }
  }, [location]);
  
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
            <TabsTrigger value="payments">Manage Payments</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activeOrders">
            <DeliveryOrders onCreateBill={handleCreateBill} initialTab={(location as any)?.state?.deliveryInnerTab} />
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

          <TabsContent value="payments">
            <ManagePayments />
          </TabsContent>
          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DeliveryDashboard;
