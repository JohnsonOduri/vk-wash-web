
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Package } from 'lucide-react';
import { Order } from '@/services/orderService';

interface OrderCardProps {
  order: Order;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
}

const OrderCard = ({ order, onAccept, onReject }: OrderCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card key={order.id} className="hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id?.substring(0, 8)}</CardTitle>
            <CardDescription>
              {order.serviceType} Service
            </CardDescription>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-amber-100 text-amber-800">
            {order.status}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Pickup Details</h4>
          <p className="text-sm">{order.pickupAddress}</p>
          <p className="text-sm">{formatDate(order.pickupDate)}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-500">Order Type</h4>
          <p className="text-sm">{order.serviceType} Service</p>
          <p className="text-sm text-gray-500 italic">Items to be added after pickup</p>
        </div>
        
        {order.specialInstructions && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Instructions</h4>
            <p className="text-sm italic">{order.specialInstructions}</p>
          </div>
        )}

        <div className="border-t pt-2">
          <p className="text-sm text-blue-600">
            After accepting, you'll be able to add items and generate a bill.
          </p>
        </div>
      </CardContent>
      
      <CardFooter className="grid grid-cols-2 gap-2">
        <Button 
          variant="default" 
          onClick={() => onAccept(order.id || '')}
          className="w-full"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          Accept
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => onReject(order.id || '')}
          className="w-full text-red-600 border-red-200 hover:bg-red-50"
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderCard;
