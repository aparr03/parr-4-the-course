import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import RecipesPage from './pages/RecipesPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import AddRecipePage from './pages/AddRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import NotFoundPage from './pages/NotFoundPage';
import MockDataBanner from './components/MockDataBanner';
import { usingMockData } from './lib/supabase';

function App() {  
  return (
    <>
      {/* Show mock data banner if using mock data */}
      <MockDataBanner />
      
      {/* App content with proper text contrast */}
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="recipes">
              <Route index element={<RecipesPage />} />
              <Route path=":id" element={<RecipeDetailPage />} />
              <Route path="edit/:id" element={<EditRecipePage />} />
            </Route>
            <Route path="add-recipe" element={<AddRecipePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </div>
      
      {usingMockData && (
        <div className="text-center p-4 text-xs text-gray-700 bg-gray-100">
          Running with mock data. Set VITE_USE_MOCK_DATA=false to use real data.
        </div>
      )}
    </>
  );
}

export default App;
