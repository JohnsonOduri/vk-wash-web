import { useState, useEffect } from 'react';
// Update the import path below to the correct relative path if needed
import { toast } from '../../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../ui/dialog';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { getBillsByCustomerId, updateBillPayment, getBillsByOrderId } from '../../services/laundryItemService';
import { getOrdersByUser } from '../../services/orderService';
import { Bill } from '../../models/LaundryItem';

const PaymentOptions = [
  {
    id: 'cash',
    name: 'Cash',
    description: 'Pay in cash on delivery',
  },
  {
    id: 'upi',
    name: 'UPI',
    description: 'Pay via UPI (Google Pay, PhonePe, etc.)',
  },
  
];

const BillViewer = ({ customerId }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');
  const [pendingCashPayment, setPendingCashPayment] = useState<{ billId: string, method: string } | null>(null);

  useEffect(() => {
    if (customerId) {
      loadBillsAndOrders();
    }
  }, [customerId]);

  const loadBillsAndOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch all orders for this customer
      const fetchedOrders = await getOrdersByUser(customerId);

      // Fetch all bills for this customer by userId
      const fetchedBills = await getBillsByCustomerId(customerId);

      // Also fetch bills by orderId for all orders (to catch any missed bills)
      const billsByOrder: Bill[] = [];
      const itemsMap: Record<string, any[]> = {};
      for (const order of fetchedOrders) {
        if (order.id) {
          try {
            const bill = await getBillsByOrderId(order.id) as Bill | null;
            if (bill) billsByOrder.push(bill);
          } catch {}
          // Map orderId to items for quick lookup (prefer bill items if available, else order items)
          let billForOrder: Bill | null = null;
          try {
            billForOrder = await getBillsByOrderId(order.id) as Bill | null;
          } catch {}
          if (billForOrder && billForOrder.items && billForOrder.items.length > 0) {
            itemsMap[order.id] = billForOrder.items;
          } else {
            itemsMap[order.id] = order.items || [];
          }
        }
      }

      // Also fetch bills by customer phone number (custom-generated bills)
      let billsByPhone: Bill[] = [];
      if (fetchedOrders.length > 0) {
        // Try to get the phone numbers from orders
        const phoneNumbers = [
          ...new Set(
            fetchedOrders
              .map(order => order.customerPhone)
              .filter(Boolean)
          ),
        ];
        for (const phone of phoneNumbers) {
          if (phone && phone !== customerId) {
            try {
              const phoneBills = await getBillsByCustomerId(phone);
              if (phoneBills && phoneBills.length > 0) {
                billsByPhone = billsByPhone.concat(phoneBills);
              }
            } catch {}
          }
        }
      }

      // Merge and deduplicate bills by id
      let allBills = [...fetchedBills, ...billsByOrder, ...billsByPhone].filter(
        (bill, idx, arr) => arr.findIndex(b => b.id === bill.id) === idx
      );

      // Only display bills made in last 30 days, but always include pending bills (even if older)
      const now = new Date();
      const since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      allBills = allBills.filter(bill => {
        const billDate = bill.createdAt || bill.date || new Date();
        return bill.status === 'pending' || billDate >= since;
      });

      // Sort: pending bills first (latest to oldest), then rest by pickup date (oldest to newest)
      const pendingBills = allBills
        .filter(bill => bill.status === 'pending')
        .sort((a, b) => {
          const dateA = (a.createdAt || a.date || new Date());
          const dateB = (b.createdAt || b.date || new Date());
          return dateB.getTime() - dateA.getTime();
        });

      // For non-pending bills, sort by pickup date (oldest to newest)
      // Find pickup date from order if possible, else use bill date
      const orderMap: Record<string, any> = {};
      fetchedOrders.forEach(order => {
        if (order.id) orderMap[order.id] = order;
      });

      const nonPendingBills = allBills
        .filter(bill => bill.status !== 'pending')
        .sort((a, b) => {
          const orderA = orderMap[a.orderId];
          const orderB = orderMap[b.orderId];
          const dateA = orderA?.pickupDate ? new Date(orderA.pickupDate) : (a.createdAt || a.date || new Date());
          const dateB = orderB?.pickupDate ? new Date(orderB.pickupDate) : (b.createdAt || b.date || new Date());
          return dateA.getTime() - dateB.getTime();
        });

      allBills = [...pendingBills, ...nonPendingBills];

      setBills(allBills);
      setOrders(fetchedOrders);
      setOrderItemsMap(itemsMap);
    } catch (error) {
      console.error('Error loading bills and orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills and orders',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
    setSelectedPaymentMethod('cash');
  };

  const handleProcessPayment = async () => {
    if (!selectedBill) return;

    if (selectedPaymentMethod === 'cash') {
      setPendingCashPayment({ billId: selectedBill.id ?? '', method: selectedPaymentMethod });
      setIsPaymentDialogOpen(false);
      toast({
        title: 'Cash Payment Initiated',
        description: `Please complete the payment with the delivery staff. Your payment will be marked as paid after verification.`,
      });
      return;
    }

    if (selectedPaymentMethod === 'upi') {
      try {
        const res = await fetch('https://vkwash.in/api/phonepe/payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            billId: selectedBill.id,
            amount: Math.round(selectedBill.total * 100), // in paise
            customerId,
            orderId: selectedBill.orderId,
            customerPhone: selectedBill.customerPhone,
            name: selectedBill.customerName || "VK Wash Customer"
          }),
        });
        if (!res.ok) throw new Error('Failed to initiate payment');
        const { paymentUrl } = await res.json();
        setIsPaymentDialogOpen(false);
        window.location.href = paymentUrl; // Redirect to PhonePe
      } catch (error) {
        toast({
          title: 'Payment Error',
          description: 'Could not initiate UPI payment. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }

    try {
      await updateBillPayment(selectedBill.id ?? '', selectedPaymentMethod as Bill['paymentMethod']);
      toast({
        title: 'Payment Successful',
        description: `Payment of ₹${selectedBill.total.toFixed(2)} completed via ${getPaymentMethodName(selectedPaymentMethod)}`
      });
      setIsPaymentDialogOpen(false);
      loadBillsAndOrders();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: 'There was an error processing your payment',
        variant: 'destructive'
      });
    }
  };

  const getPaymentMethodName = (methodId: string) => {
    const method = PaymentOptions.find(option => option.id === methodId);
    return method ? method.name : methodId;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center my-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Bills</h2>
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            // Find bill for this order
            const bill = bills.find(b => b.orderId === order.id);
            // Get items for this order (prefer bill items if available, else order items)
            const orderItems = orderItemsMap[order.id] || [];
            return (
              <Card key={order.id} className={`hover:shadow-md transition-shadow ${bill && bill.status === 'paid' ? 'border-green-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id?.substring(0, 8)}</CardTitle>
                      <p className="text-sm text-gray-500">
                        {order.createdAt
                          ? (order.createdAt instanceof Date
                              ? order.createdAt
                              : typeof order.createdAt === 'object' && typeof order.createdAt.toDate === 'function'
                                ? order.createdAt.toDate()
                                : new Date(order.createdAt)
                            ).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'N/A'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bill
                        ? (bill.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800')
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {bill
                        ? (bill.status === 'paid' ? 'Paid' : 'Pending')
                        : 'No Bill'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="divide-y">
                  <div className="pb-4">
                    <h4 className="text-sm font-medium mb-2">Order Items</h4>
                    <div className="space-y-1">
                      {orderItems && orderItems.length > 0 ? (
                        orderItems.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>
                              {item.name}
                              {item.category ? (
                                <span className="ml-2 text-xs text-gray-500 font-normal">
                                  [{item.category}]
                                </span>
                              ) : null}
                              {" "}x{item.quantity}
                            </span>
                            <span>
                              ₹{typeof item.price === 'number'
                                ? item.price.toFixed(2)
                                : typeof item.total === 'number'
                                  ? item.total.toFixed(2)
                                  : "0.00"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-400">No items added yet</span>
                      )}
                    </div>
                  </div>
                  {bill && (
                    <div className="py-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>₹{typeof bill.subtotal === 'number' ? bill.subtotal.toFixed(2) : "₹0.00"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>₹{typeof bill.tax === 'number' ? bill.tax.toFixed(2) : "₹0.00"}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{typeof bill.total === 'number' ? bill.total.toFixed(2) : "₹0.00"}</span>
                      </div>
                    </div>
                  )}
                  <div className="pt-3 text-sm text-gray-600">
                    <p>Service: {order.serviceType}</p>
                    <p>Status: {order.status}</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  {bill && bill.status === 'pending' ? (
                    <Button className="w-full" onClick={() => handlePaymentClick(bill)}>Pay Now</Button>
                  ) : bill && bill.status === 'paid' ? (
                    <Button className="w-full" variant="outline" disabled>Paid</Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>No Bill</Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You don't have any orders yet</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {selectedBill && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Bill Total</div>
                <div className="text-lg font-bold">₹{typeof selectedBill.total === 'number' ? selectedBill.total.toFixed(2) : "₹0.00"}</div> {/* Safely format selectedBill.total */}
              </div>
            )}
            
            <RadioGroup value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod} className="gap-4">
              {PaymentOptions.map(option => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex flex-col cursor-pointer">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-sm text-gray-500">{option.description}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleProcessPayment}>Process Payment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Show info dialog if cash payment is pending verification */}
      <Dialog open={!!pendingCashPayment && pendingCashPayment.method === 'cash'} onOpenChange={() => setPendingCashPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cash Payment Pending Verification
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Your cash payment will be marked as paid after the delivery staff verifies the payment. Please complete the payment with the staff.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setPendingCashPayment(null)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BillViewer;
