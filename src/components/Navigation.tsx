
import { useState, useEffect } from 'react';
import { Menu, X, LogIn, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFirebaseAuth } from '@/contexts/FirebaseAuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user } = useFirebaseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  const handleLoginClick = () => {
    navigate('/login');
    setIsMenuOpen(false);
  };
  
  const handleDashboardClick = () => {
    if (user?.role === 'customer') {
      navigate('/customer-dashboard');
    } else if (user?.role === 'delivery') {
      navigate('/delivery-dashboard');
    }
    setIsMenuOpen(false);
  };
  
  const handleHomeClick = () => {
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleReviewsClick = () => {
    navigate('/reviews');
    setIsMenuOpen(false);
  };
  
  // Determine if we're on the main landing page
  const isMainPage = location.pathname === '/';
  
  // Determine if we're on a dashboard page
  const isDashboardPage = location.pathname.includes('dashboard');
  
  // Navigation links for landing page
  const mainPageLinks = [
    { name: 'Home', href: '#home', onClick: () => {} },
    { name: 'Services', href: '#services', onClick: () => {} },
    { name: 'Pricing', href: '#pricing', onClick: () => {} },
    { name: 'About', href: '#about', onClick: () => {} },
    { name: 'Contact', href: '#contact', onClick: () => {} }
  ];
  
  // Navigation links for dashboard pages and other non-landing pages
  const otherPagesLinks = [
    { name: 'Home', href: '/', onClick: handleHomeClick },
    { name: 'Reviews', href: '/reviews', onClick: handleReviewsClick },
    { 
      name: 'Dashboard', 
      href: user?.role === 'customer' ? '/customer-dashboard' : '/delivery-dashboard',
      onClick: handleDashboardClick,
      show: !!user // Only show Dashboard link if user is logged in
    }
  ].filter(link => link.show !== false);
  
  // Use the appropriate links based on current page
  const navLinks = isMainPage ? mainPageLinks : otherPagesLinks;
  
  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isMainPage ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="container-custom">
        <div className="flex items-center justify-between">
          <a href={isMainPage ? "#home" : "/"} className="flex items-center" onClick={(e) => {
            if (!isMainPage) {
              e.preventDefault();
              handleHomeClick();
            }
          }}>
            <img alt="VK Wash Logo" className="h-10 md:h-12 transition-transform duration-300 hover:scale-105" src="/lovable-uploads/f6071df1-f9c6-4598-90f2-6eb900efc9aa.png" />
          </a>

          <nav className="hidden md:flex space-x-8">
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                className={`font-medium ${location.pathname === link.href ? 'text-blue-600' : 'text-gray-700'} hover:text-blue transition-colors animate-fade-in`}
                onClick={(e) => {
                  if (!isMainPage || link.onClick) {
                    e.preventDefault();
                    link.onClick();
                  }
                }}
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Button onClick={handleDashboardClick} className="animate-fade-in">
                My Dashboard
              </Button>
            ) : (
              <Button onClick={handleLoginClick} className="animate-fade-in">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>

          <button 
            className="md:hidden text-gray-700 transition-transform duration-300 hover:scale-110" 
            onClick={toggleMenu} 
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white animate-fade-in">
          <div className="container-custom py-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map(link => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  className={`font-medium ${location.pathname === link.href ? 'text-blue-600' : 'text-gray-700'} hover:text-blue transition-colors`}
                  onClick={(e) => {
                    if (!isMainPage || link.onClick) {
                      e.preventDefault();
                      link.onClick();
                      toggleMenu();
                    } else {
                      toggleMenu();
                    }
                  }}
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <Button onClick={() => {
                  handleDashboardClick();
                  toggleMenu();
                }} className="w-full mt-2">
                  My Dashboard
                </Button>
              ) : (
                <Button onClick={() => {
                  handleLoginClick();
                  toggleMenu();
                }} className="w-full mt-2">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navigation;
