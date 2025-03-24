import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { bookmarkService } from '../services/bookmarkService';
import { useAuth } from '../context/AuthContext';
import type { Recipe } from '../services/recipeService';
import { formatDistanceToNow } from 'date-fns';
import { createSlug } from '../utils/slugify';

// Memoize individual recipe card to prevent unnecessary re-renders
const RecipeCard = memo(({ 
  recipe, 
  bookmarked, 
  bookmarkLoading, 
  onToggleBookmark, 
  onRecipeClick 
}: { 
  recipe: Recipe; 
  bookmarked: boolean; 
  bookmarkLoading: boolean; 
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onRecipeClick: (recipe: Recipe) => void;
}) => {
  const formattedDate = recipe.created_at 
    ? formatDistanceToNow(new Date(recipe.created_at), { addSuffix: true }) 
    : '';

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer hover:shadow-lg relative"
      onClick={() => onRecipeClick(recipe)}
    >
      <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
        {recipe.imageUrl ? (
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            loading="lazy" // Add lazy loading for images
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 dark:text-white">No image</span>
          </div>
        )}
        
        {/* Bookmark button */}
        <button
          onClick={(e) => onToggleBookmark(recipe.id, e)}
          disabled={bookmarkLoading}
          className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {bookmarkLoading ? (
            <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : bookmarked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{recipe.title}</h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="dark:text-gray-400">{recipe.username}</span>
        </div>
        
        <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
          {recipe.time && (
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="dark:text-gray-400">{recipe.time}</span>
            </div>
          )}
          
          {recipe.servings && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span className="dark:text-gray-400">{recipe.servings}</span>
            </div>
          )}
        </div>
        
        {recipe.created_at && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {formattedDate}
          </div>
        )}
        
        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index} 
                className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Advanced memoization to prevent unnecessary re-renders
  return prevProps.recipe.id === nextProps.recipe.id && 
         prevProps.bookmarked === nextProps.bookmarked &&
         prevProps.bookmarkLoading === nextProps.bookmarkLoading;
});

const RecipesPage = () => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});
  const [bookmarkLoading, setBookmarkLoading] = useState<Record<string, boolean>>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Prevent loading animation when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isInitialLoad) {
        // Don't show loading indicator when returning to tab
        setLoading(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isInitialLoad]);

  // Memoize the loadRecipes function to prevent unnecessary re-renders
  const loadRecipes = useCallback(async () => {
    if (isInitialLoad) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const { data, error } = await recipeService.getAllRecipes();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRecipes(data);
        // Initial filtering without re-running the filter logic
        setFilteredRecipes(data);
        
        // If user is logged in, check bookmark status for each recipe
        if (user) {
          await checkBookmarkStatus(data);
        }
      }
    } catch (err: any) {
      console.error('Error loading recipes:', err);
      setError(err.message || 'Failed to load recipes');
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  }, [user, isInitialLoad]);
  
  const loadTags = useCallback(async () => {
    try {
      const { data, error } = await recipeService.getAllTags();
      if (error) throw error;
      if (data) {
        setAvailableTags(data);
      }
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  }, []);
  
  // Use a useEffect with a cleanup function for better performance
  useEffect(() => {
    // Single array for all recipes
    let isMounted = true;
    
    const loadData = async () => {
      await Promise.all([loadRecipes(), loadTags()]);
    };
    
    loadData();
    
    // Check URL for tag parameter
    const params = new URLSearchParams(location.search);
    const tagParam = params.get('tag');
    if (tagParam && isMounted) {
      setSelectedTag(tagParam);
    }
    
    return () => {
      isMounted = false;
    };
  }, [loadRecipes, loadTags, location.search]);
  
  // Memoize filter function to improve performance
  useEffect(() => {
    if (recipes.length > 0) {
      const filtered = recipes.filter(recipe => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTag = !selectedTag || (recipe.tags && recipe.tags.includes(selectedTag));
        return matchesSearch && matchesTag;
      });
      setFilteredRecipes(filtered);
    }
  }, [recipes, searchTerm, selectedTag]);

  const checkBookmarkStatus = async (recipesToCheck: Recipe[]) => {
    if (!user) return;
    
    const newBookmarks: Record<string, boolean> = {};
    
    await Promise.all(
      recipesToCheck.map(async (recipe) => {
        try {
          const { bookmarked } = await bookmarkService.isBookmarked(recipe.id);
          newBookmarks[recipe.id] = bookmarked;
        } catch (err) {
          console.error(`Error checking bookmark for recipe ${recipe.id}:`, err);
        }
      })
    );
    
    setBookmarks(newBookmarks);
  };

  const handleToggleBookmark = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    if (!user) {
      // Prompt user to log in
      if (window.confirm('You need to be logged in to bookmark recipes. Would you like to log in now?')) {
        navigate('/login');
      }
      return;
    }
    
    setBookmarkLoading(prev => ({ ...prev, [recipeId]: true }));
    
    try {
      const { data } = await bookmarkService.toggleBookmark(recipeId);
      
      if (data) {
        setBookmarks(prev => ({
          ...prev,
          [recipeId]: data.bookmarked
        }));
      }
    } catch (err: any) {
      console.error('Error toggling bookmark:', err);
    } finally {
      setBookmarkLoading(prev => ({ ...prev, [recipeId]: false }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTagClick = (tag: string | null) => {
    setSelectedTag(tag);
    
    // Update URL to reflect tag filter
    const params = new URLSearchParams(location.search);
    if (tag) {
      params.set('tag', tag);
    } else {
      params.delete('tag');
    }
    
    navigate({
      pathname: location.pathname,
      search: params.toString()
    }, { replace: true });
  };

  const handleRecipeClick = useCallback((recipe: Recipe) => {
    const slug = createSlug(recipe.title);
    navigate(`/recipes/${slug}`);
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto p-4 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">Recipes</h1>
        
        {/* Search and filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/add-recipe" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 text-white rounded-lg shadow transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span className="dark:text-white">Add Recipe</span>
              </Link>
            </div>
          </div>
          
          {/* Tags filter */}
          {availableTags.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Filter by tag:</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleTagClick(null)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    !selectedTag 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  All
                </button>
                {availableTags.map((tag, index) => (
                  <button
                    key={index}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTag === tag 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {loading && isInitialLoad ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                bookmarked={bookmarks[recipe.id] || false}
                bookmarkLoading={bookmarkLoading[recipe.id] || false}
                onToggleBookmark={handleToggleBookmark}
                onRecipeClick={handleRecipeClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No recipes found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm 
                ? `No recipes matching "${searchTerm}"${selectedTag ? ` with tag "${selectedTag}"` : ''}.` 
                : selectedTag 
                  ? `No recipes with tag "${selectedTag}".` 
                  : 'Try adding your first recipe!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(RecipesPage); 