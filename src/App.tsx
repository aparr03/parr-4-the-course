import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AddRecipePage from './pages/AddRecipePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

function App() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // Page transition
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  }, [location.pathname]);
  
  return (
    <AuthProvider>
      <div className={`flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        <Navbar />
        <main className="flex-grow px-4 py-8 md:py-12 mt-16">
          <div className="container mx-auto max-w-7xl">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/recipes" element={<RecipesPage />} />
              <Route path="/recipes/:id" element={<RecipeDetailPage />} />
              
              {/* Protected routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/add-recipe" element={
                <ProtectedRoute>
                  <AddRecipePage />
                </ProtectedRoute>
              } />
              <Route path="/edit-recipe/:id" element={
                <ProtectedRoute>
                  <AddRecipePage />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
