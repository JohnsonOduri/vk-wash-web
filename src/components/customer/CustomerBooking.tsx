
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';

// Import our new components
import ServiceTypeSelection from './ServiceTypeSelection';
import ItemsSelection from './ItemsSelection';
import PickupDetails from './PickupDetails';
import OrderSummary from './OrderSummary';

const formSchema = z.object({
  serviceType: z.enum(['Regular', 'Premium', 'Express'], {
    required_error: "Please select a service type",
  }),
  items: z.object({
    shirts: z.string().transform((val) => parseInt(val) || 0),
    pants: z.string().transform((val) => parseInt(val) || 0),
    suits: z.string().transform((val) => parseInt(val) || 0),
    dresses: z.string().transform((val) => parseInt(val) || 0),
    other: z.string().transform((val) => parseInt(val) || 0),
  }),
  pickupAddress: z.string().min(10, "Address is too short").max(200, "Address is too long"),
  pickupDate: z.string().refine(val => {
    const date = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, "Date must be today or in the future"),
  specialInstructions: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CustomerBooking = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: 'Regular',
      items: {
        shirts: 0,
        pants: 0,
        suits: 0,
        dresses: 0,
        other: 0,
      },
      pickupAddress: '',
      pickupDate: new Date().toISOString().split('T')[0],
      specialInstructions: '',
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    
    // Check if at least one item quantity is greater than 0
    const hasItems = Object.values(data.items).some(val => val > 0);
    if (!hasItems) {
      toast({
        title: "No items selected",
        description: "Please add at least one item to your order",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }
    
    // Simulate an API call with a timeout
    setTimeout(() => {
      toast({
        title: "Order Placed Successfully",
        description: "Your laundry service has been booked",
      });
      setSubmitting(false);
      navigate('/customer-dashboard');
    }, 1500);
  };
  
  const calculateTotal = () => {
    const values = form.getValues();
    const itemCounts = Object.values(values.items).reduce((sum, val) => sum + val, 0);
    
    let basePrice = itemCounts * 5; // Assuming $5 per item as base price
    
    switch (values.serviceType) {
      case 'Premium':
        return basePrice * 1.2; // 20% extra for premium
      case 'Express':
        return basePrice * 1.5; // 50% extra for express
      default:
        return basePrice;
    }
  };
  
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6">Book a Laundry Service</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ServiceTypeSelection control={form.control} />
          <ItemsSelection control={form.control} />
          <PickupDetails control={form.control} />
          <OrderSummary total={calculateTotal()} submitting={submitting} />
        </form>
      </Form>
    </div>
  );
};

export default CustomerBooking;
