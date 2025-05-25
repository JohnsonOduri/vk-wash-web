import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const PaymentStatusPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("Checking payment status...");

  useEffect(() => {
    const merchantTransactionId = searchParams.get("merchantTransactionId");
    // Optionally, you can also check for a status param or call your backend for real status
    // For now, just show a generic message
    if (merchantTransactionId) {
      fetch(`/payment-status/${merchantTransactionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success || data.code === "PAYMENT_SUCCESS" || data.data?.state === "COMPLETED") {
            setStatus("success");
            setMessage("Payment Successful! Thank you for your payment.");
          } else {
            setStatus("failed");
            setMessage("Payment Failed or Pending. Please contact support if you have been charged.");
          }
        })
        .catch(() => {
          setStatus("failed");
          setMessage("Could not verify payment status. Please contact support.");
        });
    } else {
      setStatus("failed");
      setMessage("Invalid payment status request.");
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>
      <div className={`mb-4 text-lg ${status === "success" ? "text-green-600" : "text-red-600"}`}>
        {message}
      </div>
      <a href="/" className="text-blue-600 underline">Go to Home</a>
    </div>
  );
};

export default PaymentStatusPage;
