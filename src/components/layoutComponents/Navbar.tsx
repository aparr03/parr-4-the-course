import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { componentStyles, colors } from '../../styles/theme';
import Button from '../ui/Button';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`${componentStyles.navbar} transition-all duration-200 ${isScrolled ? 'shadow' : ''}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-primary-600">Recipe</span>
              <span className="text-xl font-bold text-secondary-900">Hub</span>
            </Link>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              <NavLink to="/" current={location.pathname === '/'}>Home</NavLink>
              <NavLink to="/recipes" current={location.pathname.includes('/recipes')}>Recipes</NavLink>
              <NavLink to="/categories" current={location.pathname.includes('/categories')}>Categories</NavLink>
              <NavLink to="/about" current={location.pathname === '/about'}>About</NavLink>
            </div>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden sm:flex sm:items-center">
            <Button 
              variant="secondary" 
              size="sm"
              className="mr-3"
            >
              Login
            </Button>
            <Button 
              variant="primary"
              size="sm"
            >
              Sign Up
            </Button>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="p-2 rounded-md text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} animate-slide-down`}>
        <div className="pt-2 pb-3 space-y-1">
          <MobileNavLink to="/" current={location.pathname === '/'}>Home</MobileNavLink>
          <MobileNavLink to="/recipes" current={location.pathname.includes('/recipes')}>Recipes</MobileNavLink>
          <MobileNavLink to="/categories" current={location.pathname.includes('/categories')}>Categories</MobileNavLink>
          <MobileNavLink to="/about" current={location.pathname === '/about'}>About</MobileNavLink>
        </div>
        <div className="pt-4 pb-3 border-t border-secondary-200">
          <div className="flex items-center px-4 space-x-3">
            <Button 
              variant="secondary" 
              size="sm"
              fullWidth
              className="flex-1"
            >
              Login
            </Button>
            <Button 
              variant="primary"
              size="sm"
              fullWidth
              className="flex-1"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Desktop navigation link
const NavLink = ({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
      current
        ? `border-primary-500 ${colors.text.primary}`
        : `border-transparent ${colors.text.secondary} hover:border-secondary-300 hover:${colors.text.primary}`
    }`}
  >
    {children}
  </Link>
);

// Mobile navigation link
const MobileNavLink = ({ to, current, children }: { to: string; current: boolean; children: React.ReactNode }) => (
  <Link
    to={to}
    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
      current
        ? `border-primary-500 bg-primary-50 ${colors.text.primary}`
        : `border-transparent ${colors.text.secondary} hover:bg-secondary-50 hover:border-secondary-300 hover:${colors.text.primary}`
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
