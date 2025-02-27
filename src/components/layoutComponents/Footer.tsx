import React from 'react';
import { Link } from 'react-router-dom';
import { componentStyles, colors } from '../../styles/theme';

// Define the FooterLink component to fix "Cannot find name 'FooterLink'"
interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => (
  <li>
    <Link 
      to={to}
      className="text-gray-600 hover:text-gray-900 transition-colors"
    >
      {children}
    </Link>
  </li>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={componentStyles.footer}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-600">Recipe</span>
              <span className="text-xl font-bold text-secondary-900">Hub</span>
            </Link>
            <p className={`mt-4 text-sm ${colors.text.secondary}`}>
              Discover and share delicious recipes with our community. From quick weekday meals to impressive dinner party dishes.
            </p>
          </div>
          
          {/* Quick links */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-900">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              <FooterLink to="/recipes">All Recipes</FooterLink>
              <FooterLink to="/categories">Categories</FooterLink>
              <FooterLink to="/popular">Most Popular</FooterLink>
              <FooterLink to="/recent">Recently Added</FooterLink>
            </ul>
          </div>
          
          {/* Information */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-900">
              Information
            </h3>
            <ul className="mt-4 space-y-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/faq">FAQ</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-secondary-900">
              Subscribe to our newsletter
            </h3>
            <p className={`mt-4 text-sm ${colors.text.secondary}`}>
              Get the latest recipes and cooking tips sent straight to your inbox.
            </p>
            <form className="mt-4">
              <div className="flex rounded-md shadow-sm">
                <input
                  type="email"
                  className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-l-md sm:text-sm border-secondary-300"
                  placeholder="Your email"
                />
                <button
                  type="button"
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-r-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* Social links and copyright */}
        <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600">
            © {currentYear} PARR Recipe App. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Link to="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Export default to fix the issue in Layout.tsx
export default Footer;

