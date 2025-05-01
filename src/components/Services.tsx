
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  return (
    <section id="services" className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="section-title">Our Services</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          We offer a comprehensive range of laundry services to meet all your needs, from everyday washing to specialized care for your most delicate items.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service, index) => (
            <Card key={index} className="border border-gray-200 card-hover">
              <CardHeader>
                <div className="text-4xl mb-4">{service.icon}</div>
                <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-blue mr-2">✓</span>
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
