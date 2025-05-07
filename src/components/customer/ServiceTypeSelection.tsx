
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shirt, Clock, Star, Check } from 'lucide-react';
import { Control } from 'react-hook-form';
import { z } from 'zod';

const serviceOptions = [
  {
    value: 'Regular',
    title: 'Regular Service',
    description: '3-4 Day Turnaround',
    price: 'Standard pricing',
    icon: <Shirt className="h-5 w-5" />,
    details: 'Our standard service includes basic cleaning for everyday garments.'
  },
  {
    value: 'Premium',
    title: 'Premium Service',
    description: '2-3 Day Turnaround',
    price: '+20% on standard',
    icon: <Star className="h-5 w-5" />,
    details: 'Enhanced service with special care for delicate fabrics and stain treatments.'
  },
  {
    value: 'Express',
    title: 'Express Service',
    description: '24 Hour Turnaround',
    price: '+50% on standard',
    icon: <Clock className="h-5 w-5" />,
    details: 'Priority processing with same-day or next-day delivery options.'
  }
];

interface ServiceTypeSelectionProps {
  control: Control<any>;
}

const ServiceTypeSelection = ({ control }: ServiceTypeSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Type</CardTitle>
        <CardDescription>Choose the laundry service that best fits your needs. Your clothing items will be added by our delivery staff during pickup.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name="serviceType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup 
                  onValueChange={field.onChange} 
                  value={field.value}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  defaultValue="Regular" // Ensure a default value is always selected
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
                            <div className="mt-2 text-sm">
                              <span className="font-medium">{option.price}</span>
                              <p className="mt-1 text-gray-500">{option.details}</p>
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
  );
};

export default ServiceTypeSelection;
