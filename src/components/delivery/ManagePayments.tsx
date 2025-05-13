
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBillsByStatus, updateBillPayment } from '@/services/laundryItemService';
import { Bill } from '@/models/LaundryItem';
import { format } from 'date-fns';
import { CreditCard, Check, Phone, User, Calendar } from 'lucide-react';

const ManagePayments = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  
  useEffect(() => {
    loadPendingBills();
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
      
      setBills(pendingBills);
      
      // Calculate metrics
      calculateMetrics(pendingBills);
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
  
  const calculateMetrics = async (pendingBills: Bill[]) => {
    try {
      // Get all bills for the current month
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const paidBills = await getBillsByStatus('paid');
      
      const thisMonthPaidBills = paidBills.filter(bill => {
        const billDate = bill.paymentDate || bill.createdAt || bill.date;
        return billDate && billDate >= firstDayOfMonth;
      });
      
      // Calculate earnings
      const earnings = thisMonthPaidBills.reduce((sum, bill) => sum + bill.total, 0);
      setMonthlyEarnings(earnings);
      
      // Calculate pending amount
      const pending = pendingBills.reduce((sum, bill) => sum + bill.total, 0);
      setPendingAmount(pending);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    }
  };
  
  const handleMarkAsPaid = async (billId: string, method: 'cash' | 'upi') => {
    setProcessingPayment(billId);
    try {
      await updateBillPayment(billId, method);
      
      setBills((prevBills) => prevBills.filter(b => b.id !== billId));
      
      toast({
        title: 'Payment Recorded',
        description: `Payment has been marked as ${method === 'cash' ? 'Cash' : 'UPI'} payment`
      });
      
      // Refresh metrics
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
  
  const filteredBills = bills.filter(bill => 
    bill.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.customerPhone?.includes(searchQuery)
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Payments</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <CardTitle className="text-lg">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-600">₹{pendingAmount.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">{bills.length} bills pending</p>
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
                    <td className="px-6 py-4 font-semibold">₹{bill.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={processingPayment === bill.id}
                          onClick={() => handleMarkAsPaid(bill.id, 'cash')}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Cash
                        </Button>
                        <Button 
                          size="sm"
                          disabled={processingPayment === bill.id}
                          onClick={() => handleMarkAsPaid(bill.id, 'upi')}
                        >
                          <CreditCard className="h-4 w-4 mr-1" />
                          UPI
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
    </div>
  );
};

export default ManagePayments;
