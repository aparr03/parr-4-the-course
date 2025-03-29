import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { recipeService, Recipe } from '../services/recipeService';
import { createSlug } from '../utils/slugify';
import { MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const RecipesPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isInitialLoad] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Use useQuery with proper typing and error handling
  const { data: recipes = [], isLoading, error: recipesError } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const result = await recipeService.getAllRecipes();
      if (result.error) throw result.error;
      return result.data || [];
    }
  });

  // Filter recipes based on search term and selected tag
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || (recipe.tags && recipe.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Load available tags
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
    let isMounted = true;
    
    const loadData = async () => {
      await loadTags();
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
  }, [loadTags, location.search]);

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
        
        {recipesError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
            <p className="font-bold">Error</p>
            <p>{recipesError.message}</p>
          </div>
        )}
        
        {isLoading && isInitialLoad ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe: Recipe) => (
              <div
                key={recipe.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-transform hover:transform hover:scale-105 cursor-pointer hover:shadow-lg relative"
              >
                <Link 
                  to={`/recipes/${createSlug(recipe.title)}`}
                  className="block"
                >
                  <div className="relative h-48 w-full bg-gray-200 dark:bg-gray-700">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 dark:text-white">No image</span>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link 
                    to={`/recipes/${createSlug(recipe.title)}`}
                    className="block"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                  </Link>

                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        <span className="dark:text-gray-400">{recipe.time} mins</span>
                      </div>
                    )}

                    {recipe.servings && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="dark:text-gray-400">{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>

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

                  {/* Comments section */}
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      <span>{recipe.comments_count ?? 0} comments</span>
                    </div>
                    
                    {(recipe.comments_count ?? 0) > 0 && (
                      <div className="space-y-2">
                        {recipe.recent_comments?.slice(0, 3).map((comment: any) => (
                          <div key={comment.id} className="flex items-start space-x-2 text-sm">
                            <img
                              src={comment.user?.avatar_url || '/default-avatar.png'}
                              alt={comment.user?.username}
                              className="w-6 h-6 rounded-full"
                            />
                            <div className="flex-1">
                              <span className="font-medium">{comment.user?.username}</span>
                              <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                                {comment.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        {(recipe.comments_count ?? 0) > 3 && (
                          <Link
                            to={`/recipes/${createSlug(recipe.title)}#comments`}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            View all {recipe.comments_count} comments
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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