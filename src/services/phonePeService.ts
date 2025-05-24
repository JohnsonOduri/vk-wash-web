
import { Bill } from '@/models/LaundryItem';

export interface PhonePePaymentRequest {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  redirectMode: string;
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: string;
  };
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}

// These would typically come from environment variables in a production app
const PHONEPE_CONFIG = {
  merchantId: 'PGTESTPAYUAT', // Test merchant ID
  saltKey: '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399', // Test salt key
  saltIndex: 1,
  apiEndpoint: 'https://api-preprod.phonepe.com/apis/pg-sandbox', // Test endpoint
};

export const generateTransactionId = (): string => {
  return `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const createPhonePePaymentRequest = (
  bill: Bill,
  customerPhone: string,
  userId: string
): PhonePePaymentRequest => {
  const transactionId = generateTransactionId();
  
  return {
    merchantId: PHONEPE_CONFIG.merchantId,
    merchantTransactionId: transactionId,
    merchantUserId: userId,
    amount: Math.round(bill.total * 100), // Convert to paisa
    redirectUrl: `${window.location.origin}/payment-success?txnId=${transactionId}`,
    redirectMode: 'POST',
    callbackUrl: `${window.location.origin}/api/phonepe/callback`,
    mobileNumber: customerPhone,
    paymentInstrument: {
      type: 'PAY_PAGE',
    },
  };
};

export const initiatePhonePePayment = async (
  paymentRequest: PhonePePaymentRequest
): Promise<string> => {
  try {
    // In a real implementation, this would go through your backend
    console.log('Initiating PhonePe payment:', paymentRequest);
    
    // For demo purposes, we'll simulate the payment flow
    // In production, this should be done through your backend API
    const base64Payload = btoa(JSON.stringify(paymentRequest));
    const checksum = generateChecksum(base64Payload);
    
    // Simulate PhonePe payment URL
    const paymentUrl = `${PHONEPE_CONFIG.apiEndpoint}/pay?payload=${base64Payload}&checksum=${checksum}`;
    
    // For demo, we'll return a simulated payment URL
    return `https://mercury-t2.phonepe.com/transact/pg?token=${base64Payload}`;
  } catch (error) {
    console.error('PhonePe payment initiation failed:', error);
    throw new Error('Failed to initiate PhonePe payment');
  }
};

// Simple checksum generation (in production, this should be done on backend)
const generateChecksum = (payload: string): string => {
  // This is a simplified version - actual checksum generation should be done on backend
  return btoa(`${payload}${PHONEPE_CONFIG.saltKey}`);
};

export const verifyPhonePePayment = async (
  transactionId: string
): Promise<boolean> => {
  try {
    // In production, this would verify the payment status with PhonePe API
    console.log('Verifying payment for transaction:', transactionId);
    
    // For demo purposes, we'll simulate successful verification
    // In real implementation, make API call to PhonePe status check endpoint
    return true;
  } catch (error) {
    console.error('Payment verification failed:', error);
    return false;
  }
};
