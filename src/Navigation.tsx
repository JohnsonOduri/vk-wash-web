
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlignRight, X, LogIn, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useWindowSize } from "@/hooks/use-mobile";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isMobile } = useWindowSize();
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Scroll to section with smooth animation
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navClasses = `py-4 fixed w-full z-30 transition-all duration-300 ${
    scrolled ? 'bg-white shadow-md' : 'bg-transparent'
  }`;

  const navItems = [
    { name: 'Home', anchor: 'hero' },
    { name: 'Services', anchor: 'services' },
    { name: 'Pricing', anchor: 'pricing' },
    { name: 'About', anchor: 'about' },
    { name: 'Contact', anchor: 'contact' },
    { name: 'Reviews', link: '/reviews' }
  ];

  return (
    <nav className={navClasses}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-1">
            <Link to="/" className="flex items-center">
              <img src="/lovable-uploads/f6071df1-f9c6-4598-90f2-6eb900efc9aa.png" alt="VK Wash Logo" className="h-8 md:h-10" />
            </Link>
          </div>

          {/* Desktop Nav */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                item.link ? (
                  <Link 
                    key={item.name} 
                    to={item.link} 
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {item.name === 'Reviews' && <Star className="h-4 w-4 inline mr-1" />}
                    {item.name}
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.anchor)}
                    className="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                  >
                    {item.name}
                  </button>
                )
              ))}
            </div>
          )}

          {/* Login Button */}
          <div className="flex-1 flex justify-end">
            <Link to="/login">
              <Button variant="ghost" size="sm" className={`${scrolled ? 'text-gray-700' : 'text-gray-700'}`}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
            
            {/* Mobile Menu Button */}
            {isMobile && (
              <button 
                onClick={toggleMenu}
                className="ml-4 p-2 focus:outline-none"
                aria-label="Menu"
              >
                {isOpen ? 
                  <X className={`h-6 w-6 ${scrolled ? 'text-gray-700' : 'text-gray-700'}`} /> : 
                  <AlignRight className={`h-6 w-6 ${scrolled ? 'text-gray-700' : 'text-gray-700'}`} />
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && (
        <div className={`fixed inset-0 bg-white z-20 transition-transform transform pt-20 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col items-center space-y-6 mt-12">
            {navItems.map((item) => (
              item.link ? (
                <Link 
                  key={item.name}
                  to={item.link} 
                  className="text-xl font-medium text-gray-800 hover:text-blue-600"
                >
                  {item.name === 'Reviews' && <Star className="h-4 w-4 inline mr-1" />}
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.anchor)}
                  className="text-xl font-medium text-gray-800 hover:text-blue-600"
                >
                  {item.name}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
