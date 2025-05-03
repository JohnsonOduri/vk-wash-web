
import { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { LogOut, Home, Package, User, Receipt } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

import CustomerBooking from '@/components/customer/CustomerBooking';
import CustomerOrders from '@/components/customer/CustomerOrders';
import CustomerProfile from '@/components/customer/CustomerProfile';
import BillViewer from '@/components/customer/BillViewer';

const CustomerDashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    // Redirect to login if not authenticated or not a customer
    if (!user || user.role !== 'customer') {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="/lovable-uploads/f6071df1-f9c6-4598-90f2-6eb900efc9aa.png" alt="VK Wash Logo" className="h-8" />
              <div>
                <h1 className="text-lg font-bold">Customer Dashboard</h1>
                <p className="text-sm text-gray-500">{user?.phone || user?.email}</p>
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
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="booking">Book Service</TabsTrigger>
            <TabsTrigger value="bills">My Bills</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <CustomerOrders customerId={user?.id} />
          </TabsContent>
          
          <TabsContent value="booking">
            <CustomerBooking customerId={user?.id} />
          </TabsContent>
          
          <TabsContent value="bills">
            <BillViewer customerId={user?.id} />
          </TabsContent>
          
          <TabsContent value="profile">
            <CustomerProfile user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CustomerDashboard;
