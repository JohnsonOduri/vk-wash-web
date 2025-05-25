import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const merchantTransactionId = searchParams.get("merchantTransactionId");

  useEffect(() => {
    // Optionally, you can verify status here or redirect after a delay
    // For now, just stay on this page
  }, [merchantTransactionId]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <div className="mb-4 text-lg text-green-600">
        Thank you! Your payment was successful.
      </div>
      {merchantTransactionId && (
        <div className="mb-2 text-gray-700">
          Transaction ID: <span className="font-mono">{merchantTransactionId}</span>
        </div>
      )}
      <a href="/" className="text-blue-600 underline">Go to Home</a>
    </div>
  );
};

export default PaymentSuccess;
