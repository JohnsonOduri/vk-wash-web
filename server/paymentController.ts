import { Request, Response } from 'express';
import crypto from 'crypto';
import axios from 'axios';

class PaymentController {
  private merchant_id: string;
  private salt_key: string;
  private base_url: string;
  private status_url: string;
  private redirect_base: string;

  constructor() {
    // Production credentials and URLs
    this.merchant_id = "SU2505231821337112049862";
    this.salt_key = "b3ae1ca7-024d-4a67-9177-429a33ed75e1";
    this.base_url = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
    this.status_url = "https://api.phonepe.com/apis/hermes/pg/v1/status";
    this.redirect_base = "https://vkwash.in/status";
  }

  newPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      const merchantTransactionId = String(req.body.transactionId || req.body.billId || `txn-${Date.now()}`);
      const amount = typeof req.body.amount === 'string' ? parseInt(req.body.amount, 10) : req.body.amount;

      if (!amount || isNaN(amount)) {
        res.status(400).json({ error: 'Invalid or missing amount' });
        return;
      }

      const data = {
        merchantId: this.merchant_id,
        merchantTransactionId,
        merchantUserId: req.body.customerId || 'default-user',
        name: req.body.name || "VK Wash Customer",
        amount,
        redirectUrl: `${this.redirect_base}/${merchantTransactionId}`,
        redirectMode: 'POST',
        mobileNumber: req.body.customerPhone || '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const payload = JSON.stringify(data);
      const payloadMain = Buffer.from(payload).toString('base64');
      const checksum = this.generateChecksum(payloadMain, '/pg/v1/pay');

      interface PhonePePayResponse {
        data?: {
          instrumentResponse?: {
            redirectInfo?: {
              url?: string;
            };
          };
        };
      }

      const response = await axios.post<PhonePePayResponse>(this.base_url, {
        request: payloadMain
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum
        }
      });

      if (response.data?.data?.instrumentResponse?.redirectInfo?.url) {
        res.json({ paymentUrl: response.data.data.instrumentResponse.redirectInfo.url });
      } else {
        res.status(500).json({ error: 'Failed to get payment URL' });
      }
    } catch (error: any) {
      console.error('Payment error:', error?.response?.data || error);
      res.status(500).json({
        message: error.message || 'Payment initiation failed',
        success: false
      });
    }
  };

  checkStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const merchantTransactionId = req.params.transactionId || req.body.transactionId;
      const checksum = this.generateChecksum('', `/pg/v1/status/${this.merchant_id}/${merchantTransactionId}`);

      interface PhonePeStatusResponse {
        success?: boolean;
        [key: string]: any;
      }

      const response = await axios.get<PhonePeStatusResponse>(
        `${this.status_url}/${this.merchant_id}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': this.merchant_id
          }
        }
      );

      if (response.data?.success) {
        res.redirect('https://vkwash.in/payment-success');
      } else {
        res.redirect('https://vkwash.in/payment-failure');
      }
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ message: 'Payment status check failed' });
    }
  };

  private generateChecksum(payload: string, urlPath: string): string {
    const string = payload + urlPath + this.salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    return sha256 + '###1';
  }
}

export const paymentController = new PaymentController();
