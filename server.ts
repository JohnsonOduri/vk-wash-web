import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import { paymentController } from './server/paymentController';
import path from 'path';


const app = express();
app.use(express.json());

// CORS middleware
app.use((req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// PhonePe routes
app.post('/api/phonepe/payment', (req, res, next) => {
  console.log('Received POST /api/phonepe/payment');
  return paymentController.newPayment(req, res);
});
app.post('/api/phonepe/status/:transactionId', paymentController.checkStatus);
app.get('/api/phonepe/status/:transactionId', paymentController.checkStatus);

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Health check route
app.get('/', (_req, res) => {
  res.send('VK Wash Payment API running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on https://vkwash.in:${PORT}`);
});
