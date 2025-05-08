
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { 
  getAllPendingOrders, 
  getDeliveryPersonOrders, 
  assignDeliveryPerson, 
  updateOrderStatus, 
  rejectOrder,
  Order 
} from '@/services/orderService';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import PendingOrdersTab from './PendingOrdersTab';
import AssignedOrdersTab from './AssignedOrdersTab';
import RejectOrderDialog from './RejectOrderDialog';

const DeliveryOrders = () => {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useFirebaseAuth();

  useEffect(() => {
    fetchActiveOrders();
    fetchAssignedOrders();
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

  const fetchAssignedOrders = async () => {
    if (!user) return;
    try {
      const orders = await getDeliveryPersonOrders(user.id);
      setAssignedOrders(orders);
    } catch (error) {
      console.error("Failed to fetch assigned orders:", error);
      toast({
        title: "Error",
        description: "Failed to load assigned orders",
        variant: "destructive",
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to accept an order.",
          variant: "destructive",
        });
        return;
      }
  
      // Assign the delivery person and update the order status
      await assignDeliveryPerson(orderId, user.id); // Assign the current user as the delivery person
      await updateOrderStatus(orderId, 'picked'); // Update the order status to 'picked'
  
      toast({
        title: "Order Accepted",
        description: "The order has been assigned to you. You can now pick up and add items to the order.",
      });
  
      // Remove the order from the active list and refresh assigned orders
      setActiveOrders((prev) => prev.filter((order) => order.id !== orderId));
      fetchAssignedOrders();
    } catch (error) {
      console.error("Failed to accept order:", error);
      toast({
        title: "Error",
        description: "Failed to accept the order. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const openRejectDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectOrder = async () => {
    if (!selectedOrderId || !rejectReason.trim()) return;
    
    try {
      await rejectOrder(selectedOrderId, rejectReason);
      
      // Update local state
      setActiveOrders(prev => prev.filter(order => order.id !== selectedOrderId));
      
      toast({
        title: "Order Rejected",
        description: "The customer has been notified with your explanation"
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending Orders</TabsTrigger>
          <TabsTrigger value="assigned">My Assigned Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <PendingOrdersTab 
            orders={activeOrders} 
            onAcceptOrder={handleAcceptOrder}
            onRejectOrder={openRejectDialog}
          />
        </TabsContent>
        
        <TabsContent value="assigned">
          <AssignedOrdersTab orders={assignedOrders} />
        </TabsContent>
      </Tabs>

      <RejectOrderDialog 
        isOpen={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        onConfirm={handleRejectOrder}
      />
    </div>
  );
};

export default DeliveryOrders;
