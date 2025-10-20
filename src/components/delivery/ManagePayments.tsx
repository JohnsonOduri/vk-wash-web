import { Bill } from '@/models/LaundryItem';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CreditCard, Check, Phone, User, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getBillsByStatus, updateBillPayment } from '@/services/laundryItemService';

// Interfaces
export interface Payment {
  amount: number;
  method: 'cash' | 'upi' | string;
  date: Date;
}

// Generate invoice PDF
const generateInvoiceImage = async (bill: Bill): Promise<Blob> => {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`VK Wash Invoice`, 10, 10);
  doc.text(`Bill ID: ${bill.id}`, 10, 20);
  doc.text(`Customer: ${bill.customerName}`, 10, 30);
  doc.text(`Phone: ${bill.customerPhone}`, 10, 40);

  const tableData = bill.items.map(item => [
    item.name,
    item.quantity.toString(),
    `₹${item.price?.toFixed(2) ?? '0.00'}`,
  ]);

  autoTable(doc, {
    startY: 50,
    head: [['Item', 'Qty', 'Price']],
    body: tableData,
  });

  // Fix for finalY
  const finalY = (doc as any).lastAutoTable?.finalY || 50;

  doc.text(`Subtotal: ₹${bill.subtotal?.toFixed(2) ?? '0.00'}`, 10, finalY + 10);
  doc.text(`Tax: ₹${bill.tax?.toFixed(2) ?? '0.00'}`, 10, finalY + 20);
  doc.text(`Total: ₹${bill.total?.toFixed(2) ?? '0.00'}`, 10, finalY + 30);

  return doc.output('blob');
};

// Upload invoice to Cloudinary & share on WhatsApp
const uploadInvoiceImageAndShareWhatsApp = async (
  blob: Blob,
  phone: string,
  name: string,
  billId: string,
  amount: number
) => {
  try {
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'YOUR_UPLOAD_PRESET'); // <-- Replace with your preset

    const res = await fetch(`https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload`, { // <-- Replace with your Cloudinary name
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    const invoiceUrl = data.secure_url;

    const upiLink = `upi://pay?pa=YOUR_UPI_ID&pn=${encodeURIComponent(name)}&tn=VK Wash Bill ${billId}&am=${amount}&cu=INR`;

    const message = `Hello ${name},\nYour VK Wash Bill (${billId}) total: ₹${amount.toFixed(2)}.\n\nInvoice: ${invoiceUrl}\nPay via UPI: ${upiLink}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");

  } catch (error) {
    console.error('Error uploading invoice:', error);
    toast({
      title: 'Error',
      description: 'Failed to share invoice via WhatsApp',
      variant: 'destructive'
    });
  }
};

const ManagePayments = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [paymentInputDialog, setPaymentInputDialog] = useState<{ bill: Bill; method: 'cash' | 'upi' } | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  useEffect(() => {
    loadPendingBills();
  }, []);

  const loadPendingBills = async () => {
    setIsLoading(true);
    try {
      const pendingBills = await getBillsByStatus('pending');
      pendingBills.sort((a, b) => (a.createdAt || new Date()).getTime() - (b.createdAt || new Date()).getTime());
      setBills(pendingBills);
      calculateMetrics(pendingBills);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load pending payments', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = async (pendingBills: Bill[]) => {
    try {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const paidBills = await getBillsByStatus('paid');

      let partialPayments = 0;
      for (const bill of pendingBills) {
        // Safely access payments in case Bill type doesn't declare it
        const payments = (bill as any).payments as Payment[] | undefined;
        if (payments) {
          for (const payment of payments) {
            if (payment.date && payment.date >= firstDayOfMonth) partialPayments += payment.amount;
          }
        }
      }

      const thisMonthPaidBills = paidBills.filter(bill => bill.paymentDate && bill.paymentDate >= firstDayOfMonth);
      setMonthlyEarnings(thisMonthPaidBills.reduce((sum, bill) => sum + bill.total, 0) + partialPayments);
      setPendingAmount(pendingBills.reduce((sum, bill) => sum + bill.total, 0));

    } catch (error) {
      console.error(error);
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
      toast({ title: 'Invalid Amount', description: 'Please enter a valid payment amount.', variant: 'destructive' });
      return;
    }
    if (amount > bill.total) {
      toast({ title: 'Amount Exceeds Total', description: 'Payment amount cannot exceed the pending amount.', variant: 'destructive' });
      return;
    }

    setProcessingPayment(bill.id);
    try {
      const newPending = bill.total - amount;
      if (newPending <= 0.01) await updateBillPayment(bill.id, method);
      else await updateBillPayment(bill.id, method, amount, newPending);

      setBills(prev => prev.filter(b => b.id !== bill.id || newPending > 0.01));
      toast({ title: 'Payment Recorded', description: `Payment of ₹${amount.toFixed(2)} recorded.${newPending > 0.01 ? ` ₹${newPending.toFixed(2)} pending.` : ''}` });
      setPaymentInputDialog(null);
      setPaymentAmount('');
      loadPendingBills();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to record payment', variant: 'destructive' });
    } finally {
      setProcessingPayment(null);
    }
  };

  const filteredBills = bills.filter(bill =>
    bill.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.customerPhone.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Payments</h2>

      {/* Pending Payments Table / Cards */}
      {filteredBills.map(bill => (
        <Card key={bill.id}>
          <CardHeader>
            <CardTitle>{bill.customerName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>Total: ₹{bill.total.toFixed(2)}</div>
            <Button onClick={() => setViewingBill(bill)}>View & Share Invoice</Button>
            <Button onClick={() => handleMarkAsPaid(bill, 'cash')}>Mark Cash Paid</Button>
            <Button onClick={() => handleMarkAsPaid(bill, 'upi')}>Mark UPI Paid</Button>
          </CardContent>
        </Card>
      ))}

      {/* Bill Details Dialog */}
      {viewingBill && (
        <Dialog open={!!viewingBill} onOpenChange={() => setViewingBill(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Bill Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="font-medium">{viewingBill.customerName}</div>
              <div>Total: ₹{viewingBill.total.toFixed(2)}</div>

              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  if (!viewingBill) return;
                  const blob = await generateInvoiceImage(viewingBill);
                  uploadInvoiceImageAndShareWhatsApp(
                    blob,
                    viewingBill.customerPhone,
                    viewingBill.customerName,
                    viewingBill.id,
                    viewingBill.total
                  );
                }}
              >
                Share via WhatsApp
              </Button>
            </div>
            <DialogFooter>
              <Button onClick={() => setViewingBill(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManagePayments;
