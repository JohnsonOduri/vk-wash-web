
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Services', href: '#services' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <a href="#home" className="flex items-center group">
            <img 
              src="/lovable-uploads/198fd8c7-14bf-4b95-bca5-dce17b20b362.png" 
              alt="VK Wash Logo" 
              className="h-10 md:h-12 transition-all duration-300 group-hover:scale-105 filter hover:brightness-110"
            />
          </a>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link, index) => (
              <a 
                key={link.name}
                href={link.href}
                className="font-medium text-gray-700 hover:text-blue transition-all duration-300 relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-0 after:left-0 after:bg-blue after:origin-bottom-right after:transition-transform after:duration-300 hover:after:scale-x-100 hover:after:origin-bottom-left"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button className="btn-primary transition-transform duration-300 hover:scale-105 hover:shadow-md">Book Now</Button>
          </div>

          <button 
            className="md:hidden text-gray-700 transition-transform duration-300 hover:scale-105"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} className="animate-fade-in-up" /> : <Menu size={24} className="animate-fade-in-up" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in-up">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <a 
                  key={link.name}
                  href={link.href}
                  className="font-medium text-gray-700 hover:text-blue transition-colors"
                  onClick={toggleMenu}
                  style={{ animation: `fadeInRight 0.3s ease-out forwards ${index * 0.1}s` }}
                >
                  {link.name}
                </a>
              ))}
              <Button className="btn-primary w-full mt-2 transition-transform duration-300 hover:scale-105" style={{ animation: 'fadeInRight 0.3s ease-out forwards 0.5s' }}>Book Now</Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
