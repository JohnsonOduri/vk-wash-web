
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const pricingData = [
  {
    title: 'Basic Wash',
    price: '$2.50',
    unit: 'per pound',
    description: 'Perfect for everyday clothing items',
    features: [
      'Standard Washing',
      'Standard Drying',
      'Basic Folding',
      '48-Hour Turnaround',
      'Pick-up Available'
    ],
    popular: false,
    buttonText: 'Choose Plan'
  },
  {
    title: 'Premium Wash & Iron',
    price: '$4.50',
    unit: 'per pound',
    description: 'Our most popular service for busy professionals',
    features: [
      'Premium Washing',
      'Professional Ironing',
      'Organized Packaging',
      '24-Hour Turnaround',
      'Free Delivery & Pick-up'
    ],
    popular: true,
    buttonText: 'Choose Plan'
  },
  {
    title: 'Deluxe Package',
    price: '$6.50',
    unit: 'per pound',
    description: 'Complete care for all your garments',
    features: [
      'Premium Washing',
      'Professional Ironing',
      'Stain Treatment',
      'Same-Day Service',
      'Priority Scheduling'
    ],
    popular: false,
    buttonText: 'Choose Plan'
  }
];

const Pricing = () => {
  return (
    <section id="pricing" className="section-padding">
      <div className="container-custom">
        <h2 className="section-title">Simple Pricing</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that works best for your needs. All plans include our quality guarantee and eco-friendly cleaning products.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingData.map((plan, index) => (
            <Card 
              key={index} 
              className={`border ${plan.popular ? 'border-blue shadow-md relative' : 'border-gray-200'} card-hover`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-blue text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-600 ml-1">{plan.unit}</span>
                </div>
                <CardDescription className="text-base text-gray-600">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue mr-2">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'btn-primary' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need a custom solution for your business?</p>
          <Button variant="outline">Contact Us for a Custom Quote</Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
