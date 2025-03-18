import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { profileService } from '../services/profileService'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const location = useLocation()
  const { user, username } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Handle scroll effect with passive listener for better performance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Handle outside click for user menu with memoized handler
  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (userMenuOpen && !(e.target as Element).closest('.user-menu-container')) {
      setUserMenuOpen(false)
    }
  }, [userMenuOpen])
  
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [handleOutsideClick])

  // Load user avatar with lazy loading
  useEffect(() => {
    // Don't fetch avatar immediately on page load
    if (!user) {
      setAvatarUrl(null)
      return;
    }
    
    // Delay avatar loading slightly to prioritize critical page content
    const timer = setTimeout(() => {
      loadUserAvatar();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user])
  
  const loadUserAvatar = async () => {
    if (!user || isAvatarLoading) return;
    
    setIsAvatarLoading(true);
    try {
      const { data } = await profileService.getProfileByUserId(user.id)
      if (data?.avatar_url) {
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      console.error('Error loading avatar:', error)
    } finally {
      setIsAvatarLoading(false);
    }
  }

  // Check if link is active
  const isActive = (path: string) => location.pathname === path

  // Get initial for avatar
  const getInitial = () => {
    if (username) return username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  // Navigation items
  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-blue-600 dark:bg-gray-800 shadow-lg py-2' : 'bg-blue-600/90 dark:bg-gray-800/90 py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        {/* Desktop navigation and controls - moved to the left */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Navigation links */}
          {navigationItems.map((item) => (
            <Link 
              key={item.name}
              to={item.href} 
              className={`relative px-2 py-1 font-medium transition-colors duration-300 ${
                isActive(item.href) 
                  ? 'text-white' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {item.name}
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-300 ${
                isActive(item.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}></span>
            </Link>
          ))}

          {/* User profile - moved from right to left */}
          {user && (
            <div className="relative user-menu-container">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 overflow-hidden rounded-full border-2 border-white/30">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarUrl(null)}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                      <span className="text-sm font-medium">{getInitial()}</span>
                    </div>
                  )}
                </div>
                <svg 
                  className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>

              {/* Desktop User Menu Dropdown */}
              {userMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 animate-fade-in-down">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username || user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Your Profile
                  </Link>
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* More noticeable theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 border border-white/30"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu button with animation */}
        <div className="md:hidden flex items-center space-x-4">
          {/* Mobile hamburger menu button */}
          <button 
            className="text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 relative flex justify-center items-center">
              <span className={`transform transition-all duration-300 w-6 h-0.5 bg-white absolute ${
                isMenuOpen ? 'rotate-45' : '-translate-y-1.5'
              }`}></span>
              <span className={`transition-opacity duration-300 w-6 h-0.5 bg-white absolute ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`transform transition-all duration-300 w-6 h-0.5 bg-white absolute ${
                isMenuOpen ? '-rotate-45' : 'translate-y-1.5'
              }`}></span>
            </div>
          </button>
           
          {/* Mobile theme toggle - more noticeable */}
          <button
            onClick={toggleTheme}
            className="text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 border border-white/30"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path>
              </svg>
            )}
          </button>
          
          {/* Mobile user avatar button */}
          {user ? (
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="text-white overflow-hidden w-8 h-8 rounded-full hover:opacity-90 transition border-2 border-white/30"
              aria-label="User menu"
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarUrl(null)}
                />
              ) : (
                <div className="w-full h-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium">{getInitial()}</span>
                </div>
              )}
            </button>
          ) : (
            <Link 
              to="/login" 
              className="text-white/90 hover:text-white transition"
            >
              Sign in
            </Link>
          )}
        </div>
        
        {/* Title moved to the right */}
        <Link 
          to="/" 
          className="text-2xl font-bold text-white group"
        >
          <span className="relative overflow-hidden">
            Parr-4-The-Course
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
        </Link>

        {/* Sign in/up links for desktop when not logged in */}
        {!user && (
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/login" 
              className="text-white/90 hover:text-white transition"
            >
              Sign in
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-blue-600 dark:bg-gray-700 dark:text-white px-4 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-600 transition"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
      
      {/* Mobile menu with animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {/* Mobile navigation items */}
          {navigationItems.map((item) => (
            <Link 
              key={item.name}
              to={item.href} 
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                isActive(item.href) 
                  ? 'bg-white/20 dark:bg-gray-700 text-white' 
                  : 'text-white/80 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Mobile user profile options */}
          {user ? (
            <>
              <Link 
                to="/profile"
                className="px-4 py-2 rounded-md transition-colors duration-300 text-white/80 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white"
              >
                Your Profile
              </Link>
              <Link 
                to="/profile"
                className="px-4 py-2 rounded-md border border-white/30 text-white transition-colors duration-300 hover:bg-white/10 dark:hover:bg-gray-700"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="px-4 py-2 rounded-md transition-colors duration-300 text-white/80 hover:bg-white/10 dark:hover:bg-gray-700 hover:text-white"
              >
                Sign in
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-blue-600 dark:text-white transition-colors duration-300 hover:bg-blue-50 dark:hover:bg-gray-600"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile user menu dropdown */}
      {userMenuOpen && user && window.innerWidth < 768 && (
        <div className="fixed top-16 right-4 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 animate-fade-in-down">
          <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username || user.email}</p>
          </div>
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Your Profile
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
