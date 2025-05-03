
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getBillsByCustomerId, updateBillPayment } from '@/services/laundryItemService';
import { Bill } from '@/models/LaundryItem';

const PaymentOptions = [
  {
    id: 'cash',
    name: 'Cash',
    description: 'Pay in cash on delivery',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    description: 'Pay via Google Pay',
  },
  {
    id: 'phone_pay',
    name: 'PhonePe',
    description: 'Pay via PhonePe',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    description: 'Pay via Paytm',
  },
  {
    id: 'internet_banking',
    name: 'Internet Banking',
    description: 'Pay via your bank account',
  },
];

const BillViewer = ({ customerId }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cash');

  useEffect(() => {
    if (customerId) {
      loadBills();
    }
  }, [customerId]);

  const loadBills = async () => {
    setIsLoading(true);
    try {
      const fetchedBills = await getBillsByCustomerId(customerId);
      setBills(fetchedBills);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentClick = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPaymentDialogOpen(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedBill) return;
    
    try {
      await updateBillPayment(selectedBill.id, selectedPaymentMethod as Bill['paymentMethod']);
      toast({
        title: 'Payment Successful',
        description: `Payment of ₹${selectedBill.total.toFixed(2)} completed via ${getPaymentMethodName(selectedPaymentMethod)}`
      });
      setIsPaymentDialogOpen(false);
      loadBills(); // Refresh bills to show updated status
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
      
      {bills.length > 0 ? (
        <div className="space-y-4">
          {bills.map(bill => (
            <Card key={bill.id} className={`hover:shadow-md transition-shadow ${
              bill.status === 'paid' ? 'border-green-500' : ''
            }`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{bill.id.substring(0, 8)}</CardTitle>
                    <p className="text-sm text-gray-500">{formatDate(bill.date)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bill.status === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {bill.status === 'paid' ? 'Paid' : 'Pending'}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="divide-y">
                <div className="pb-4">
                  <h4 className="text-sm font-medium mb-2">Items</h4>
                  <div className="space-y-1">
                    {bill.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₹{item.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="py-3 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{bill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{bill.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{bill.total.toFixed(2)}</span>
                  </div>
                </div>
                
                {bill.paymentMethod && (
                  <div className="pt-3 text-sm text-gray-600">
                    <p>Paid via {getPaymentMethodName(bill.paymentMethod)}</p>
                    {bill.paymentDate && <p>Date: {formatDate(bill.paymentDate)}</p>}
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-2 pb-4">
                {bill.status === 'pending' ? (
                  <Button className="w-full" onClick={() => handlePaymentClick(bill)}>Pay Now</Button>
                ) : (
                  <Button className="w-full" variant="outline" disabled>Paid</Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>You don't have any bills yet</p>
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
                <div className="text-lg font-bold">₹{selectedBill.total.toFixed(2)}</div>
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
    </div>
  );
};

export default BillViewer;
