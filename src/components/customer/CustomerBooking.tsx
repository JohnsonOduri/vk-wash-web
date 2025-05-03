
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Shirt, Clock, Star, ArrowRight, Check, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/hooks/use-toast';

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

const serviceOptions = [
  {
    value: 'Regular',
    title: 'Regular Service',
    description: '3-4 Day Turnaround',
    price: 'Standard pricing',
    icon: <Shirt className="h-5 w-5" />
  },
  {
    value: 'Premium',
    title: 'Premium Service',
    description: '2-3 Day Turnaround',
    price: '+20% on standard',
    icon: <Star className="h-5 w-5" />
  },
  {
    value: 'Express',
    title: 'Express Service',
    description: '24 Hour Turnaround',
    price: '+50% on standard',
    icon: <Clock className="h-5 w-5" />
  }
];

const CustomerBooking = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceType: 'Regular',
      items: {
        shirts: '0',
        pants: '0',
        suits: '0',
        dresses: '0',
        other: '0',
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
          <Card>
            <CardHeader>
              <CardTitle>Service Type</CardTitle>
              <CardDescription>Choose the service that best fits your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {serviceOptions.map((option) => (
                          <FormItem key={option.value}>
                            <FormLabel className="cursor-pointer">
                              <FormControl>
                                <RadioGroupItem 
                                  value={option.value} 
                                  className="sr-only"
                                />
                              </FormControl>
                              <Card className={`border-2 transition-all hover:border-blue ${field.value === option.value ? 'border-blue bg-blue/5' : 'border-gray-200'}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <div className={`p-1.5 rounded-full ${field.value === option.value ? 'bg-blue text-white' : 'bg-gray-100'}`}>
                                        {option.icon}
                                      </div>
                                      <div>
                                        <h4 className="font-medium">{option.title}</h4>
                                        <p className="text-sm text-gray-500">{option.description}</p>
                                      </div>
                                    </div>
                                    {field.value === option.value && (
                                      <Check className="h-5 w-5 text-blue" />
                                    )}
                                  </div>
                                  <div className="mt-2 text-sm font-medium">
                                    {option.price}
                                  </div>
                                </CardContent>
                              </Card>
                            </FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>Enter the number of items to be serviced</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="items.shirts"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shirts</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.pants"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pants</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.suits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suits</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.dresses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dresses</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="items.other"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Items</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Pickup Details</CardTitle>
              <CardDescription>Enter details for laundry pickup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="pickupAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pickupDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pickup Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialInstructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Instructions (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Any special instructions for pickup or cleaning" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold flex justify-between">
                <span>Estimated Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Final price may vary based on weight and specific requirements.
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Package className="h-5 w-5 mr-2" />
                    Place Order
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default CustomerBooking;
