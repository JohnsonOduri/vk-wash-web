
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
import ManageItems from '@/components/delivery/ManageItems';
import CreateBill from '@/components/delivery/CreateBill';

// Mock data for demonstration - in a real app this would come from an API
const mockOrders = [
  {
    id: '1',
    customerId: '12345',
    customerName: 'John Smith',
    customerPhone: '555-123-4567',
    address: '123 Main St, Apartment 4B, Cityville',
    service: 'Regular',
    status: 'Picked',
    createdAt: new Date(2025, 4, 1),
    estimatedDelivery: new Date(2025, 4, 3),
    items: ['Shirts (5)', 'Pants (2)'],
  },
  {
    id: '2',
    customerId: '67890',
    customerName: 'Sarah Johnson',
    customerPhone: '555-987-6543',
    address: '456 Park Ave, Suite 203, Townsville',
    service: 'Premium',
    status: 'Booked',
    createdAt: new Date(2025, 4, 2),
    estimatedDelivery: new Date(2025, 4, 4),
    items: ['Suits (2)', 'Dress (1)'],
  },
  {
    id: '3',
    customerId: '24680',
    customerName: 'Michael Brown',
    customerPhone: '555-456-7890',
    address: '789 Oak St, Unit 7, Villagetown',
    service: 'Express',
    status: 'Working',
    createdAt: new Date(2025, 4, 3),
    estimatedDelivery: new Date(2025, 4, 3),
    items: ['Shirts (3)'],
  }
];

const DeliveryDashboard = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(mockOrders);
  const [filter, setFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('orders');
  
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
  
  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    toast({
      title: 'Order Updated',
      description: `Order #${orderId} status changed to ${newStatus}`,
    });
  };
  
  const handleUploadImage = (orderId: string) => {
    // In a real app, this would trigger a file picker
    toast({
      title: 'Upload Success',
      description: 'Delivery image has been uploaded successfully',
    });
  };

  const handleCreateBill = (order) => {
    setSelectedOrder(order);
    setActiveTab('bill');
  };
  
  const filteredOrders = orders.filter(order => 
    filter === '' || 
    order.customerId.includes(filter) || 
    order.customerName.toLowerCase().includes(filter.toLowerCase())
  );
  
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
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="items">Manage Items</TabsTrigger>
            <TabsTrigger value="bill">Create Bill</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="space-y-6">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Assigned Orders</h2>
              
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="Search by customer ID or name..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-10"
                />
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map(order => (
                    <Card key={order.id} className="hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                            <CardDescription>
                              {order.service} • {order.status}
                            </CardDescription>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'Picked' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'Working' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-gray-100 text-gray-800'}`}
                          >
                            {order.status}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Customer</h4>
                          <p className="font-medium">{order.customerName}</p>
                          <p className="text-sm">{order.customerPhone}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Address</h4>
                          <p className="text-sm">{order.address}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Items</h4>
                          <ul className="text-sm list-disc list-inside">
                            {order.items.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUploadImage(order.id)}
                            className="flex-1"
                          >
                            <Image className="mr-2 h-4 w-4" />
                            Upload Image
                          </Button>
                          
                          <Button 
                            size="sm"
                            onClick={() => handleCreateBill(order)}
                            className="flex-1"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Create Bill
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="md:col-span-2 lg:col-span-3">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Package className="h-12 w-12 text-gray-300 mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-1">No Orders Found</h3>
                      <p className="text-gray-500 text-center">
                        {filter 
                          ? "No orders match your search criteria" 
                          : "You don't have any assigned orders right now"}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
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
