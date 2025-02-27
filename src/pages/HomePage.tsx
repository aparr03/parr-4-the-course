import { Link, useNavigate } from 'react-router-dom';
import { colors, componentStyles } from '../styles/theme';

const HomePage = () => {
  const navigate = useNavigate();

  const handleCreateRecipe = () => {
    navigate('/add-recipe');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className={componentStyles.pageHeading}>Welcome to Recipe App</h1>
      
      <div className={`${colors.background.card} shadow-md rounded-lg p-6 ${colors.text.primary}`}>
        <p className={`mb-4 ${colors.text.secondary}`}>
          This is the home page of your recipe application. From here you can browse recipes,
          search for specific dishes, or create your own recipes.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Browse Recipes</h2>
            <p className="mb-3 text-gray-800">Explore our collection of delicious recipes.</p>
            <Link 
              to="/recipes" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View All Recipes
            </Link>
          </div>
          
          <div className="bg-green-50 p-4 rounded-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-900">Create Recipe</h2>
            <p className="mb-3 text-gray-800">Share your own recipe with the community.</p>
            <button 
              onClick={handleCreateRecipe} 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Create New Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
