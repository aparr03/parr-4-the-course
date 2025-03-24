import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { bookmarkService } from '../services/bookmarkService';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

// Helper function to create a slug from a recipe title
const createSlug = (title: string): string => {
  return title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

const BookmarkedRecipesPage = () => {
  const [bookmarkedRecipes, setBookmarkedRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [bookmarkLoading, setBookmarkLoading] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: location, message: 'Please log in to view your bookmarked recipes' } });
      return;
    }
    
    loadBookmarkedRecipes();
    loadAvailableTags();
    
    // Check for tag parameter in URL
    const params = new URLSearchParams(location.search);
    const tagParam = params.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [user, location.search]);

  const loadBookmarkedRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await bookmarkService.getBookmarkedRecipes();
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Extract the recipe objects from bookmarks
        const recipes = data.map(bookmark => bookmark.recipe);
        setBookmarkedRecipes(recipes);
      }
    } catch (err: any) {
      console.error('Error loading bookmarked recipes:', err);
      setError(err.message || 'Failed to load bookmarked recipes');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTags = async () => {
    try {
      const { data, error } = await recipeService.getAllTags();
      if (error) throw error;
      if (data) {
        setAvailableTags(data);
      }
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const handleToggleBookmark = async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    
    setBookmarkLoading(prev => ({ ...prev, [recipeId]: true }));
    
    try {
      await bookmarkService.toggleBookmark(recipeId);
      
      // Remove the recipe from the list
      setBookmarkedRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
    } catch (err: any) {
      console.error('Error removing bookmark:', err);
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

  const filteredRecipes = bookmarkedRecipes.filter(recipe => {
    // First check if the recipe has all required properties
    if (!recipe || !recipe.title) {
      return false;
    }
    
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (recipe.tags && recipe.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const handleRecipeClick = (recipe: any) => {
    const slug = createSlug(recipe.title);
    navigate(`/recipes/${slug}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 pb-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">My Bookmarked Recipes</h1>
        
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
                  placeholder="Search bookmarked recipes..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
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
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map(recipe => (
              <div
                key={recipe.id}
                onClick={() => handleRecipeClick(recipe)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer hover:shadow-lg relative"
              >
                <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                  {recipe.imageUrl ? (
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 dark:text-gray-500">No image</span>
                    </div>
                  )}
                  
                  {/* Remove bookmark button */}
                  <button
                    onClick={(e) => handleToggleBookmark(recipe.id, e)}
                    disabled={bookmarkLoading[recipe.id]}
                    className="absolute top-2 right-2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
                  >
                    {bookmarkLoading[recipe.id] ? (
                      <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{recipe.title}</h3>
                  
                  <div className="flex items-center text-sm text-gray-500 dark:text-white mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="dark:text-gray-400">{recipe.username}</span>
                  </div>
                  
                  {recipe.time && recipe.servings && (
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                      <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                        <span className="dark:text-gray-400">{recipe.time} mins</span>
                      </div>
                      <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-500 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                        <span className="dark:text-gray-400">{recipe.servings} servings</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recipe.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                        <span 
                          key={tagIndex} 
                          className="inline-block px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTagClick(tag);
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          +{recipe.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No bookmarked recipes</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {searchTerm || selectedTag
                ? "No bookmarked recipes match your search or filter."
                : "You haven't bookmarked any recipes yet. Browse recipes and click the bookmark icon to save them for later."}
            </p>
            <Link
              to="/recipes"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Recipes
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkedRecipesPage; 