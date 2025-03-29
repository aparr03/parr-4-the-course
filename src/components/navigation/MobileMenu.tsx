import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { navbarStyles } from './navbarStyles';
import { mobileNavItems, adminNavItems, authNavItems } from './navItems';
import { mobileMenuVariants, menuItemVariants } from '../../styles/animations';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useAuth } from '../../context/AuthContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: (path: string) => boolean;
  username: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  isActive,
  username,
  isAdmin,
  onSignOut
}: MobileMenuProps) => {
  const { user } = useAuth();
  const userProfile = useUserProfile(user);

  const getInitial = () => {
    if (username) return username[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={navbarStyles.mobileMenuContainer}
          variants={mobileMenuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={navbarStyles.mobileMenuInner}>
            {/* Theme toggle and user info in mobile menu */}
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center space-x-3">
                {username && (
                  <div className={navbarStyles.avatarContainer}>
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
                )}
                <span className="text-white/90">{username || 'Theme'}</span>
              </div>
              <ThemeToggle />
            </div>

            {/* User-specific options or auth options */}
            {username ? (
              <>
                <div className={navbarStyles.mobileMenuDivider}>
                  {mobileNavItems.map((item) => (
                    <motion.div
                      key={item.href}
                      variants={menuItemVariants}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      className="mb-2"
                    >
                      <Link
                        to={item.href}
                        className="flex items-center px-4 py-3 text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300"
                        onClick={onClose}
                      >
                        <span className="mr-3 flex items-center text-gray-500 dark:text-gray-400">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  {isAdmin && adminNavItems.map((item) => (
                    <motion.div
                      key={item.href}
                      variants={menuItemVariants}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      className="mb-2"
                    >
                      <Link
                        to={item.href}
                        className="flex items-center px-4 py-3 text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300"
                        onClick={onClose}
                      >
                        <span className="mr-3 flex items-center text-gray-500 dark:text-gray-400">
                          {item.icon}
                        </span>
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </div>
                
                <motion.div
                  variants={menuItemVariants}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 border-t border-white/10"
                >
                  <button
                    onClick={() => {
                      onSignOut();
                      onClose();
                    }}
                    className="w-full flex items-center px-4 py-3 text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300"
                  >
                    <span className="mr-3 flex items-center text-red-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </span>
                    Sign out
                  </button>
                </motion.div>
              </>
            ) : (
              <div className={navbarStyles.mobileAuthContainer}>
                {authNavItems.map((item) => (
                  <motion.div
                    key={item.href}
                    variants={menuItemVariants}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={item.href}
                      className="flex items-center px-4 py-3 text-white/90 hover:bg-white/10 dark:hover:bg-gray-600 hover:text-white transition-colors duration-300"
                      onClick={onClose}
                    >
                      <span className="mr-3 flex items-center text-gray-500 dark:text-gray-400">
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 