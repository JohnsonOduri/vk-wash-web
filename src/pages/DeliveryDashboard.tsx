
import { useState, useEffect, useMemo } from 'react';
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
import { LogOut, Home, Activity, KeyRound } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import DeliveryOrders from '@/components/delivery/DeliveryOrders';
import ManageItems from '@/components/delivery/ManageItems';
import CreateBill from '@/components/delivery/CreateBill';
import ManagePayments from '@/components/delivery/ManagePayments';
import CustomersTab from '@/components/delivery/CustomersTab';
import AdminAnalytics from '@/components/delivery/AdminAnalytics';
import AdminActivityPanel from '@/components/delivery/AdminActivityPanel';
import { isAdminEmail } from '@/lib/admin';
import QuickChangePasswordDialog from '@/components/delivery/QuickChangePasswordDialog';

const DeliveryDashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('activeOrders');
  const [activityOpen, setActivityOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const location = useLocation();

  const isAdmin = useMemo(() => isAdminEmail(user?.email), [user?.email]);
  
  useEffect(() => {
    // Redirect to login if not authenticated or not delivery/admin
    if (!user || (user.role !== 'delivery' && !isAdmin)) {
      navigate('/login');
    }
  }, [user, navigate, isAdmin]);

  useEffect(() => {
    if (!isAdmin && activeTab === 'analytics') {
      setActiveTab('activeOrders');
    }
  }, [isAdmin, activeTab]);

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
              <Button variant="ghost" size="sm" onClick={() => setPasswordOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                Change Password
              </Button>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => setActivityOpen(true)}>
                  <Activity className="mr-2 h-4 w-4" />
                  Activity
                </Button>
              )}
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
            {isAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
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
          {isAdmin && (
            <TabsContent value="analytics">
              <AdminAnalytics />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {isAdmin && (
        <AdminActivityPanel
          open={activityOpen}
          onOpenChange={setActivityOpen}
          adminEmail={user?.email}
        />
      )}
      <QuickChangePasswordDialog
        open={passwordOpen}
        onOpenChange={setPasswordOpen}
        email={user?.email}
      />
    </div>
  );
};

export default DeliveryDashboard;
