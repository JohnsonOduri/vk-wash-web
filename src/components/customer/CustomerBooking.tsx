
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ServiceTypeSelection from '@/components/customer/ServiceTypeSelection';
import PickupDetails from '@/components/customer/PickupDetails';
import OrderSummary from '@/components/customer/OrderSummary';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { createOrder } from '@/services/orderService';
import { useNavigate } from 'react-router-dom';
import { FieldErrors } from 'react-hook-form';

// Define the schema for the form with validation
const bookingSchema = z.object({
  serviceType: z.enum(['Regular', 'Express', 'Premium'], {
    required_error: "Please select a service type",
  }),
  pickupAddress: z.string().min(5, 'Address must be at least 5 characters'),
  pickupDate: z.string().min(1, 'Pickup date is required'),
  specialInstructions: z.string().optional(),
});

type BookingValues = z.infer<typeof bookingSchema>;

// Service pricing
const PRICING = {
  Regular: { base: 100 },
  Express: { base: 150 },
  Premium: { base: 200 },
};

interface CustomerBookingProps {
  customerId: string;
}

const CustomerBooking: React.FC<CustomerBookingProps> = ({ customerId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: 'Regular',
      pickupAddress: '',
      pickupDate: '',
      specialInstructions: '',
    },
  });

  const watchServiceType = form.watch('serviceType');

  // Calculate total price based on service type
  const calculateTotal = () => {
    return PRICING[watchServiceType].base;
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
      // Create a service type entry (not items array)
      const serviceEntry = {
        name: `${data.serviceType} Laundry Service`,
        price: total,
        quantity: 1
      };
      
      const orderId = await createOrder({
        userId: user.id,
        serviceType: data.serviceType,
        items: [serviceEntry], // We'll add actual clothing items later in the processing phase
        total,
        pickupAddress: data.pickupAddress,
        pickupDate: data.pickupDate,
        specialInstructions: data.specialInstructions || undefined,
      });

      toast({
        title: 'Service Booked',
        description: `Your ${data.serviceType} service has been booked for ${data.pickupDate}! Delivery staff will add your clothing items during pickup.`,
      });
      
      // Navigate to orders tab
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
              <PickupDetails 
                control={form.control} 
                setValue={form.setValue} 
                errors={form.formState.errors}
              />
            </div>
            
            <div>
              <OrderSummary 
                total={total} 
                submitting={isSubmitting} 
                formErrors={Object.keys(form.formState.errors).length > 0}
              />
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomerBooking;
