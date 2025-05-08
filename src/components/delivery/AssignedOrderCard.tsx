
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
import { Order } from '@/services/orderService';

interface AssignedOrderCardProps {
  order: Order;
}

const AssignedOrderCard = ({ order }: AssignedOrderCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id?.substring(0, 8)}</CardTitle>
            <CardDescription>{order.serviceType} Service</CardDescription>
          </div>
          <div className="px-3 py-1 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-800">
            {order.status}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">Pickup Details</h4>
          <p className="text-sm">{order.pickupAddress}</p>
          <p className="text-sm">{order.pickupDate && formatDate(order.pickupDate)}</p>
        </div>
        {order.specialInstructions && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Instructions</h4>
            <p className="text-sm italic">{order.specialInstructions}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          onClick={() => navigate('/delivery-dashboard/bill', { state: { orderId: order.id } })}
          className="w-full"
        >
          Create Bill
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AssignedOrderCard;
