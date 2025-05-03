import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Package, User, LogOut, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import CustomerOrders from '@/components/customer/CustomerOrders';
import CustomerProfile from '@/components/customer/CustomerProfile';
import CustomerBooking from '@/components/customer/CustomerBooking';

// Mock data for demonstration - in a real app this would come from an API
const mockOrders = [
  {
    id: '1',
    service: 'Regular',
    status: 'Delivered',
    createdAt: new Date(2025, 4, 1),
    deliveredAt: new Date(2025, 4, 3),
    items: ['Shirts (5)', 'Pants (2)'],
    total: 35,
    progress: 100,
    deliveryPerson: {
      name: 'John Doe',
      id: 'D1234',
      image: '/placeholder.svg'
    }
  },
  {
    id: '2',
    service: 'Premium',
    status: 'Working',
    createdAt: new Date(2025, 4, 2),
    items: ['Suits (2)', 'Dress (1)'],
    total: 65,
    progress: 50,
    deliveryPerson: {
      name: 'Jane Smith',
      id: 'D5678',
      image: '/placeholder.svg'
    }
  },
  {
    id: '3',
    service: 'Express',
    status: 'Picked',
    createdAt: new Date(2025, 5, 3),
    items: ['Shirts (3)'],
    total: 25,
    progress: 25,
    deliveryPerson: {
      name: 'Mike Johnson',
      id: 'D9012',
      image: '/placeholder.svg'
    }
  }
];

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

  if (!user || user.role !== 'customer') {
    return <Navigate to="/login" />;
  }

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
                <p className="text-sm text-gray-500">ID: {user.uniqueId}</p>
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
        <Tabs defaultValue="orders" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="book">
              <Clock className="h-4 w-4 mr-2" />
              Book Service
            </TabsTrigger>
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="orders">
              <Routes>
                <Route path="/" element={<CustomerOrders orders={mockOrders} />} />
                <Route path="*" element={<Navigate to="." />} />
              </Routes>
            </TabsContent>
            
            <TabsContent value="book">
              <Routes>
                <Route path="/" element={<CustomerBooking />} />
                <Route path="*" element={<Navigate to="." />} />
              </Routes>
            </TabsContent>
            
            <TabsContent value="profile">
              <Routes>
                <Route path="/" element={<CustomerProfile user={user} />} />
                <Route path="*" element={<Navigate to="." />} />
              </Routes>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default CustomerDashboard;
