
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

interface ServiceTypeSelectionProps {
  control: Control<any>;
}

const ServiceTypeSelection = ({ control }: ServiceTypeSelectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Type</CardTitle>
        <CardDescription>Choose the service that best fits your needs</CardDescription>
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
  );
};

export default ServiceTypeSelection;
