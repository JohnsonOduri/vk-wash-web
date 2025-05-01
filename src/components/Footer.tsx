
const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img 
              src="/lovable-uploads/198fd8c7-14bf-4b95-bca5-dce17b20b362.png" 
              alt="VK Wash Logo" 
              className="h-12 mb-4 invert opacity-90"
            />
            <p className="text-gray-400 mb-6">
              Fresh Clothes. Fast Service. We provide premium laundry and dry cleaning services with a focus on quality and convenience.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { text: 'Home', href: '#home' },
                { text: 'Services', href: '#services' },
                { text: 'Pricing', href: '#pricing' },
                { text: 'About Us', href: '#about' },
                { text: 'Contact', href: '#contact' }
              ].map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.href} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Services</h4>
            <ul className="space-y-2">
              {[
                'Washing',
                'Ironing',
                'Dry Cleaning',
                'Stain Removal',
                'Garment Repair'
              ].map((service, index) => (
                <li key={index} className="text-gray-400">
                  {service}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <address className="not-italic text-gray-400 space-y-2">
              <p>123 Laundry Street</p>
              <p>Clean City, CC 12345</p>
              <p>Phone: (123) 456-7890</p>
              <p>Email: info@vkwash.com</p>
            </address>
            
            <div className="mt-6">
              <div className="flex space-x-4">
                {['facebook', 'instagram', 'twitter'].map(social => (
                  <a 
                    key={social}
                    href={`https://${social}.com`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-blue hover:text-white transition-colors"
                  >
                    {social[0].toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-gray-500 text-sm text-center">
          <p>&copy; {currentYear} VK Wash. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
