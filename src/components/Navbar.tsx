import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(false)
  const location = useLocation()
  const { user, username } = useAuth()

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
      scrolled ? 'bg-blue-600 shadow-lg py-2' : 'bg-blue-600/90 py-4'
    }`}>
      <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
        <Link 
          to="/" 
          className="text-2xl font-bold text-white flex items-center group"
        >
          <span className="mr-2 transform transition-transform group-hover:rotate-6 duration-300">📘</span>
          <span className="relative overflow-hidden">
            Parr-4-The-Course
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
        </Link>
        
        {/* Mobile menu button with animation */}
        <div className="md:hidden flex items-center space-x-4">
          {user ? (
            <button 
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="text-white overflow-hidden w-8 h-8 rounded-full hover:opacity-90 transition"
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
                <div className="w-full h-full bg-blue-500 flex items-center justify-center">
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
        </div>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
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

          {/* User menu for desktop */}
          {user ? (
            <div className="relative user-menu-container">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 overflow-hidden rounded-full">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                      onError={() => setAvatarUrl(null)}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium">{getInitial()}</span>
                    </div>
                  )}
                </div>
                <span className="hidden lg:inline-block max-w-[160px] truncate">
                  {username || user.email}
                </span>
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
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-down">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{username || user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Your Profile
                  </Link>
                  <Link
                    to="/add-recipe"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Add Recipe
                  </Link>
                  <div className="border-t border-gray-100">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-white/90 hover:text-white transition"
              >
                Sign in
              </Link>
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile menu with animation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-500 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
          {navigationItems.map((item) => (
            <Link 
              key={item.name}
              to={item.href} 
              className={`px-4 py-2 rounded-md transition-colors duration-300 ${
                isActive(item.href) 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
          
          {user ? (
            <>
              <Link 
                to="/profile"
                className="px-4 py-2 rounded-md transition-colors duration-300 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Your Profile
              </Link>
              <Link 
                to="/profile"
                className="px-4 py-2 rounded-md border border-white/30 text-white transition-colors duration-300 hover:bg-white/10"
              >
                Sign out
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/login"
                className="px-4 py-2 rounded-md transition-colors duration-300 text-white/80 hover:bg-white/10 hover:text-white"
              >
                Sign in
              </Link>
              <Link 
                to="/register"
                className="px-4 py-2 rounded-md bg-white text-blue-600 transition-colors duration-300 hover:bg-blue-50"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile user menu dropdown */}
      {userMenuOpen && user && window.innerWidth < 768 && (
        <div className="fixed top-16 right-4 w-56 bg-white rounded-md shadow-lg py-1 z-50 animate-fade-in-down">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{username || user.email}</p>
          </div>
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Your Profile
          </Link>
          <Link
            to="/add-recipe"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Add Recipe
          </Link>
          <div className="border-t border-gray-100">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
