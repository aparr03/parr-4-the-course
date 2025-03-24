import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { profileService } from '../services/profileService'
import { adminService } from '../services/adminService'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

// Create memoized version of NavLink to avoid unnecessary re-renders
const MemoizedNavLink = memo(({ 
  to, 
  children, 
  isActive 
}: { 
  to: string; 
  children: React.ReactNode; 
  isActive: boolean 
}) => (
  <Link
    to={to}
    className={`relative px-3 py-2 text-base transition-colors duration-200 
      ${isActive 
        ? 'text-white font-medium' 
        : 'text-white/90 dark:text-gray-300'
      } hover:text-white dark:hover:text-blue-400`}
  >
    {children}
    {isActive && (
      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white dark:bg-blue-400 transform origin-bottom"></span>
    )}
  </Link>
));

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isAvatarLoading, setIsAvatarLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const { user, username, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const userMenuRef = useRef<HTMLDivElement>(null)
  
  // Handle scroll effect with throttling and debouncing for performance
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 10) {
            setScrolled(true)
          } else {
            setScrolled(false)
          }
          lastScrollY = window.scrollY;
          ticking = false;
        });
        ticking = true;
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
    if (userMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
      setUserMenuOpen(false)
    }
  }, [userMenuOpen])
  
  useEffect(() => {
    document.addEventListener('click', handleOutsideClick)
    return () => document.removeEventListener('click', handleOutsideClick)
  }, [handleOutsideClick])

  // Load user avatar with lazy loading and improved timing
  useEffect(() => {
    if (!user) {
      setAvatarUrl(null)
      setIsAdmin(false)
      return;
    }
    
    // Use requestIdleCallback for non-critical resources when available
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loadUserAvatar();
        checkAdminStatus();
      });
    } else {
      const timer = setTimeout(() => {
        loadUserAvatar();
        checkAdminStatus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
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
  
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { isAdmin } = await adminService.isAdmin();
      setIsAdmin(isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  // Check if link is active
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname]);

  // Get initial for avatar
  const getInitial = useCallback(() => {
    if (username) return username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  }, [username, user]);

  // Navigation items
  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'Recipes', href: '/recipes' },
  ];

  // Animation variants
  const dropdownVariants = {
    hidden: { opacity: 0, y: -5, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0, 
      y: -5, 
      scale: 0.95,
      transition: { 
        duration: 0.15,
        ease: "easeIn"
      }
    }
  };

  const mobileMenuVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: { 
        height: { duration: 0.3 },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: { 
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    }
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gradient-to-r from-blue-700/95 to-blue-600/95 dark:from-gray-900/95 dark:to-gray-800/95 shadow-lg py-2' 
          : 'bg-gradient-to-r from-blue-700/90 to-blue-600/90 dark:from-gray-900/90 dark:to-gray-800/90 py-4'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Navigation Links */}
          <div className="flex items-center">
            {/* Logo with enhanced animation */}
            <Link 
              to="/" 
              className="text-2xl font-bold text-white group flex items-center mr-8"
            >
              <motion.span 
                className="relative overflow-hidden dark:text-white"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200">
                  Parr-4-The-Course
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-blue-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></span>
              </motion.span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1 ">
              {navigationItems.map((item) => (
                <MemoizedNavLink key={item.name} to={item.href} isActive={isActive(item.href)}>
                  {item.name}
                </MemoizedNavLink>
              ))}
            </div>
          </div>

          {/* Right side items */}
          <div className="flex items-center space-x-6">
            {/* Theme toggle button with enhanced animation */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileTap={{ scale: 0.9 }}
              whileHover={{ 
                scale: 1.1, 
                boxShadow: "0 0 15px rgba(255, 255, 255, 0.5)" 
              }}
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, 15, 0], transition: { duration: 0.3 } }}
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
            </motion.button>

            {/* User profile dropdown with improved animation */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-9 h-9 overflow-hidden rounded-full border-2 border-white/40 transition-all duration-300 hover:border-white/70 shadow-md">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                        onError={() => setAvatarUrl(null)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">{getInitial()}</span>
                      </div>
                    )}
                  </div>
                  <motion.svg 
                    className="w-4 h-4" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </motion.svg>
                </motion.button>

                {/* User menu dropdown with enhanced styling */}
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div 
                      className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-2xl py-1 z-50 overflow-hidden border border-gray-100 dark:border-gray-700"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username || user.email}</p>
                      </div>
                      
                      <div className="py-1">
                        {[
                          { to: "/profile", label: "Your Profile", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
                          { to: "/bookmarks", label: "Bookmarked Recipes", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg> },
                          { to: "/add-recipe", label: "Add Recipe", icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> }
                        ].map((item) => (
                          <motion.div key={item.to} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <Link
                              to={item.to}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                            >
                              <span className="mr-2 text-gray-500 dark:text-gray-400">{item.icon}</span>
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
                        
                        {isAdmin && (
                          <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                            <Link
                              to="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                            >
                              <span className="mr-2 text-gray-500 dark:text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </span>
                              Admin Dashboard
                            </Link>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-100 dark:border-gray-700 py-1 bg-gray-50/50 dark:bg-gray-800/50">
                        <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                          <button
                            onClick={() => signOut()}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
                          >
                            <span className="mr-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                            </span>
                            Sign out
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/login" 
                    className="text-white/90 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-1">
                      <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                    </span>
                    Sign in
                  </Link>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-white to-blue-50 text-blue-600 dark:from-blue-500 dark:to-blue-600 dark:text-white px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 shadow-md flex items-center font-medium"
                  >
                    <span className="mr-1">
                      <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    </span>
                    Sign up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Theme toggle */}
            <motion.button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-300 border border-white/30 shadow-sm"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              whileTap={{ scale: 0.9 }}
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
            </motion.button>
            
            {/* Mobile hamburger menu button with enhanced animation */}
            <motion.button 
              className="text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              whileTap={{ scale: 0.9 }}
              initial={false}
            >
              <div className="w-6 h-6 relative flex justify-center items-center">
                <motion.span 
                  className="absolute w-6 h-0.5 bg-white rounded-full shadow-glow"
                  animate={{ 
                    rotate: isMenuOpen ? 45 : 0,
                    y: isMenuOpen ? 0 : -8
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
                <motion.span 
                  className="absolute w-6 h-0.5 bg-white rounded-full shadow-glow"
                  animate={{ 
                    opacity: isMenuOpen ? 0 : 1,
                    x: isMenuOpen ? -20 : 0
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
                <motion.span 
                  className="absolute w-6 h-0.5 bg-white rounded-full shadow-glow"
                  animate={{ 
                    rotate: isMenuOpen ? -45 : 0,
                    y: isMenuOpen ? 0 : 8
                  }}
                  transition={{ duration: 0.3 }}
                ></motion.span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu with enhanced animation and styling */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden overflow-hidden bg-gradient-to-b from-blue-700/95 to-blue-600/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-md shadow-lg"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-2">
              {/* Mobile navigation items */}
              {navigationItems.map((item) => (
                <motion.div
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link 
                    to={item.href} 
                    className={`block px-4 py-3 rounded-lg transition-colors duration-300 ${
                      isActive(item.href) 
                        ? 'bg-white/20 dark:bg-gray-600 text-white font-medium shadow-inner' 
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* User-specific options */}
              {user ? (
                <>
                  <div className="pt-3 border-t border-white/10">
                    {[
                      { 
                        to: "/profile", 
                        label: "Your Profile",
                        icon: <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      },
                      { 
                        to: "/bookmarks", 
                        label: "Bookmarked Recipes",
                        icon: <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      },
                      { 
                        to: "/add-recipe", 
                        label: "Add Recipe",
                        icon: <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      }
                    ].map(item => (
                      <motion.div
                        key={item.to}
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        className="mb-2"
                      >
                        <Link 
                          to={item.to}
                          className="block px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300 flex items-center"
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      </motion.div>
                    ))}
                    
                    {isAdmin && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                        className="mb-2"
                      >
                        <Link 
                          to="/admin"
                          className="block px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300 flex items-center"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Admin Dashboard
                        </Link>
                      </motion.div>
                    )}
                  </div>
                  
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                    className="pt-2"
                  >
                    <button 
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-3 rounded-lg border border-white/20 text-white transition-colors duration-300 hover:bg-white/10 dark:hover:bg-gray-600 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sign out
                    </button>
                  </motion.div>
                </>
              ) : (
                <div className="pt-3 border-t border-white/10 flex flex-col space-y-3">
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to="/login"
                      className="block px-4 py-3 rounded-lg text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                      Sign in
                    </Link>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ x: 2, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to="/register"
                      className="block px-4 py-3 rounded-lg bg-white text-blue-600 dark:bg-blue-500 dark:text-white transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-600 text-center font-medium shadow-md flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-2 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                      Sign up
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default memo(Navbar)
