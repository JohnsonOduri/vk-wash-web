import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBillsByStatus, updateBillPayment } from '@/services/laundryItemService';
import { format } from 'date-fns';
import { CreditCard, Check, Phone, User, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export interface Payment {
  amount: number;
  method: 'cash' | 'upi' | string;
  date: Date;
}

export interface Bill {
  id: string;
  customerName: string;
  customerPhone: string;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid';
  paymentMethod?: string;
  paymentDate?: Date;
  createdAt?: Date;
  date?: Date;
  payments?: Payment[]; // Add this line to support payments array
}

const ManagePayments = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [viewingOrder, setViewingOrder] = useState<any | null>(null); // Replace 'any' with your Order type if available
  const [paymentInputDialog, setPaymentInputDialog] = useState<{ bill: Bill; method: 'cash' | 'upi' } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [showAllBills, setShowAllBills] = useState(false);
  const [allBillsLoading, setAllBillsLoading] = useState(false);
  const [allBillsError, setAllBillsError] = useState<string | null>(null);

  useEffect(() => {
    loadPendingBills();
    // Load all bills for the last month by default
    loadAllBills();
  }, []);
  
  const loadPendingBills = async () => {
    setIsLoading(true);
    try {
      const pendingBills = await getBillsByStatus('pending');
      
      // Sort by date (oldest first)
      pendingBills.sort((a, b) => {
        const dateA = a.createdAt || a.date || new Date();
        const dateB = b.createdAt || b.date || new Date();
        return dateA.getTime() - dateB.getTime();
      });
      
      setBills(
        pendingBills
          .filter((b: any) => !!b.id)
          .map((b: any) => ({
            id: b.id ?? '',
            customerName: b.customerName ?? '',
            customerPhone: b.customerPhone ?? '',
            items: b.items ?? [],
            subtotal: b.subtotal ?? 0,
            tax: b.tax ?? 0,
            total: b.total ?? 0,
            status: b.status ?? 'pending',
            paymentMethod: b.paymentMethod,
            paymentDate: b.paymentDate,
            createdAt: b.createdAt,
            date: b.date,
            payments: b.payments,
          }))
      );
      
      // Calculate metrics
      calculateMetrics(
        pendingBills
          .filter((b: any) => !!b.id)
          .map((b: any) => ({
            id: b.id ?? '',
            customerName: b.customerName ?? '',
            customerPhone: b.customerPhone ?? '',
            items: b.items ?? [],
            subtotal: b.subtotal ?? 0,
            tax: b.tax ?? 0,
            total: b.total ?? 0,
            status: b.status ?? 'pending',
            paymentMethod: b.paymentMethod,
            paymentDate: b.paymentDate,
            createdAt: b.createdAt,
            date: b.date,
            payments: b.payments,
          }))
      );
    } catch (error) {
      console.error('Error loading bills:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pending payments',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllBills = async (durationDays = 30) => {
    setAllBillsLoading(true);
    setAllBillsError(null);
    try {
      // Get all bills (paid and pending)
      const now = new Date();
      const since = new Date(now.getTime() - durationDays * 24 * 60 * 60 * 1000);
      // Assume getBillsByStatus('all') returns all bills, or fetch all bills from your service
      let all: Bill[] = [];
      try {
        // Fetch both paid and pending bills and merge them
        const paid = await getBillsByStatus('paid');
        const pending = await getBillsByStatus('pending');
        all = [...paid, ...pending]
          .filter((b: any) => !!b.id)
          .map((b: any) => ({
            id: b.id ?? '',
            customerName: b.customerName ?? '',
            customerPhone: b.customerPhone ?? '',
            items: b.items ?? [],
            subtotal: b.subtotal ?? 0,
            tax: b.tax ?? 0,
            total: b.total ?? 0,
            status: b.status ?? 'pending',
            paymentMethod: b.paymentMethod,
            paymentDate: b.paymentDate,
            createdAt: b.createdAt,
            date: b.date,
            payments: b.payments,
          }));
      } catch {
        all = [];
      }
      // Filter by date
      all = all.filter(bill => {
        const billDate = bill.createdAt || bill.date || new Date();
        return billDate >= since;
      });
      // Sort by date (newest first)
      all.sort((a, b) => {
        const dateA = a.createdAt || a.date || new Date();
        const dateB = b.createdAt || b.date || new Date();
        return dateB.getTime() - dateA.getTime();
      });
      setAllBills(all);
    } catch (error) {
      setAllBillsError('Failed to load all bills');
    } finally {
      setAllBillsLoading(false);
    }
  };
  
  const calculateMetrics = async (pendingBills: Bill[]) => {
    try {
      // Get all bills for the current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const paidBills = await getBillsByStatus('paid');
      // Also get partial payments from pending bills
      let partialPayments = 0;
      for (const bill of pendingBills) {
        if (Array.isArray(bill.payments)) {
          for (const payment of bill.payments) {
            // Only count payments made this month
            let paymentDate: Date | undefined;
            if (payment.date instanceof Date) {
              paymentDate = payment.date;
            }
            if (paymentDate && paymentDate >= firstDayOfMonth) {
              partialPayments += typeof payment.amount === 'number' ? payment.amount : 0;
            }
          }
        }
      }

      const thisMonthPaidBills = paidBills.filter(bill => {
        const billDate = bill.paymentDate || bill.createdAt || bill.date;
        return billDate && billDate >= firstDayOfMonth;
      });

      // Calculate earnings: paid bills + partial payments from pending bills
      const earnings = thisMonthPaidBills.reduce((sum, bill) => sum + bill.total, 0) + partialPayments;
      setMonthlyEarnings(earnings);

      // Calculate pending amount (just sum of pending bills' total)
      const pending = pendingBills.reduce((sum, bill) => sum + bill.total, 0);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };
  
  const handleMarkAsPaid = (bill: Bill, method: 'cash' | 'upi') => {
    setPaymentInputDialog({ bill, method });
    setPaymentAmount('');
  };

  const handleProcessPayment = async () => {
    if (!paymentInputDialog) return;
    const { bill, method } = paymentInputDialog;
    const amount = parseFloat(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'destructive'
      });
      return;
    }

    if (amount > bill.total) {
      toast({
        title: 'Amount Exceeds Total',
        description: 'Payment amount cannot exceed the pending amount.',
        variant: 'destructive'
      });
      return;
    }

    setProcessingPayment(bill.id);

    try {
      // Calculate new pending amount
      const newPending = (typeof bill.total === 'number' ? bill.total : 0) - amount;

      if (newPending <= 0.01) {
        // Fully paid, mark as paid
        await updateBillPayment(bill.id, method);
      } else {
        // Partial payment: update bill's total to pending amount and keep status as pending
        await updateBillPayment(bill.id, method, amount, newPending);
      }

      setBills((prevBills) => prevBills.filter(b => b.id !== bill.id || newPending > 0.01));
      toast({
        title: 'Payment Recorded',
        description: `Payment of ₹${amount.toFixed(2)} has been recorded as ${method === 'cash' ? 'Cash' : 'UPI'}${newPending > 0.01 ? `. ₹${newPending.toFixed(2)} pending.` : ''}`
      });

      setPaymentInputDialog(null);
      setPaymentAmount('');
      loadPendingBills();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive'
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleViewBill = async (bill: Bill) => {
    setViewingBill(bill);
    // Optionally fetch and show order details
    // const order = await getOrderById(bill.orderId);
    // setViewingOrder(order);
  };
  
  const filteredBills = bills.filter(bill => 
    bill.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.customerPhone?.includes(searchQuery)
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Payments</h2>
      
      {/* Pending Payments Card should be on top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">₹{pendingAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{bills.length} bills pending</p>
            {/* Show pending amount for each bill */}
            {bills.length > 0 && (
              <div className="mt-3">
                <ul className="space-y-1">
                  {bills.map(bill => (
                    <li key={bill.id} className="flex justify-between text-sm">
                      <span>
                        {bill.customerName} ({bill.customerPhone})
                      </span>
                      <span>
                        Pending: ₹
                        {typeof bill.total === 'number'
                          ? bill.total.toFixed(2)
                          : "0.00"
                        }
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Monthly Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">₹{monthlyEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'MMMM yyyy')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">₹{(monthlyEarnings + pendingAmount).toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Paid + Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h3 className="text-lg font-semibold">Pending Payments</h3>
            <div className="md:w-64">
              <Input
                placeholder="Search by name or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchQuery ? 'No payments match your search' : 'No pending payments found'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3 text-left">Customer</th>
                  <th className="px-6 py-3 text-left">Date</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Items</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium flex items-center">
                            <User className="h-4 w-4 mr-1 text-gray-400" /> 
                            {bill.customerName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" /> 
                            {bill.customerPhone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" /> 
                        {bill.createdAt ? format(bill.createdAt, 'dd MMM yyyy') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹
                      {typeof bill.total === 'number'
                        ? bill.total.toFixed(2)
                        : "0.00"
                      }
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={processingPayment === bill.id}
                          onClick={() => handleMarkAsPaid(bill, 'cash')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Cash
                        </Button>
                        <Button 
                          size="sm"
                          disabled={processingPayment === bill.id}
                          onClick={() => handleMarkAsPaid(bill, 'upi')}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          UPI
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewBill(bill)}
                        >
                          View Bill
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              {/* See Order Details button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Compose WhatsApp message with order details
                    const phone = viewingBill.customerPhone?.replace(/[^0-9]/g, "");
                    const itemsText = viewingBill.items
                      .map(
                        (item) =>
                          `${item.name} x ${item.quantity} (₹${typeof item.price === 'number' ? item.price.toFixed(2) : "0.00"})`
                      )
                      .join("%0A");
                    const message = `Hello ${viewingBill.customerName},%0AHere are your bill/order details:%0A%0ABill ID: ${viewingBill.id}%0AItems:%0A${itemsText}%0ATotal: ₹${typeof viewingBill.total === 'number' ? viewingBill.total.toFixed(2) : "0.00"}%0AStatus: ${viewingBill.status === 'paid' ? 'Paid' : 'Pending Payment'}`;
                    const whatsappUrl = `https://wa.me/91${phone}?text=${message}`;
                    window.open(whatsappUrl, "_blank");
                  }}
                >
                  Share Order Details
                </Button>
              </div>
            </div>
            <DialogFooter>
              {/* Optionally add payment actions here */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
     {/* All Bills Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>All Bills (Last {showAllBills ? '90' : '30'} Days)</CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setShowAllBills(!showAllBills);
              loadAllBills(showAllBills ? 30 : 90);
            }}
          >
            {showAllBills ? 'Show 30 Days' : 'Show 90 Days'}
          </Button>
        </CardHeader>
        <CardContent>
          {allBillsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : allBillsError ? (
            <div className="text-red-500">{allBillsError}</div>
          ) : allBills.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No bills found for this period.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left">Bill ID</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allBills.map(bill => (
                    <tr key={bill.id} className="border-b">
                      <td className="px-4 py-2">{bill.id?.slice(0, 8)}</td>
                      <td className="px-4 py-2">{bill.customerName} ({bill.customerPhone})</td>
                      <td className="px-4 py-2">
                        {bill.createdAt
                          ? format(bill.createdAt, 'dd MMM yyyy')
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-2">
                        ₹{typeof bill.total === 'number' ? bill.total.toFixed(2) : "0.00"}
                      </td>
                      <td className="px-4 py-2">
                        <span className={bill.status === 'paid' ? 'text-green-600' : 'text-amber-600'}>
                          {bill.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Amount Dialog */}
      <Dialog open={!!paymentInputDialog} onOpenChange={(open) => { if (!open) setPaymentInputDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {paymentInputDialog?.method === 'cash' ? 'Cash Payment' : 'UPI Payment'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2">
            <div>
              <div className="text-sm text-gray-500">Pending Amount</div>
              <div className="text-lg font-bold">
                ₹{paymentInputDialog?.bill?.total?.toFixed(2)}
              </div>
            </div>
            <div>
              <Label htmlFor="paymentAmount">Amount Received</Label>
              <input
                id="paymentAmount"
                type="number"
                min="1"
                max={paymentInputDialog?.bill?.total}
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                placeholder="Enter amount received"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentInputDialog(null)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={!paymentAmount || isNaN(Number(paymentAmount)) || Number(paymentAmount) <= 0}>
              Record Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagePayments;
