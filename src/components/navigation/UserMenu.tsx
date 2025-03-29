import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { navbarStyles } from './navbarStyles';
import { mobileNavItems, adminNavItems } from './navItems';
import { dropdownVariants, menuItemVariants } from '../../styles/animations';

interface UserMenuProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  email: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  onSignOut: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  isOpen,
  onClose,
  username,
  email,
  avatarUrl,
  isAdmin,
  onSignOut
}) => {
  const getInitial = () => {
    if (username) return username[0].toUpperCase();
    if (email) return email[0].toUpperCase();
    return '?';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={navbarStyles.userMenuContainer}
          variants={dropdownVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className={navbarStyles.userMenuHeader}>
            <div className="flex items-center space-x-3">
              <div className={navbarStyles.avatarContainer}>
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
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
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{username || email}</p>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            {mobileNavItems.map((item) => (
              <motion.div key={item.href} variants={menuItemVariants} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  to={item.href}
                  className={navbarStyles.userMenuItem}
                  onClick={onClose}
                >
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </motion.div>
            ))}
            
            {isAdmin && adminNavItems.map((item) => (
              <motion.div key={item.href} variants={menuItemVariants} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                <Link
                  to={item.href}
                  className={navbarStyles.userMenuItem}
                  onClick={onClose}
                >
                  <span className="mr-3 text-gray-500 dark:text-gray-400">
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
          
          <div className={navbarStyles.userMenuFooter}>
            <motion.div variants={menuItemVariants} whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className={navbarStyles.signOutButton}
              >
                <span className="mr-3 text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                Sign out
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}; 