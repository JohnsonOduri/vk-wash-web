
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Bill } from '@/models/LaundryItem';
import { initiatePhonePePayment, createPhonePePaymentRequest } from '@/services/phonePeService';

interface PhonePePaymentProps {
  bill: Bill;
  customerPhone: string;
  userId: string;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PhonePePayment = ({ 
  bill, 
  customerPhone, 
  userId, 
  onPaymentSuccess, 
  onCancel 
}: PhonePePaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePhonePePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment request
      const paymentRequest = createPhonePePaymentRequest(bill, customerPhone, userId);
      
      // Initiate payment
      const paymentUrl = await initiatePhonePePayment(paymentRequest);
      
      // Redirect to PhonePe payment page
      window.open(paymentUrl, '_blank');
      
      // Show success message and close dialog
      toast({
        title: 'Payment Initiated',
        description: 'You will be redirected to PhonePe payment page.',
      });
      
      // In a real app, you would wait for payment completion callback
      // For demo, we'll simulate successful payment after a delay
      setTimeout(() => {
        onPaymentSuccess();
        toast({
          title: 'Payment Successful',
          description: 'Your payment has been processed successfully.',
        });
      }, 3000);
      
    } catch (error) {
      console.error('PhonePe payment error:', error);
      setError('Failed to initiate payment. Please try again.');
      toast({
        title: 'Payment Failed',
        description: 'Unable to process PhonePe payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900">PhonePe Payment</h3>
            <p className="text-sm text-purple-700">Pay securely with PhonePe</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{bill.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bill ID:</span>
            <span className="font-medium">{bill.id?.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Payment Method:</span>
            <span className="font-medium">PhonePe UPI</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handlePhonePePayment}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay with PhonePe
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        You will be redirected to PhonePe to complete your payment securely.
      </p>
    </div>
  );
};

export default PhonePePayment;
