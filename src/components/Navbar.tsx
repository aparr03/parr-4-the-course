import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { useScroll } from '../hooks/useScroll'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { useUserProfile } from '../hooks/useUserProfile'
import { navbarStyles } from './navigation/navbarStyles'
import { mainNavItems } from './navigation/navItems'
import { hoverVariants } from '../styles/animations'
import { ThemeToggle } from './ui/ThemeToggle'
import { UserMenu } from './navigation/UserMenu'
import { MobileMenu } from './navigation/MobileMenu'

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
    className={navbarStyles.navLink(isActive)}
  >
    {children}
    {isActive && (
      <span className={navbarStyles.navLinkUnderline}></span>
    )}
  </Link>
));

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, username, signOut } = useAuth()
  const scrolled = useScroll()
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userProfile = useUserProfile(user)

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false)
    setUserMenuOpen(false)
  }, [location])

  // Handle outside click for user menu
  useOutsideClick(userMenuRef, () => setUserMenuOpen(false), userMenuOpen)

  // Check if link is active
  const isActive = useCallback((path: string) => location.pathname === path, [location.pathname])

  // Get initial for avatar
  const getInitial = useCallback(() => {
    if (username) return username[0].toUpperCase()
    if (user?.email) return user.email[0].toUpperCase()
    return '?'
  }, [username, user])

  // Filter navigation items based on auth status
  const visibleNavItems = mainNavItems.filter(item => !item.requiresAuth || user)

  // Handle logo click with refresh
  const handleLogoClick = () => {
    window.location.href = '/';
  };

  return (
    <nav 
      className={`${navbarStyles.container} ${
        scrolled ? navbarStyles.scrolled : navbarStyles.notScrolled
      }`}
    >
      <div className={navbarStyles.innerContainer}>
        <div className={navbarStyles.flexContainer}>
          {/* Left side - Logo and Navigation Links */}
          <div className="flex items-center">
            {/* Logo with enhanced animation */}
            <button 
              onClick={handleLogoClick}
              className={navbarStyles.logo}
            >
              <motion.span 
                className={navbarStyles.logoText}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <span className={navbarStyles.logoGradient}>
                  Parr-4-The-Course
                </span>
                <span className={navbarStyles.logoUnderline}></span>
              </motion.span>
            </button>

            {/* Desktop Navigation Links */}
            <div className={navbarStyles.desktopNav}>
              {visibleNavItems.map((item) => (
                <MemoizedNavLink key={item.name} to={item.href} isActive={isActive(item.href)}>
                  {item.name}
                </MemoizedNavLink>
              ))}
            </div>
          </div>

          {/* Right side items - Desktop */}
          <div className={navbarStyles.rightSection}>
            {/* Theme toggle button */}
            <ThemeToggle />

            {/* User profile or auth buttons */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={navbarStyles.userMenuButton}
                  variants={hoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <div className={navbarStyles.avatarContainer}>
                    {userProfile.avatarUrl ? (
                      <img 
                        src={userProfile.avatarUrl} 
                        alt="Avatar" 
                        className={navbarStyles.avatarImage}
                        onError={() => {
                          // Handle image load error by not doing anything
                          // The fallback will be shown automatically
                        }}
                      />
                    ) : (
                      <div className={navbarStyles.avatarFallback}>
                        <span className={navbarStyles.avatarInitial}>{getInitial()}</span>
                      </div>
                    )}
                  </div>
                  <motion.svg 
                    className="w-4 h-4 hidden md:block" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                    animate={{ rotate: userMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </motion.svg>
                </motion.button>

                <UserMenu
                  isOpen={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  username={username || ''}
                  email={user.email || ''}
                  avatarUrl={userProfile.avatarUrl || null}
                  isAdmin={userProfile.isAdmin}
                  onSignOut={signOut}
                />
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.div variants={hoverVariants} whileHover="hover" whileTap="tap">
                  <Link 
                    to="/login" 
                    className="text-white/90 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-1">
                      <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </span>
                    Sign in
                  </Link>
                </motion.div>
                <motion.div 
                  variants={hoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Link 
                    to="/register" 
                    className="bg-gradient-to-r from-white to-blue-50 text-blue-600 dark:from-blue-500 dark:to-blue-600 dark:text-white px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-500 transition-all duration-300 shadow-md flex items-center font-medium"
                  >
                    <span className="mr-1">
                      <svg className="w-4 h-4 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </span>
                    Sign up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center space-x-4">
            {/* User avatar for mobile */}
            {user && (
              <div className="flex items-center">
                <div className={`${navbarStyles.avatarContainer} w-8 h-8`}>
                  {userProfile.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      alt="Avatar" 
                      className={navbarStyles.avatarImage}
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className={navbarStyles.avatarFallback}>
                      <span className={navbarStyles.avatarInitial}>{getInitial()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <motion.button 
              className={navbarStyles.mobileMenuToggle}
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

      {/* Mobile menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isActive={isActive}
        username={username}
        isAdmin={userProfile.isAdmin}
        onSignOut={signOut}
      />
    </nav>
  )
}

export default memo(Navbar)
