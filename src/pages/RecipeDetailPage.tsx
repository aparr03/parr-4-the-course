import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { bookmarkService } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Comments } from '../components/Comments';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Helper function to create a slug from a recipe title
const createSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

const RecipeDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState(false);
  const [formattedIngredients, setFormattedIngredients] = useState<string[]>([]);
  const [formattedInstructions, setFormattedInstructions] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (slug) {
      fetchRecipeBySlug(slug);
    }
  }, [slug]);

  // Handle scrolling to comments section when URL has #comments hash
  useEffect(() => {
    // Wait for content to load and then scroll if needed
    if (!loading && location.hash === '#comments' && commentsRef.current) {
      // Use a small timeout to ensure the DOM is fully rendered
      setTimeout(() => {
        commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [loading, location.hash]);
  
  const fetchRecipeBySlug = async (recipeSlug: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get all recipes to find the one with the matching slug
      const { data: recipes, error: recipesError } = await recipeService.getAllRecipes();
      
      if (recipesError) {
        throw recipesError;
      }
      
      // Find recipe with matching slug
      const matchingRecipe = recipes?.find(r => createSlug(r.title) === recipeSlug);
      
      if (!matchingRecipe) {
        throw new Error('Recipe not found');
      }
      
      // Now fetch the full recipe by ID
      const { data, error } = await recipeService.getRecipe(matchingRecipe.id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRecipe(data);
        formatIngredientsAndInstructions(data);
        
        // Check if recipe is bookmarked by the current user
        if (user) {
          checkBookmarkStatus(data.id);
          checkLikeStatus(data.id);
        }

        // Get like count
        const { data: likesData, error: likesError } = await supabase
          .from('recipe_likes')
          .select('id', { count: 'exact' })
          .eq('recipe_id', data.id);

        if (likesError) {
          console.error('Error fetching likes count:', likesError);
          setLikeCount(0);
        } else {
          setLikeCount(likesData?.length || 0);
        }
      }
    } catch (err: any) {
      console.error('Error fetching recipe:', err);
      setError(err.message || 'Failed to fetch recipe');
    } finally {
      setLoading(false);
    }
  };
  
  const checkBookmarkStatus = async (recipeId: string) => {
    try {
      const isBookmarkedResult = await bookmarkService.isBookmarked(recipeId);
      setIsBookmarked(isBookmarkedResult.bookmarked);
    } catch (err) {
      console.error('Error checking bookmark status:', err);
    }
  };
  
  const checkLikeStatus = async (recipeId: string) => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('recipe_likes')
        .select('id')
        .eq('recipe_id', recipeId)
        .eq('user_id', user.id)
        .maybeSingle();

      setIsLiked(!!data);
    } catch (err) {
      console.error('Error checking like status:', err);
    }
  };
  
  const handleToggleBookmark = async () => {
    if (!user) {
      // Prompt user to log in
      const confirmed = window.confirm('Please log in to bookmark recipes. Would you like to go to the login page?');
      if (confirmed) {
        navigate('/login');
      }
      return;
    }
    
    if (!recipe) return;
    
    setBookmarkLoading(true);
    try {
      await bookmarkService.toggleBookmark(recipe.id);
      
      // Update bookmark status
      setIsBookmarked(!isBookmarked);
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };
  
  const handleToggleLike = async () => {
    if (!user || !recipe || likeLoading) return;

    setLikeLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('recipe_likes')
          .delete()
          .eq('recipe_id', recipe.id)
          .eq('user_id', user.id);

        if (error) throw error;
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        // Like
        const { error } = await supabase
          .from('recipe_likes')
          .insert([{ recipe_id: recipe.id, user_id: user.id }]);

        if (error) throw error;
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Refresh the like count and status on error
      checkLikeStatus(recipe.id);
      const { data: likesData } = await supabase
        .from('recipe_likes')
        .select('id', { count: 'exact' })
        .eq('recipe_id', recipe.id);
      setLikeCount(likesData?.length || 0);
    } finally {
      setLikeLoading(false);
    }
  };
  
  const formatIngredientsAndInstructions = (recipe: any) => {
    // Format ingredients: split by newline and filter out empty lines
    const ingredients = recipe.ingredients
      .split('\n')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
    
    // Format instructions: split by newline and filter out empty lines
    // Also handle numbered lists (1. Step one, 2. Step two) by removing the numbers
    const instructions = recipe.instructions
      .split('\n')
      .map((item: string) => {
        // Remove leading numbers if they exist (e.g., "1. ", "2. ")
        return item.trim().replace(/^\d+\.\s*/, '');
      })
      .filter((item: string) => item.length > 0);
    
    setFormattedIngredients(ingredients);
    setFormattedInstructions(instructions);
  };
  
  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };
  
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
  };
  
  const handleDeleteRecipe = async () => {
    if (!recipe) return;
    
    setDeletingRecipe(true);
    
    try {
      const { error } = await recipeService.deleteRecipe(recipe.id);
      
      if (error) {
        throw error;
      }
      
      // Close the modal and navigate to recipes page
      setDeleteModalOpen(false);
      navigate('/recipes');
    } catch (err: any) {
      console.error('Error deleting recipe:', err);
      setError(err.message || 'Failed to delete recipe');
    } finally {
      setDeletingRecipe(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Not Found: </strong>
          <span className="block sm:inline">Recipe not found.</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto p-4 pb-32">
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
        {/* Recipe Image */}
        <div className="relative h-64 md:h-80 w-full bg-gray-300 dark:bg-gray-700">
          {recipe.imageUrl ? (
            <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-400 dark:text-gray-500">No image available</span>
            </div>
          )}
          
          {/* Action buttons container */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {/* Like button */}
            <button
              onClick={handleToggleLike}
              disabled={likeLoading}
              className="bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isLiked ? "Unlike recipe" : "Like recipe"}
            >
              <Heart
                className={`h-5 w-5 ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-500'
                }`}
              />
              <span className="sr-only">{likeCount} likes</span>
            </button>

            {/* Bookmark button */}
            <button
              onClick={handleToggleBookmark}
              disabled={bookmarkLoading}
              className="bg-white dark:bg-gray-800 rounded-full p-2.5 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              {bookmarkLoading ? (
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isBookmarked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Recipe Content */}
        <div className="p-6">
          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{recipe.title}</h1>
              <div className="flex items-center mt-2 space-x-2">
                <span className="flex items-center text-gray-600 dark:text-gray-400">
                  <Heart className="w-4 h-4 mr-1" />
                  {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
            </div>
            
            {/* Actions for recipe owner */}
            {user && user.id === recipe.user_id && (
              <div className="flex space-x-4 mt-4 md:mt-0">
                <Link
                  to={`/edit-recipe/${slug}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Recipe
                </Link>
                <button
                  onClick={handleDeleteClick}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          
          {/* Recipe metadata */}
          <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-300 mb-6 gap-4">
            {/* Author */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>By {recipe.username}</span>
            </div>
            
            {/* Cooking Time */}
            {recipe.time && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{recipe.time} mins</span>
              </div>
            )}
            
            {/* Servings */}
            {recipe.servings && (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
                <span>{recipe.servings} servings</span>
              </div>
            )}
            
            {/* Date created */}
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          {/* Tags */}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag: string, index: number) => (
                  <Link 
                    key={index} 
                    to={`/recipes?tag=${tag}`} 
                    className="inline-flex items-center px-3 py-0.5 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>
          
          {/* Recipe sections */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Ingredients</h2>
              <ul className="space-y-2">
                {formattedIngredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start text-gray-700 dark:text-gray-300">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2"></span>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Instructions */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Instructions</h2>
              <ol className="space-y-4">
                {formattedInstructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 text-white font-semibold mr-3 shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8" ref={commentsRef}>
            <Comments recipeId={recipe.id} />
          </div>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Recipe</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">Are you sure you want to delete this recipe? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteRecipe}
                disabled={deletingRecipe}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingRecipe ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetailPage; 