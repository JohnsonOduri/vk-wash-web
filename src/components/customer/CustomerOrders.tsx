
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ArrowRight, Clock, Package, MapPin, User, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface DeliveryPerson {
  name: string;
  id: string;
  image: string;
}

interface Order {
  id: string;
  service: string;
  status: string;
  createdAt: Date;
  deliveredAt?: Date;
  items: string[];
  total: number;
  progress: number;
  deliveryPerson: DeliveryPerson;
}

interface CustomerOrdersProps {
  orders: Order[];
}

const CustomerOrders = ({ orders }: CustomerOrdersProps) => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<string | null>(null);

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => 
    b.createdAt.getTime() - a.createdAt.getTime()
  );
  
  const currentOrders = sortedOrders.filter(order => order.status !== 'Delivered');
  const pastOrders = sortedOrders.filter(order => order.status === 'Delivered');

  const handleRateDelivery = (orderId: string) => {
    navigate('/reviews', { state: { orderId } });
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setActiveOrder(activeOrder === orderId ? null : orderId);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Booked': return 'text-amber-500';
      case 'Picked': return 'text-blue-500';
      case 'Working': return 'text-purple-500';
      case 'Delivered': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  
  const getProgressValue = (status: string) => {
    switch(status) {
      case 'Booked': return 10;
      case 'Picked': return 40;
      case 'Working': return 75;
      case 'Delivered': return 100;
      default: return 0;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderOrderCard = (order: Order, showRateButton: boolean = false) => (
    <Card key={order.id} className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue" />
              {order.service} Service
            </CardTitle>
            <CardDescription>
              Order #{order.id} • {formatDate(order.createdAt)}
            </CardDescription>
          </div>
          <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">Order Progress</div>
          <Progress value={getProgressValue(order.status)} className="h-2" />
          
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Booked</span>
            <span>Picked</span>
            <span>Working</span>
            <span>Delivered</span>
          </div>
        </div>
        
        {activeOrder === order.id && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Estimated Delivery</div>
                  <div className="text-gray-500">
                    {order.status === 'Delivered' 
                      ? `Delivered on ${formatDate(order.deliveredAt || new Date())}` 
                      : '1-2 days'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
                <div>
                  <div className="font-medium">Delivery Person</div>
                  <div className="text-gray-500">
                    {order.deliveryPerson.name} (ID: {order.deliveryPerson.id})
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t pt-3">
              <div className="font-medium mb-1">Items</div>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {order.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div className="border-t pt-3 flex justify-between items-center">
              <div className="font-medium">Total:</div>
              <div className="text-lg font-bold">${order.total.toFixed(2)}</div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button
          variant="ghost" 
          size="sm" 
          onClick={() => toggleOrderDetails(order.id)}
        >
          {activeOrder === order.id ? 'Hide Details' : 'View Details'}
        </Button>
        
        {showRateButton && order.status === 'Delivered' && (
          <Button 
            size="sm" 
            onClick={() => handleRateDelivery(order.id)}
            className="bg-blue hover:bg-blue-dark"
          >
            <Star className="h-4 w-4 mr-2" />
            Rate Delivery
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {currentOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Current Orders</h2>
          {currentOrders.map(order => renderOrderCard(order))}
        </div>
      )}
      
      {pastOrders.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Past Orders</h2>
          {pastOrders.map(order => renderOrderCard(order, true))}
        </div>
      )}
      
      {orders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Orders Yet</h3>
            <p className="text-gray-500 text-center mb-4">
              You haven't placed any orders yet. Start by booking a service!
            </p>
            <Button onClick={() => navigate('/customer-dashboard/book')}>
              Book Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomerOrders;
