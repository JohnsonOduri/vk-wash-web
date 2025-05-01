
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll('.pricing-card');
    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      cards.forEach((card) => {
        observer.unobserve(card);
      });
    };
  }, []);

  return (
    <section id="pricing" ref={sectionRef} className="section-padding">
      <div className="container-custom">
        <h2 className="section-title animate-[scaleIn_0.5s_ease-out_forwards]">Simple Pricing</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto animate-[fadeInRight_0.5s_ease-out_forwards_0.2s]">
          Choose the plan that works best for your needs. All plans include our quality guarantee and eco-friendly cleaning products.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingData.map((plan, index) => (
            <Card 
              key={index} 
              className={`border ${plan.popular ? 'border-blue shadow-md relative' : 'border-gray-200'} card-hover pricing-card opacity-0 transform translate-y-4 transition-all duration-500`}
              style={{ transitionDelay: `${index * 200}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit px-4 py-1 bg-blue text-white text-sm font-medium rounded-full animate-pulse">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold">{plan.title}</CardTitle>
                <div className="mt-4 mb-2 transition-all duration-300 hover:scale-110 transform-origin-left">
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
                    <li key={i} className="flex items-start" style={{ animation: `fadeInLeft 0.3s ease-out forwards ${i * 0.1 + 0.3}s` }}>
                      <span className="text-blue mr-2 transition-transform duration-300 hover:rotate-12">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'btn-primary animate-pulse' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'} transition-transform duration-300 hover:scale-105`}
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4 animate-[fadeInRight_0.5s_ease-out_forwards_0.5s]">Need a custom solution for your business?</p>
          <Button variant="outline" className="transition-all duration-300 hover:scale-105 hover:shadow-md animate-[fadeInLeft_0.5s_ease-out_forwards_0.7s]">Contact Us for a Custom Quote</Button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
