
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ServiceTypeSelection from '@/components/customer/ServiceTypeSelection';
import ItemsSelection from '@/components/customer/ItemsSelection';
import PickupDetails from '@/components/customer/PickupDetails';
import OrderSummary from '@/components/customer/OrderSummary';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { createOrder } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';

// Define the schema for the form
const bookingSchema = z.object({
  serviceType: z.enum(['regular', 'express', 'premium']),
  shirts: z.number().min(0),
  pants: z.number().min(0),
  dresses: z.number().min(0),
  suits: z.number().min(0),
  others: z.number().min(0),
  pickupAddress: z.string().min(1, 'Pickup address is required'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  specialInstructions: z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

// Service pricing
const PRICING = {
  regular: { base: 10, shirt: 2, pants: 3, dress: 5, suit: 8, other: 4 },
  express: { base: 15, shirt: 3, pants: 4, dress: 7, suit: 10, other: 5 },
  premium: { base: 20, shirt: 4, pants: 5, dress: 8, suit: 12, other: 6 },
};

const CustomerBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'regular',
      shirts: 0,
      pants: 0,
      dresses: 0,
      suits: 0,
      others: 0,
      pickupAddress: '',
      pickupDate: '',
      specialInstructions: '',
    },
  });

  const watchServiceType = form.watch('serviceType');
  const watchShirts = form.watch('shirts');
  const watchPants = form.watch('pants');
  const watchDresses = form.watch('dresses');
  const watchSuits = form.watch('suits');
  const watchOthers = form.watch('others');

  // Calculate total price
  const calculateTotal = () => {
    const pricing = PRICING[watchServiceType];
    
    return (
      pricing.base +
      watchShirts * pricing.shirt +
      watchPants * pricing.pants +
      watchDresses * pricing.dress +
      watchSuits * pricing.suit +
      watchOthers * pricing.other
    );
  };

  const total = calculateTotal();
  
  const onSubmit = async (data: BookingValues) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to book a service.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Map form data to order structure
      const items = [
        { name: 'Shirts', quantity: data.shirts, price: PRICING[data.serviceType].shirt * data.shirts },
        { name: 'Pants', quantity: data.pants, price: PRICING[data.serviceType].pants * data.pants },
        { name: 'Dresses', quantity: data.dresses, price: PRICING[data.serviceType].dress * data.dresses },
        { name: 'Suits', quantity: data.suits, price: PRICING[data.serviceType].suit * data.suits },
        { name: 'Others', quantity: data.others, price: PRICING[data.serviceType].other * data.others },
      ].filter(item => item.quantity > 0);
      
      const orderId = await createOrder({
        userId: user.id,
        serviceType: data.serviceType,
        items,
        total,
        pickupAddress: data.pickupAddress,
        pickupDate: data.pickupDate,
        specialInstructions: data.specialInstructions || undefined,
      });

      toast({
        title: 'Order Placed',
        description: `Your order has been successfully placed! Order ID: ${orderId.slice(0, 8)}`,
      });
      
      navigate('/customer-dashboard');
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'There was a problem submitting your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <ServiceTypeSelection control={form.control} />
              <ItemsSelection control={form.control} />
              <PickupDetails control={form.control} />
            </div>
            
            <div>
              <OrderSummary total={total} submitting={isSubmitting} />
            </div>
          </div>
          
          {/* We don't need a submit button here as it's in OrderSummary */}
        </form>
      </Form>
    </div>
  );
};

export default CustomerBooking;
