
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
            VK Wash Laundry & Dry Cleaning Services has been delivering quality laundry care in Vattinagulapally, Gandipet, Hyderabad since <b>1992</b>. We offer reliable, citywide laundry, dry cleaning, and steam ironing services.
            </p>
            <p className="text-gray-600 mb-4">
              Founded by <b>Mr. Vijay Kumar Oduri</b>, VK Wash was inspired by his father, <b>Mr. Veeraraju Oduri</b>. Driven by passion and hard work, Mr. Vijay built the business from scratch. Today, he is supported by his wife<b> Mrs. Mani Oduri</b> and son  <b>Mr. Johnson Oduri</b>, who manages tech operations, keeping the service modern and efficient.
            </p>
            <p className="text-gray-600 mb-4">
            We serve <b>students, professionals, families, and corporates </b>with pickup & delivery, affordable pricing, and fast turnaround—making laundry hassle-free.

            </p>
            <p>
              <b>Our Mission</b><br></br>
            We clean, iron, and deliver—so you don’t have to.<br>
            </br>

Our happy customers have shared glowing reviews on Google, and their trust is our biggest reward.


            </p>
            
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue">30+</div>
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
