import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { recipeService, Recipe } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await recipeService.getRecipe(id);
        if (error) throw error;
        setRecipe(data);
      } catch (err: any) {
        console.error('Error fetching recipe:', err);
        setError(err.message || 'Failed to load the recipe');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecipe();
  }, [id]);
  
  const handleDelete = async () => {
    if (!recipe || !confirm('Are you sure you want to delete this recipe?')) return;
    
    try {
      const { error } = await recipeService.deleteRecipe(recipe.id);
      if (error) throw error;
      navigate('/recipes');
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe: ' + err.message);
    }
  };
  
  const isOwner = () => {
    return user && recipe && recipe.user_id === user.id;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <div className="mt-4">
            <Link to="/recipes" className="text-blue-600 hover:underline">
              Back to Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 text-yellow-600 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Recipe Not Found</h2>
          <p>Sorry, the recipe you're looking for doesn't exist or has been removed.</p>
          <div className="mt-4">
            <Link to="/recipes" className="text-blue-600 hover:underline">
              Browse All Recipes
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Format ingredients and instructions as lists
  const formatIngredients = () => {
    return recipe.ingredients
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((ingredient, index) => (
        <li key={index} className="mb-2 flex items-start">
          <span className="inline-block bg-blue-100 text-blue-800 rounded-full h-5 w-5 flex items-center justify-center text-xs mr-2 mt-0.5">•</span>
          {ingredient.trim()}
        </li>
      ));
  };
  
  const formatInstructions = () => {
    return recipe.instructions
      .split('\n')
      .filter(line => line.trim() !== '')
      .map((step, index) => (
        <li key={index} className="mb-4 pb-4 border-b border-gray-100 last:border-0">
          <div className="flex">
            <span className="bg-blue-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-0.5">
              {index + 1}
            </span>
            <span>{step.replace(/^\d+\.?\s*/, '').trim()}</span>
          </div>
        </li>
      ));
  };
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <Link to="/recipes" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Recipes
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {recipe.imageUrl && (
          <div className="h-64 overflow-hidden">
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 sm:mb-0">{recipe.title}</h1>
            
            {isOwner() && (
              <div className="flex space-x-2">
                <Link
                  to={`/edit-recipe/${recipe.id}`}
                  className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Edit Recipe
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 mb-8">
            {recipe.time && (
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.time} minutes</span>
              </div>
            )}
            
            {recipe.servings && (
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{recipe.servings} servings</span>
              </div>
            )}
            
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Added {new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
            
            {recipe.username && (
              <div className="flex items-center bg-gray-50 px-4 py-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Created by {recipe.username}</span>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Ingredients</h2>
              <ul className="space-y-1">
                {formatIngredients()}
              </ul>
            </div>
            
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Preparation</h2>
              <ol className="space-y-2">
                {formatInstructions()}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage; 