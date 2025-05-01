
const About = () => {
  return (
    <section id="about" className="section-padding bg-gray-50">
      <div className="container-custom">
        <h2 className="section-title">About VK Wash</h2>
        
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          <div className="lg:w-1/2">
            <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1582562124811-c09040d0a901?auto=format&fit=crop&w=800&h=450" 
                alt="VK Wash Laundry Facility" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="lg:w-1/2">
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-gray-600 mb-4">
              Founded in 2018, VK Wash began with a simple mission: to provide busy professionals with high-quality laundry services that save time without compromising on quality. What started as a small operation has grown into a trusted name in the community.
            </p>
            <p className="text-gray-600 mb-4">
              We take pride in our attention to detail, environmentally conscious practices, and exceptional customer service. Every garment that passes through our facility receives the utmost care and attention.
            </p>
            <p className="text-gray-600 mb-4">
              Our team of experienced professionals is committed to delivering spotless, neatly pressed clothing with every order. We understand that your garments are important to you, which is why we handle them as if they were our own.
            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">5+</div>
                <div className="text-sm text-gray-600">Years of Experience</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">20+</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">500+</div>
                <div className="text-sm text-gray-600">Weekly Clients</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">3</div>
                <div className="text-sm text-gray-600">Locations</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Choose VK Wash?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Quality Service',
                description: 'We treat each garment with exceptional care and attention to detail.',
                icon: '⭐'
              },
              {
                title: 'Eco-Friendly',
                description: 'Our processes and products are selected to minimize environmental impact.',
                icon: '🌿'
              },
              {
                title: 'Convenient',
                description: 'Free pick-up and delivery options to fit your busy schedule.',
                icon: '🚚'
              },
              {
                title: 'Affordable',
                description: 'Competitive pricing without compromising on quality or service.',
                icon: '💰'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm card-hover">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
