
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Package, User, Receipt, CreditCard } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { getBillsByCustomerId } from '@/services/laundryItemService';
import { Bill } from '@/models/LaundryItem';
import { toast } from '@/hooks/use-toast';
import { getOrdersByUser, Order } from '@/services/orderService';

interface CustomerOrdersProps {
  customerId: string;
}

const CustomerOrders = ({ customerId }: CustomerOrdersProps) => {
  const navigate = useNavigate();
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [customerBills, setCustomerBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (customerId) {
        setIsLoading(true);
        try {
          const fetchedOrders = await getOrdersByUser(customerId);
          setOrders(fetchedOrders);
          
          const bills = await getBillsByCustomerId(customerId);
          setCustomerBills(bills);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Could not load your orders. Please try again later.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [customerId]);

  // Sort orders by date (newest first)
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : a.createdAt.toDate();
    const dateB = b.createdAt instanceof Date ? b.createdAt : b.createdAt.toDate();
    return dateB.getTime() - dateA.getTime();
  });
  
  const currentOrders = sortedOrders.filter(order => order.status !== 'delivered');
  const pastOrders = sortedOrders.filter(order => order.status === 'delivered');

  const handleRateDelivery = (orderId: string) => {
    navigate('/reviews', { state: { orderId } });
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setActiveOrder(activeOrder === orderId ? null : orderId);
  };
  
  const handleViewBill = async (billId: string) => {
    // Find bill in customer bills
    const bill = customerBills.find(bill => bill.id === billId);
    if (bill) {
      setViewingBill(bill);
    } else {
      toast({
        title: "Bill Not Found",
        description: "Unable to find the bill details",
        variant: "destructive"
      });
    }
  };

  const handlePayBill = () => {
    setPaymentDialogOpen(true);
  };

  const processPayment = (method: string) => {
    // In a real app, this would process the payment
    toast({
      title: "Payment Successful",
      description: `Payment completed via ${method}`,
    });
    
    setPaymentDialogOpen(false);
    setViewingBill(null);
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-amber-500';
      case 'picked': return 'text-blue-500';
      case 'processing': return 'text-purple-500';
      case 'delivered': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return 'Booked';
      case 'picked': return 'Picked Up';
      case 'processing': return 'Processing';
      case 'delivered': return 'Delivered';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const getProgressValue = (status: string) => {
    switch(status) {
      case 'pending': return 10;
      case 'picked': return 40;
      case 'processing': return 75;
      case 'delivered': return 100;
      default: return 0;
    }
  };
  
  const formatDate = (date: Date | any) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderOrderCard = (order: Order, showRateButton: boolean = false) => {
    // Find bill matching this order (if any)
    const orderBill = customerBills.find(bill => bill.orderId === order.id);
    const hasBill = !!orderBill;
    
    return (
      <Card key={order.id} className="mb-4 overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue" />
                {order.serviceType.charAt(0).toUpperCase() + order.serviceType.slice(1)} Service
              </CardTitle>
              <CardDescription>
                Order #{order.id?.slice(0, 8)} • {formatDate(order.createdAt)}
              </CardDescription>
            </div>
            <div className={`text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusDisplay(order.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pb-2">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Order Progress</div>
            <Progress value={getProgressValue(order.status)} className="h-2" />
            
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Booked</span>
              <span>Picked Up</span>
              <span>Processing</span>
              <span>Delivered</span>
            </div>
          </div>
          
          {hasBill && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md border border-blue-100 flex justify-between items-center">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 mr-2 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Bill Ready</span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-blue-600 border-blue-200"
                onClick={() => orderBill && handleViewBill(orderBill.id)}
              >
                View Bill
              </Button>
            </div>
          )}
          
          {activeOrder === order.id && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium">Service Type</div>
                  <div className="text-gray-500">
                    {order.serviceType.charAt(0).toUpperCase() + order.serviceType.slice(1)}
                  </div>
                </div>
                
                <div>
                  <div className="font-medium">Pickup Date</div>
                  <div className="text-gray-500">
                    {order.pickupDate}
                  </div>
                </div>
              </div>
              
              <div>
                <div className="font-medium">Pickup Address</div>
                <div className="text-gray-500">
                  {order.pickupAddress}
                </div>
              </div>
              
              {order.specialInstructions && (
                <div>
                  <div className="font-medium">Special Instructions</div>
                  <div className="text-gray-500">
                    {order.specialInstructions}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-3">
                <div className="font-medium mb-1">Items</div>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {order.items.map((item, idx) => (
                    <li key={idx}>{item.name} x {item.quantity} (₹{item.price.toFixed(2)})</li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <div className="font-medium">Total:</div>
                <div className="text-lg font-bold">₹{order.total.toFixed(2)}</div>
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button
            variant="ghost" 
            size="sm" 
            onClick={() => toggleOrderDetails(order.id || '')}
          >
            {activeOrder === order.id ? 'Hide Details' : 'View Details'}
          </Button>
          
          {showRateButton && order.status === 'delivered' && (
            <Button 
              size="sm" 
              onClick={() => handleRateDelivery(order.id || '')}
              className="bg-blue hover:bg-blue-dark"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate Service
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

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
            
          </CardContent>
        </Card>
      )}

      {/* Bill Viewer Dialog */}
      {viewingBill && (
        <Dialog open={!!viewingBill} onOpenChange={() => setViewingBill(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bill Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <div className="text-sm text-gray-500">Bill ID</div>
                <div className="font-medium">{viewingBill.id}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-2">Items</div>
                <ul className="space-y-2">
                  {viewingBill.items.map((item, index) => (
                    <li key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.price.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{viewingBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{viewingBill.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>₹{viewingBill.total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="text-sm text-gray-500">Status</div>
                <div className={`font-medium ${viewingBill.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                  {viewingBill.status === 'paid' ? 'Paid' : 'Pending Payment'}
                </div>
              </div>
              
              {viewingBill.status === 'paid' && viewingBill.paymentMethod && (
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium">{viewingBill.paymentMethod}</div>
                </div>
              )}
            </div>
            <DialogFooter>
              {viewingBill.status !== 'paid' && (
                <Button onClick={handlePayBill} className="w-full">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Payment Method Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button onClick={() => processPayment("Google Pay")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M12 24h-12v-24h12v24zm4-10.2c.33.54.8.96 1.4 1.26.6.3 1.27.44 2.03.44.5 0 .96-.06 1.38-.17.41-.12.77-.3 1.05-.52.29-.23.5-.52.65-.85.15-.34.22-.74.22-1.2 0-.49-.12-.88-.36-1.17-.24-.29-.51-.52-.83-.7-.32-.17-.67-.31-1.04-.42-.37-.1-.7-.19-1-.27-.3-.08-.54-.17-.7-.28-.17-.12-.25-.29-.25-.5 0-.15.05-.28.14-.38.09-.11.2-.2.34-.26.14-.06.29-.11.45-.14.16-.02.31-.04.45-.04.42 0 .77.09 1.05.27.28.18.47.45.55.82h1.95c-.12-.74-.46-1.34-1.03-1.82-.57-.48-1.39-.72-2.47-.72-.39 0-.76.04-1.11.12-.35.08-.67.2-.93.38-.26.17-.47.4-.63.68-.16.28-.24.61-.24.99 0 .46.11.83.33 1.12.21.29.48.52.8.7.32.17.67.32 1.06.43.39.11.74.21 1.06.3.32.08.58.18.78.29.2.11.3.28.3.49 0 .15-.06.28-.18.39s-.27.2-.45.26c-.18.06-.36.09-.55.09-.19 0-.37.01-.54.01-.22 0-.43-.02-.65-.07-.21-.05-.4-.13-.56-.24-.16-.12-.3-.26-.41-.44-.11-.18-.17-.4-.18-.67h-1.89c.02.46.12.87.29 1.22zm-12-8.8v4h3.95v5h3.95v-5h1.9v-4h-1.9v-1.9c0-.53.082-1.08.41-1.5.33-.42.835-.6 1.49-.6v-4c-1.04 0-2.01.16-2.9.46-.89.3-1.66.74-2.31 1.33-.65.58-1.16 1.3-1.53 2.14-.37.85-.56 1.83-.56 2.93v1.14h-2.5z" />
              </svg>
              Google Pay
            </Button>
            <Button onClick={() => processPayment("Internet Banking")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M24 8.98v10.02c0 1.1-.9 2-2 2h-18c-1.1 0-2-.9-2-2v-10.02l11 6.015 11-6.015zm-11-4.193l-10 5.438v-2.245l10-5.438 10 5.438v2.245l-10-5.438z" />
              </svg>
              Internet Banking
            </Button>
            <Button onClick={() => processPayment("Phone Pay")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3.445 17.827c-3.684 1.684-9.401-9.43-5.8-11.308l1.053-.519 1.746 3.409-1.042.513c-1.095.587 1.185 5.04 2.305 4.497l1.032-.505 1.76 3.397-1.054.516z" />
              </svg>
              Phone Pay
            </Button>
            <Button onClick={() => processPayment("Paytm")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M24 12c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12 12 5.373 12 12zm-15.51 5.89c-1.023 0-1.184-.621-1.175-1.198l.012-.624v-8.13l2.596.015-.024 8.51c0 .324.082.645.574.645.185 0 .368-.044.551-.132l.198 1.075c-.194.065-.777.104-.943.104-.722 0-1.13.132-1.607-.132-.198-.131-.315-.329-.315-.527.01-.132.01-.309.133-.375v-.231zm-1.946-8.521h-2.077v-1.444h6.72v1.444h-2.06v7.639h-2.583v-7.639zm15.751.162c-.952 0-1.739.33-2.374.893-.608.535-.953 1.299-.953 2.129v3.535c0 .84.362 1.586.97 2.121.635.562 1.422.892 2.357.892.936 0 1.723-.33 2.357-.892.608-.535.969-1.299.969-2.121v-3.535c0-.83-.361-1.586-.969-2.121-.634-.562-1.421-.901-2.357-.901zm.092 2.231c.432 0 .698.338.698.882v2.792c0 .544-.266.882-.698.882s-.697-.338-.697-.882v-2.792c0-.544.265-.882.697-.882z" />
              </svg>
              Paytm
            </Button>
            <Button onClick={() => processPayment("Cash")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4 14.083c0-2.145-2.232-2.742-3.943-3.546-1.039-.54-.908-1.829.581-1.916.826-.05 1.675.195 2.443.465l.362-1.647c-.907-.276-1.719-.402-2.443-.421v-1.018h-1v1.067c-1.945.267-2.984 1.487-2.984 2.85 0 2.438 2.847 2.81 3.778 3.243 1.27.568 1.035 1.75-.114 2.011-.997.226-2.269-.168-3.225-.54l-.455 1.644c.894.462 1.965.708 3 .727v.998h1v-1.053c1.657-.232 3.002-1.146 3-2.864z" />
              </svg>
              Cash
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerOrders;
