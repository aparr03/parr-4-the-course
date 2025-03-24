import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddRecipePage from './pages/AddRecipePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import PasswordResetRequestPage from './pages/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/PasswordResetConfirmPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { useTheme } from './context/ThemeContext';
import BookmarkedRecipesPage from './pages/BookmarkedRecipesPage';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  
  // Page transition - faster and only for subsequent navigations
  useEffect(() => {
    const handleNavigation = () => {
      // Set loading for just 100ms (subtle effect) for a bit of visual indication of page change
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
      
      // Scroll to the top of the page when navigating to a new route
      window.scrollTo({
        top: 0,
        behavior: 'instant' // Use 'instant' instead of 'smooth' to avoid visual jump
      });
    };
    
    // Execute only if there's already content (not first load)
    if (document.body.innerHTML !== '') {
      handleNavigation();
    }
  }, [location.pathname]);
  
  return (
    <div className={`flex flex-col min-h-screen transition-opacity duration-150 ${
      loading ? 'opacity-80' : 'opacity-100'
    } ${
      theme === 'dark' 
        ? 'bg-gray-900 text-white' 
        : 'bg-gradient-to-br from-gray-50 to-blue-50 text-gray-900'
    }`}>
      <Navbar />
      <main className="flex-grow px-4 py-8 md:py-12 mt-16">
        <div className="container mx-auto max-w-7xl">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/recipes" element={<RecipesPage />} />
            <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
            <Route path="/forgot-password" element={<PasswordResetRequestPage />} />
            <Route path="/reset-password" element={<PasswordResetConfirmPage />} />
            
            {/* Protected routes */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/edit-profile" element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/add-recipe" element={
              <ProtectedRoute>
                <AddRecipePage />
              </ProtectedRoute>
            } />
            <Route path="/edit-recipe/:slug" element={
              <ProtectedRoute>
                <AddRecipePage />
              </ProtectedRoute>
            } />
            <Route path="/bookmarks" element={
              <ProtectedRoute>
                <BookmarkedRecipesPage />
              </ProtectedRoute>
            } />
            
            {/* Admin route */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
