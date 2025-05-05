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
    image: 'src/components/pictures/washing.jpg',
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
    image: 'src/components/pictures/ironing.jpg',
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
    image: 'src/components/pictures/dryCleaning.jpg',
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
            <Card
              key={index}
              className="relative border-none overflow-hidden rounded-lg shadow-lg"
              style={{ backgroundImage: `url(${service.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-50"></div>
              <div className="relative z-10 p-6 text-white">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">{service.title}</CardTitle>
                  <CardDescription className="text-base text-white">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-blue-300 mr-2">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
