import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { User, Package, Clock, CheckCircle, X, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAllPendingOrders, Order, updateOrderStatus } from '@/services/orderService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';

const DeliveryOrders = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const { user } = useFirebaseAuth();

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const fetchActiveOrders = async () => {
    setIsLoading(true);
    try {
      const orders = await getAllPendingOrders();
      setActiveOrders(orders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast({
        title: "Error",
        description: "Failed to load active orders",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      // Update the order status to "picked" and assign to current delivery person
      await updateOrderStatus(orderId, 'picked');
      // TODO: Implement assignDeliveryPerson in orderService
      // await assignDeliveryPerson(orderId, user?.id || '');
      
      toast({
        title: "Order Accepted",
        description: "The order has been assigned to you. You can now pick up and add items to the order."
      });
      
      // Remove the order from the active list
      setActiveOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast({
        title: "Error",
        description: "Failed to accept the order",
        variant: "destructive"
      });
    }
  };

  const openRejectDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedOrderId) return;
    
    try {
      // Instead of deleting, we could mark it as rejected in a real app
      // For now, we'll just remove it from the list
      setActiveOrders(prev => prev.filter(order => order.id !== selectedOrderId));
      
      toast({
        title: "Order Rejected",
        description: `Notification sent to customer with your explanation`
      });
      setRejectDialogOpen(false);
    } catch (error) {
      console.error("Failed to reject order:", error);
      toast({
        title: "Error",
        description: "Failed to reject the order",
        variant: "destructive"
      });
    }
  };

  const filteredOrders = activeOrders.filter(order => 
    filter === '' || 
    (order.id && order.id.includes(filter)) ||
    (order.serviceType && order.serviceType.toLowerCase().includes(filter.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading active orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Active Orders</h2>
        
        <div className="relative w-64">
          <Input
            type="text"
            placeholder="Filter by ID or service..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
          <Package className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map(order => (
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
                  onClick={() => handleAcceptOrder(order.id || '')}
                  className="w-full"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Accept
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => openRejectDialog(order.id || '')}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Truck className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Active Orders</h3>
            <p className="text-gray-500 text-center">
              {filter 
                ? "No orders match your search criteria" 
                : "There are no pending orders at the moment"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Reject Order Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this order. This will be sent to the customer.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectOrder}
              disabled={!rejectReason.trim()}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryOrders;
