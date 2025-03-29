export const navbarStyles = {
  container: `fixed top-0 left-0 right-0 z-50 transition-all duration-300`,
  scrolled: `bg-gradient-to-r from-blue-700/95 to-blue-600/95 dark:from-gray-900/95 dark:to-gray-800/95 shadow-lg py-2`,
  notScrolled: `bg-gradient-to-r from-blue-700/90 to-blue-600/90 dark:from-gray-900/90 dark:to-gray-800/90 py-4`,
  innerContainer: `container mx-auto px-4 md:px-8`,
  flexContainer: `flex items-center justify-between`,
  logo: `text-2xl font-bold text-white group flex items-center mr-8`,
  logoText: `relative overflow-hidden dark:text-white`,
  logoGradient: `bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100 dark:from-white dark:to-blue-200`,
  logoUnderline: `absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-white to-blue-300 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`,
  desktopNav: `hidden md:flex items-center space-x-1`,
  navLink: (isActive: boolean) => `
    relative px-3 py-2 text-base transition-colors duration-200 
    ${isActive 
      ? 'text-white font-medium' 
      : 'text-white/90 dark:text-gray-300'
    } hover:text-white dark:hover:text-blue-400
  `,
  navLinkUnderline: `absolute bottom-0 left-0 w-full h-0.5 bg-white dark:bg-blue-400 transform origin-bottom`,
  rightSection: `hidden md:flex items-center space-x-6`,
  themeToggle: `p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-md`,
  userMenuButton: `flex items-center space-x-2 text-white hover:text-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full p-1`,
  avatarContainer: `w-9 h-9 overflow-hidden rounded-full border-2 border-white/40 transition-all duration-300 hover:border-white/70 shadow-md`,
  avatarImage: `w-full h-full object-cover`,
  avatarFallback: `w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 flex items-center justify-center`,
  avatarInitial: `text-sm font-medium text-white`,
  userMenuContainer: `absolute right-0 mt-2 w-64 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg shadow-2xl py-1 z-50 overflow-hidden border border-gray-100 dark:border-gray-700`,
  userMenuHeader: `px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50`,
  userMenuItem: `block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center`,
  userMenuFooter: `border-t border-gray-100 dark:border-gray-700 py-1 bg-gray-50/50 dark:bg-gray-800/50`,
  signOutButton: `block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center`,
  mobileMenuToggle: `text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded p-1`,
  mobileMenuContainer: `fixed top-[60px] left-0 right-0 bottom-0 bg-gradient-to-b from-blue-700/95 to-blue-600/95 dark:from-gray-900/95 dark:to-gray-800/95 backdrop-blur-md shadow-lg md:hidden`,
  mobileMenuInner: `container mx-auto px-4 py-4 flex flex-col space-y-2`,
  mobileMenuItem: (isActive: boolean) => `
    block px-4 py-3 rounded-lg transition-colors duration-300 
    ${isActive 
      ? 'bg-white/20 dark:bg-gray-600 text-white font-medium shadow-inner' 
      : 'text-white/90 hover:text-white'
    }
  `,
  mobileMenuDivider: `border-t border-gray-400/20 dark:border-gray-500/20`,
  mobileMenuButton: `w-full text-left px-4 py-3 rounded-lg border border-white/20 text-white transition-colors duration-300 hover:bg-white/10 dark:hover:bg-gray-600 flex items-center`,
  mobileAuthContainer: `pt-3 border-t border-white/10 flex flex-col space-y-3`,
  mobileSignUpButton: `block px-4 py-3 rounded-lg bg-white text-blue-600 dark:bg-blue-500 dark:text-white transition-all duration-300 hover:bg-blue-50 dark:hover:bg-blue-600 text-center font-medium shadow-md flex items-center justify-center`
}; 