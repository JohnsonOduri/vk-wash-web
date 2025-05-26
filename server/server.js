import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import cors from 'cors';
import pkg from 'pg-sdk-node';
const {
  StandardCheckoutPayRequest,
  OrderStatusResponse,
  StandardCheckoutClient,
  Env,
  CreateSdkOrderRequest
} = pkg;
import { randomUUID } from 'crypto';

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'https://vkwash.in',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Use client credentials from env
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_KEY = process.env.CLIENT_KEY;
const CLIENT_INDEX = process.env.CLIENT_INDEX;
const BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1';
const APP_BE_URL = process.env.APP_BE_URL || 'https://vk-wash-web.onrender.com';

// Validate required env variables at startup
if (!CLIENT_ID || !CLIENT_KEY || !CLIENT_INDEX) {
    console.error('Missing PhonePe credentials in environment variables.');
    process.exit(1);
}

// Utility to generate X-VERIFY header (checksum)
function generateXVerify(payload) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + '/pg/v1/pay' + CLIENT_KEY;
    const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    // X-VERIFY format: <hash>###<saltIndex>
    return `${hash}###${CLIENT_INDEX}`;
}

// Initiate payment route
app.post('/payment', async (req, res) => {
  try {
    const { merchantTransactionId, amount } = req.body;
    const payUrl = '/pg/v1/pay';
    const reqBody = {
      merchantId: CLIENT_ID,
      merchantTransactionId,
      merchantUserId: 'MUID' + Date.now(),
      amount: amount,
      redirectUrl: `${APP_BE_URL}/payment-success?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${APP_BE_URL}/payment-status`,
      mobileNumber: '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };
    const base64Body = Buffer.from(JSON.stringify(reqBody)).toString('base64');
    const stringToHash = base64Body + payUrl + CLIENT_KEY;
    const checksum = crypto.createHash('sha256').update(stringToHash).digest('hex') + "###" + CLIENT_INDEX;
    const response = await axios.post(
      BASE_URL + payUrl,
      { request: base64Body },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          'X-MERCHANT-ID': CLIENT_ID
        }
      }
    );
    res.status(200).json({
      status: 200,
      payload: response.data,
      url: BASE_URL + payUrl,
      requestSent: reqBody
    });
  } catch (err) {
    console.error("PhonePe payment error:", err.response?.data || err.message);
    res.status(502).json({
      error: "PhonePe API error",
      details: err.response?.data || err.message,
      status: err.response?.status || 500
    });
  }
});

// Payment status GET route
app.get('/payment-status/:transactionId', async (req, res) => {
    try {
        const { transactionId } = req.params;
        const stringToHash = `/pg/v1/status/${CLIENT_ID}/${transactionId}` + CLIENT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerify = `${hash}###${CLIENT_INDEX}`;

        const response = await axios.get(
            `${BASE_URL}/status/${CLIENT_ID}/${transactionId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-VERIFY': xVerify
                }
            }
        );

        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Payment status POST route (for callbacks or direct status checks)
app.post('/payment-status', async (req, res) => {
    try {
        // Prefer transactionId from webhook payload, fallback to body/query
        const transactionId =
            req.body.transactionId ||
            req.body.merchantTransactionId ||
            req.body.data?.merchantTransactionId ||
            req.query.transactionId;

        if (!transactionId) {
            console.log('Missing transactionId in webhook payload:', req.body);
            return res.status(400).json({ error: "Missing transactionId" });
        }

        const stringToHash = `/pg/v1/status/${CLIENT_ID}/${transactionId}` + CLIENT_KEY;
        const hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const xVerify = `${hash}###${CLIENT_INDEX}`;

        // Log for debugging
        console.log('Validating transaction with PhonePe:', transactionId);

        let response;
        try {
            response = await axios.get(
                `${BASE_URL}/status/${CLIENT_ID}/${transactionId}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-VERIFY': xVerify
                    }
                }
            );
            console.log('PhonePe status API response:', response.data);
            res.json(response.data);
        } catch (err) {
            if (err.response) {
                console.error('PhonePe status API error:', {
                    status: err.response.status,
                    data: err.response.data
                });
                return res.status(502).json({
                    error: 'PhonePe status API error',
                    details: err.response.data,
                    status: err.response.status
                });
            }
            console.error('Unknown error during PhonePe status API call:', err);
            res.status(500).json({ error: err.message });
        }
    } catch (error) {
        console.error('POST /payment-status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- SDK Order Creation Endpoint ---
app.post('/sdk-order', async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_KEY;
        const clientVersion = Number(process.env.CLIENT_INDEX) || 1;
        const env = Env.SANDBOX; // Always use sandbox for testing

        const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

        const { amount, redirectUrl } = req.body;
        const merchantOrderId = randomUUID();

        const request = CreateSdkOrderRequest.StandardCheckoutBuilder()
            .merchantOrderId(merchantOrderId)
            .amount(amount)
            .redirectUrl(redirectUrl || "http://localhost:8080/payment-status?merchantOrderId=" + merchantOrderId)
            .build();

        const response = await client.createSdkOrder(request);
        const token = response.token;
        res.json({ token, merchantOrderId });
    } catch (error) {
        console.error('SDK Order creation error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// --- SDK Order Status Endpoint ---
app.get('/sdk-order-status/:merchantOrderId', async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_KEY;
        const clientVersion = Number(process.env.CLIENT_INDEX) || 1;
        const env = Env.SANDBOX; // Always use sandbox for testing

        const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

        const { merchantOrderId } = req.params;
        const response = await client.getOrderStatus(merchantOrderId);
        res.json({ state: response.state, response });
    } catch (error) {
        console.error('SDK Order status error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// --- SDK Callback Validation Endpoint ---
app.post('/sdk-validate-callback', async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        const clientSecret = process.env.CLIENT_KEY;
        const clientVersion = Number(process.env.CLIENT_INDEX) || 1;
        const env = Env.SANDBOX; // Always use sandbox for testing

        const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, env);

        const { usernameConfigured, passwordConfigured, authorizationHeaderData, callbackBodyString } = req.body;

        const callbackResponse = client.validateCallback(
            usernameConfigured,
            passwordConfigured,
            authorizationHeaderData,
            callbackBodyString
        );
        res.json({ payload: callbackResponse.payload });
    } catch (error) {
        console.error('SDK Callback validation error:', error);
        res.status(500).json({ error: error.message, stack: error.stack });
    }
});

// Add this GET route for testing
app.get('/payment', (req, res) => {
    res.json({ message: "Payment endpoint is up. Use POST to initiate a payment." });
});

// Health check route
app.get('/', (req, res) => {
    res.json({ status: "VK Wash backend is running" });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("ENV:", process.env.CLIENT_ID, process.env.PHONEPE_BASE_URL);
});