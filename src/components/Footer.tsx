import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user } = useAuth();
  
  return (
    <footer className="bg-blue-600 dark:bg-gray-800 text-white py-8 mt-10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">About Parr-4-The-Course</h3>
            <p className="text-white dark:text-gray-200 mb-4 text-sm">
              Share and discover amazing recipes from around the world. 
              Create your own cookbook, save favorites, and join our cooking community.
            </p>
            <div className="flex space-x-4">
              {/* GitHub */}
              <a 
                href="https://github.com/aparr03" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/andrew-parr-53b144215/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition"
                aria-label="LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Credly */}
              <a 
                href="https://www.credly.com/users/andrew-parr.1b8277e7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition"
                aria-label="Credly"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" />
                  <path d="M12 7c-2.757 0-5 2.243-5 5s2.243 5 5 5 5-2.243 5-5-2.243-5-5-5zm0 8c-1.654 0-3-1.346-3-3s1.346-3 3-3 3 1.346 3 3-1.346 3-3 3z" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/recipes" className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition">
                  Recipes
                </Link>
              </li>
              {/* Only show Sign Up and Login links when not signed in */}
              {!user && (
                <>
                  <li>
                    <Link to="/register" className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition">
                      Sign Up
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition">
                      Login
                    </Link>
                  </li>
                </>
              )}
              {/* Show profile link when signed in */}
              {user && (
                <li>
                  <Link to="/profile" className="text-white dark:text-gray-200 hover:text-blue-200 dark:hover:text-white transition">
                    Your Profile
                  </Link>
                </li>
              )}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact Me</h3>
            <address className="not-italic">
              <p className="text-white dark:text-gray-200 mb-2">
                <a href="mailto:aparr3@hotmail.com" className="flex items-center text-white hover:text-blue-200 dark:hover:text-white transition">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  aparr3@hotmail.com
                </a>
              </p>

              <p className="text-white dark:text-gray-200 mb-2">
                <a href="https://parrportfolio.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center text-white hover:text-blue-200 dark:hover:text-white transition">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                  </svg>
                  My Portfolio
                </a>
              </p>
     
              
            </address>
          </div>
        </div>
        
        {/* Bottom section with copyright */}
        <div className="mt-8 pt-6 border-t border-blue-500 dark:border-gray-700 text-center">
          <p className="text-sm text-white dark:text-gray-200">
            &copy; {currentYear} Parr-4-The-Course. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
