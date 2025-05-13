
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Package, CheckCircle, Truck, User, Receipt } from 'lucide-react';
import { updateOrderStatus, getBillsByOrderId } from '@/services/orderService';
import { toast } from '@/hooks/use-toast';

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  service: string;
  status: string;
  createdAt: Date;
  estimatedDelivery: Date;
  items: string[];
  billId?: string;
}

interface DeliveryOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onUploadImage?: (orderId: string) => void;
  onCreateBill: (order: Order) => void;
}

const DeliveryOrderCard = ({ order, onUpdateStatus, onUploadImage, onCreateBill }: DeliveryOrderCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [checkingBill, setCheckingBill] = useState(false);
  const navigate = useNavigate();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'picked': return 'bg-blue-100 text-blue-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-cyan-100 text-cyan-700';
      case 'delivering': return 'bg-indigo-100 text-indigo-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus.toLowerCase()) {
      case 'picked': return 'processing';
      case 'processing': return 'ready';
      case 'ready': return 'delivering';
      case 'delivering': return 'delivered';
      default: return null;
    }
  };
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await onUpdateStatus(order.id, newStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleCheckBill = async () => {
    setCheckingBill(true);
    try {
      const bill = await getBillsByOrderId(order.id);
      if (bill) {
        // Bill exists, navigate to bill tab
        navigate('/delivery-dashboard', { state: { activeTab: 'bill', orderId: order.id } });
      } else {
        // No bill, create one
        onCreateBill(order);
      }
    } catch (error) {
      console.error("Error checking bill:", error);
      toast({
        title: "Error", 
        description: "Failed to check bill information",
        variant: "destructive"
      });
    } finally {
      setCheckingBill(false);
    }
  };
  
  const nextStatus = getNextStatus(order.status);
  
  return (
    <Card className={`overflow-hidden transition-all duration-300 ${expanded ? 'shadow-md' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue" />
              Order #{order.id.substring(0, 8)}
            </CardTitle>
            <CardDescription>
              {formatDate(order.createdAt)} • {order.service}
            </CardDescription>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="my-3 space-y-2">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
            <div className="text-sm">{order.address}</div>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <div className="text-sm">{order.customerPhone}</div>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <div className="text-sm">{order.customerName}</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t">
        {order.status.toLowerCase() === 'picked' && (
          <Button 
            size="sm" 
            onClick={() => handleCheckBill()} 
            className="flex-1 mr-2"
            disabled={checkingBill}
          >
            <Receipt className="h-4 w-4 mr-2" />
            {checkingBill ? 'Checking...' : 'Create Bill'}
          </Button>
        )}

        {order.status.toLowerCase() === 'processing' && (
          <Button 
            size="sm" 
            onClick={() => handleStatusUpdate('ready')}
            className="flex-1 mr-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Ready
          </Button>
        )}
        
        {order.status.toLowerCase() === 'ready' && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleStatusUpdate('delivering')}
            className="flex-1 ml-2"
          >
            <Truck className="h-4 w-4 mr-2" />
            Start Delivery
          </Button>
        )}
        
        {order.status.toLowerCase() === 'delivering' && (
          <Button 
            size="sm" 
            onClick={() => handleStatusUpdate('delivered')}
            className="flex-1 ml-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Delivered
          </Button>
        )}
        
        {nextStatus && !['picked', 'processing', 'ready', 'delivering'].includes(order.status.toLowerCase()) && (
          <Button 
            size="sm" 
            onClick={() => handleStatusUpdate(nextStatus)}
            className="flex-1 mr-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
          </Button>
        )}
        
        {!nextStatus && (
          <Button 
            size="sm" 
            variant="outline" 
            disabled
            className="flex-1 mr-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Completed
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DeliveryOrderCard;
