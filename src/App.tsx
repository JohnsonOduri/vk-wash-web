import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import CustomerDashboard from "./pages/CustomerDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import Reviews from "./pages/Reviews";
import ItemPricing from "./pages/ItemPricing";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PaymentStatusPage from "./pages/payment-status";
import PaymentSuccess from "./pages/payment-success";

import NotFound from "./pages/NotFound";
import { FirebaseAuthProvider } from "./contexts/FirebaseAuthContext";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FirebaseAuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/customer-dashboard/*" element={<CustomerDashboard />} />
            <Route path="/delivery-dashboard/*" element={<DeliveryDashboard />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/item-pricing/:category" element={<ItemPricing />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/payment-status" element={<PaymentStatusPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FirebaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
