
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

const servicesData = [
  {
    title: 'Washing',
    description: 'Our premium washing service uses eco-friendly detergents and advanced machines to care for all fabric types.',
    features: [
      'Whites & Colors Separation',
      'Temperature-Controlled Washing',
      'Special Stain Treatment',
      'Gentle Fabric Care',
      'Eco-Friendly Products'
    ],
    icon: '🧺'
  },
  {
    title: 'Ironing',
    description: 'Professional ironing service that removes wrinkles and gives your garments that crisp, fresh look.',
    features: [
      'Professional Equipment',
      'Steam Treatment',
      'Folding & Hanging Options',
      'Special Fabric Handling',
      'Business Attire Specialty'
    ],
    icon: '👔'
  },
  {
    title: 'Dry Cleaning',
    description: 'Specialized dry cleaning for delicate items and fabrics that cannot withstand traditional washing.',
    features: [
      'Delicate Fabric Care',
      'Stain Removal',
      'Wedding Dress Cleaning',
      'Suits & Formal Wear',
      'Organic Solvents Available'
    ],
    icon: '✨'
  }
];

const Services = () => {
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

    const cards = document.querySelectorAll('.service-card');
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
    <section id="services" ref={sectionRef} className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="section-title animate-[fadeInRight_0.5s_ease-out_forwards]">Our Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto animate-[fadeInLeft_0.5s_ease-out_forwards_0.2s]">
          We offer a comprehensive range of laundry services to meet all your needs, from everyday washing to specialized care for your most delicate items.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <Card 
              key={index} 
              className="border border-gray-200 card-hover service-card opacity-0 transform translate-y-4"
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardHeader>
                <div className="text-4xl mb-4 animate-bounce" style={{ animationDelay: `${index * 0.2}s`, animationDuration: '2s' }}>{service.icon}</div>
                <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start" style={{ animation: `fadeInRight 0.3s ease-out forwards ${i * 0.1 + 0.3}s` }}>
                      <span className="text-blue mr-2 transition-transform duration-300 hover:scale-125">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
