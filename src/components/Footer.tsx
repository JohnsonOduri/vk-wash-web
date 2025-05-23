const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div>
            <img 
              src=":public/lovable-uploads/VK logo.png" 
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
            <h4 className="text-lg font-bold mb-4">Contact</h4>
            <address className="not-italic text-gray-400 space-y-2">
              <p>Vattinagulapally, Gandipet </p>
              <p>Hyderabad , 500075</p>
              <p>Phone: +91 8106549413</p>
              <p>Email: vkwashexpress@gmail.com</p>
            </address>
            
            <div className="mt-6">
              <div className="flex space-x-4">
                {['Whatsapp'].map(social => (
                  <a 
                    key={social}
                    href={`https://wa.me/918106549413`}
                    target="_blank"
                    rel="noopener noreferrer" 
                  >
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
