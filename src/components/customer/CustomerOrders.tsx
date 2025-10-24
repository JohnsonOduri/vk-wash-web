import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Clock, Package, User, Receipt, CreditCard, Trash, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBillsByCustomerId, getBillsByOrderId } from '@/services/laundryItemService';
import { Bill } from '@/models/LaundryItem';
import { toast } from '@/hooks/use-toast';
import { getOrdersByUser, Order, deleteOrder } from '@/services/orderService';
import AddReviewDialog from './AddReviewDialog';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (customerId) {
        setIsLoading(true);
        try {
          const fetchedOrders = await getOrdersByUser(customerId);
          setOrders(fetchedOrders);

          // Fetch bills by customerId
          const billsByCustomer = await getBillsByCustomerId(customerId);

          // Fetch bills by orderId for all orders
          const billsByOrder: Bill[] = [];
          for (const order of fetchedOrders) {
            if (order.id) {
              try {
                const bill = await getBillsByOrderId(order.id);
                if (bill) billsByOrder.push(bill);
              } catch {}
            }
          }

          // Merge and deduplicate bills by id
          const allBills = [...billsByCustomer, ...billsByOrder].filter(
            (bill, idx, arr) => arr.findIndex(b => b.id === bill.id) === idx
          );
          setCustomerBills(allBills);
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
  
  // Separate current from previous orders
  const currentOrders = sortedOrders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const previousOrders = sortedOrders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

  const handleRateDelivery = (orderId: string) => {
    setReviewOrderId(orderId);
    setReviewDialogOpen(true);
  };
  
  const toggleOrderDetails = (orderId: string) => {
    setActiveOrder(activeOrder === orderId ? null : orderId);
  };
  
  const handleViewBill = async (billId: string) => {
    // Find bill in customer bills
    const bill = customerBills.find(bill => bill.id === billId);
    if (bill) {
      setViewingBill(bill); // Only show the bill dialog, do not change tab
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

  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await deleteOrder(orderToDelete);
      
      // Update local state
      setOrders(orders.filter(order => order.id !== orderToDelete));
      
      toast({
        title: "Order Deleted",
        description: "Your order has been successfully cancelled."
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete order:", error);
      toast({
        title: "Error",
        description: "Failed to cancel your order. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'text-amber-500';
      case 'picked': return 'text-blue-500';
      case 'processing': return 'text-purple-500';
      case 'ready': return 'text-green-500';
      case 'delivering': return 'text-indigo-500';
      case 'delivered': return 'text-green-500';
      case 'cancelled': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };
  
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return 'Booked';
      case 'picked': return 'Picked Up';
      case 'processing': return 'Processing';
      case 'ready': return 'Ready'; // Display 'Ready'
      case 'delivering': return 'Delivering';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 10;
      case 'picked': return 40;
      case 'processing': return 70;
      case 'ready': return 90; // Progress for 'Ready'
      case 'delivering': return 95;
      case 'delivered': return 100;
      case 'cancelled': return 0;
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
    const canCancel = order.status === 'pending';
    
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
              <span>Ready</span>
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

          {order.status === 'cancelled' && order.cancelReason && (
            <div className="mt-3 p-2 bg-red-50 rounded-md border border-red-100 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-red-700 block">Order Cancelled</span>
                <span className="text-sm text-red-600">{order.cancelReason}</span>
              </div>
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
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium">Pickup Address</div>
                  <div className="text-gray-500">
                    {order.pickupAddress}
                  </div>
                </div>
                {['picked', 'processing', 'ready', 'delivering', 'delivered'].includes(order.status) &&
                  order.deliveryPersonName && order.deliveryPersonPhone && (
                  <div>
                    <div className="font-medium text-gray-700">Delivery Boy Details</div>
                    <div className="text-sm text-gray-700">
                      Name: <span className="font-semibold">{order.deliveryPersonName}</span>
                    </div>
                    <div className="text-sm text-gray-700">
                      Phone: <span className="font-semibold">{order.deliveryPersonPhone}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="font-medium">Customer Name</div>
                  <div className="text-gray-500">
                    {order.customerName}
                  </div>
                </div>
                <div>
                  <div className="font-medium">Customer Phone</div>
                  <div className="text-gray-500">
                    {order.customerPhone}
                  </div>
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
              
              {order.items && order.items.length > 0 && (
                <div className="border-t pt-3">
                  <div className="font-medium mb-1">Items</div>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {order.items.map((item, idx) => (
                      <li key={idx}>
                        {item.name}
                        {'category' in item && (item as any).category ? (
                          <span className="ml-2 text-xs text-gray-500 font-normal">
                            [{(item as any).category}]
                          </span>
                        ) : null}
                        {" "}x {item.quantity} (
                          ₹
                          {typeof item.price === 'number'
                            ? item.price.toFixed(2)
                            : "0.00"
                          }
                        )
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {orderBill && (
                <div className="border-t pt-3 flex justify-between items-center">
                  <div className="font-medium">Total:</div>
                  <div className="text-lg font-bold">₹{orderBill.total.toFixed(2)}</div>
                </div>
              )}
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
          
          <div className="flex gap-2">
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
            
            {canCancel && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => openDeleteDialog(order.id || '')}
              >
                <Trash className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  // Add a helper to render bill items like BillViewer
  const renderBillItems = (bill: Bill) => (
    <ul className="space-y-2">
      {bill.items.map((item, index) => (
        <li key={index} className="flex justify-between text-sm">
          <span>
            {item.name}
            {item.category ? (
              <span className="ml-2 text-xs text-gray-500 font-normal">
                [{item.category}]
              </span>
            ) : null}
            {" "}x {item.quantity}
          </span>
          <span>
            ₹
            {typeof item.price === 'number'
              ? item.price.toFixed(2)
              : "0.00"
            }
          </span>
        </li>
      ))}
    </ul>
  );

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
      {/* Order tabs for Current/Previous */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="current">Current Orders</TabsTrigger>
          <TabsTrigger value="previous">Previous Orders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="mt-6">
          {currentOrders.length > 0 ? (
            <div>
              {currentOrders.map(order => renderOrderCard(order))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Current Orders</h3>
                <p className="text-gray-500 text-center mb-4">
                  You don't have any active orders at the moment. Book a service to get started!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="previous" className="mt-6">
          {previousOrders.length > 0 ? (
            <div>
              {previousOrders.map(order => renderOrderCard(order, true))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Previous Orders</h3>
                <p className="text-gray-500 text-center mb-4">
                  You don't have any completed or cancelled orders yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bills" className="mt-6">
          {customerBills.length > 0 ? (
            <div>
              {customerBills.map((bill) => (
                <Card key={bill.id} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Receipt className="h-5 w-5 mr-2 text-blue-500" />
                      Bill #{bill.id?.slice(0, 8)}
                    </CardTitle>
                    <CardDescription>
                      {bill.createdAt
                        ? (
                            bill.createdAt instanceof Date
                              ? bill.createdAt
                              : typeof bill.createdAt === 'object' && typeof (bill.createdAt as any).toDate === 'function'
                                ? (bill.createdAt as any).toDate()
                                : new Date(bill.createdAt)
                          ).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'N/A'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2">
                      <div className="text-sm font-medium mb-2">Items</div>
                      <ul className="space-y-1">
                        {bill.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span>{item.name} x {item.quantity}</span>
                            <span>
                              ₹
                              {typeof item.price === 'number'
                                ? item.price.toFixed(2)
                                : "0.00"
                              }
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="border-t pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>
                          ₹
                          {typeof bill.subtotal === 'number'
                            ? bill.subtotal.toFixed(2)
                            : "0.00"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>
                          ₹
                          {typeof bill.tax === 'number'
                            ? bill.tax.toFixed(2)
                            : "0.00"
                          }
                        </span>
                      </div>
                      <div className="flex justify-between font-bold mt-2">
                        <span>Total</span>
                        <span>
                          ₹
                          {typeof bill.total === 'number'
                            ? bill.total.toFixed(2)
                            : "0.00"
                          }
                        </span>
                      </div>
                    </div>
                    <div className="pt-2">
                      <div className="text-sm text-gray-500">Status</div>
                      <div className={`font-medium ${bill.status === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                        {bill.status === 'paid' ? 'Paid' : 'Pending Payment'}
                      </div>
                    </div>
                    {bill.status === 'paid' && bill.paymentMethod && (
                      <div>
                        <div className="text-sm text-gray-500">Payment Method</div>
                        <div className="font-medium">{bill.paymentMethod}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Receipt className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-1">No Bills</h3>
                <p className="text-gray-500 text-center mb-4">
                  You don't have any bills yet.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Order Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Keep Order
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteOrder}
            >
              Yes, Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <div className="font-medium">{viewingBill.orderId}</div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Items</div>
                {renderBillItems(viewingBill)}
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>
                    ₹
                    {typeof viewingBill.subtotal === 'number'
                      ? viewingBill.subtotal.toFixed(2)
                      : "0.00"
                    }
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>
                    ₹
                    {typeof viewingBill.tax === 'number'
                      ? viewingBill.tax.toFixed(2)
                      : "0.00"
                    }
                  </span>
                </div>
                <div className="flex justify-between font-bold mt-2">
                  <span>Total</span>
                  <span>
                    ₹
                    {typeof viewingBill.total === 'number'
                      ? viewingBill.total.toFixed(2)
                      : "0.00"
                    }
                  </span>
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
            
            <Button onClick={() => processPayment("Paytm")} className="flex items-center justify-start">
              <svg viewBox="0 0 24 24" width="24" height="24" className="mr-2">
                <path d="M24 12c0 6.627-5.373 12-12 12s-12-5.373-12-12 5.373-12 12-12zm-15.51 5.89c-1.023 0-1.184-.621-1.175-1.198l.012-.624v-8.13l2.596.015-.024 8.51c0 .324.082.645.574.645.185 0 .368-.044.551-.132l.198 1.075c-.194.065-.777.104-.943.104-.722 0-1.13.132-1.607-.132-.198-.131-.315-.329-.315-.527.01-.132.01-.309.133-.375v-.231zm-1.946-8.521h-2.077v-1.444h6.72v1.444h-2.06v7.639h-2.583v-7.639zm15.751.162c-.952 0-1.739.33-2.374.893-.608.535-.953 1.299-.953 2.129v3.535c0 .84.362 1.586.97 2.121.635.562 1.422.892 2.357.892.936 0 1.723-.33 2.357-.892.608-.535.969-1.299.969-2.121v-3.535c0-.83-.361-1.586-.969-2.121-.634-.562-1.421-.901-2.357-.901zm.092 2.231c.432 0 .698.338.698.882v2.792c0 .544-.266.882-.698.882s-.697-.338-.697-.882v-2.792c0-.544.265-.882.697-.882z" />
              </svg>
              Pay Online
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

      <AddReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        orderId={reviewOrderId || ''}
        userId={customerId}
        userName={orders.find(o => o.id === reviewOrderId)?.customerName || ''}
      />
    </div>
  );
};

export default CustomerOrders;

// Example Error Boundary component
// Place this in a separate file (e.g., src/components/common/ErrorBoundary.tsx) and wrap your CustomerOrders component with it.

import React from 'react';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    // You can log error info here
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}

export { ErrorBoundary };

// Usage in your app (e.g., in CustomerDashboard or App.tsx):
// <ErrorBoundary>
//   <CustomerOrders customerId={customerId} />
// </ErrorBoundary>
