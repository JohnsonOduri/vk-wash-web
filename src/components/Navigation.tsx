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
  const navLinks = [{
    name: 'Home',
    href: '#home'
  }, {
    name: 'Services',
    href: '#services'
  }, {
    name: 'Pricing',
    href: '#pricing'
  }, {
    name: 'About',
    href: '#about'
  }, {
    name: 'Contact',
    href: '#contact'
  }];
  return <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <a href="#home" className="flex items-center">
            <img alt="VK Wash Logo" className="h-10 md:h-12" src="/lovable-uploads/f6071df1-f9c6-4598-90f2-6eb900efc9aa.png" />
          </a>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => <a key={link.name} href={link.href} className="font-medium text-gray-700 hover:text-blue transition-colors">
                {link.name}
              </a>)}
          </nav>

          <div className="hidden md:block">
            <Button className="btn-primary">Book Now</Button>
          </div>

          <button className="md:hidden text-gray-700" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && <div className="md:hidden bg-white">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => <a key={link.name} href={link.href} className="font-medium text-gray-700 hover:text-blue transition-colors" onClick={toggleMenu}>
                  {link.name}
                </a>)}
              <Button className="btn-primary w-full mt-2">Book Now</Button>
            </nav>
          </div>
        </div>}
    </header>;
};
export default Navigation;