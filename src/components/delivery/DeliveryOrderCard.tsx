
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Package, CheckCircle, Image, ArrowRight, Plus } from 'lucide-react';
import { updateOrderStatus } from '@/services/orderService';
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
}

interface DeliveryOrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onUploadImage: (orderId: string) => void;
  onCreateBill: (order: Order) => void;
}

const DeliveryOrderCard = ({ order, onUpdateStatus, onUploadImage, onCreateBill }: DeliveryOrderCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Booked': return 'bg-amber-100 text-amber-700';
      case 'Picked': return 'bg-blue-100 text-blue-700';
      case 'Working': return 'bg-purple-100 text-purple-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const getNextStatus = (currentStatus: string) => {
    switch(currentStatus) {
      case 'Booked': return 'Picked';
      case 'Picked': return 'Working';
      case 'Working': return 'Delivered';
      default: return null;
    }
  };
  
  const handleStatusUpdate = async (newStatus: string) => {
    try {
      // Update status first
      await onUpdateStatus(order.id, newStatus);
      
      // If the status is being updated to "Working", it means the bill was created
      if (newStatus === 'Working') {
        toast({
          title: "Order Status Updated",
          description: "Order moved to processing after bill creation"
        });
      } else {
        toast({
          title: "Status Updated",
          description: `Order marked as ${newStatus}`
        });
      }
      
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
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
              Order #{order.id}
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
        </div>
        
        <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md mt-2 mb-1">
          <div className="text-sm">
            <span className="font-medium">Customer</span>
            <div className="text-gray-500">
              ID: {order.customerId} • {order.customerName}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Less' : 'More'}
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-3 animate-fade-in">
            <div>
              <h4 className="text-sm font-medium mb-1">Items</h4>
              <ul className="list-disc list-inside text-sm text-gray-600 pl-2">
                {order.items.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-1">Delivery Date</h4>
              <div className="text-sm text-gray-600">
                Expected: {formatDate(order.estimatedDelivery)}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between bg-gray-50 border-t">
        {nextStatus ? (
          <Button 
            size="sm" 
            onClick={() => handleStatusUpdate(nextStatus)}
            className="flex-1 mr-2"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as {nextStatus}
          </Button>
        ) : (
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
        
        {(order.status === 'Delivered' || order.status === 'Working') && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onUploadImage(order.id)}
            className="flex-1"
          >
            <Image className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
        )}

        {order.status === 'Picked' && (
          <Button 
            size="sm" 
            onClick={() => onCreateBill(order)}
            className="flex-1 ml-2 bg-blue-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Bill
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DeliveryOrderCard;
