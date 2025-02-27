import React from 'react';
import { Link } from 'react-router-dom';
import { safeString } from '../utils/safeFunctions';

// Assume Recipe type exists in your project
interface Recipe {
  id: string | number;
  title: string;
  description?: string;
  image_url?: string;
  tags?: string[];
}

interface RecipeListProps {
  recipes: Recipe[] | null;
  loading?: boolean;
  searchTerm?: string;
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  loading = false,
  searchTerm = '' 
}) => {
  if (loading) {
    return <div className="my-8 text-center">Loading recipes...</div>;
  }

  if (!recipes || recipes.length === 0) {
    return (
      <div className="my-8 text-center">
        <p className="text-gray-500">No recipes found.</p>
      </div>
    );
  }

  // Safe highlight function that properly handles undefined values
  const highlightMatch = (text: string | undefined, term: string) => {
    if (!text) return '';
    if (!term.trim()) return text;
    
    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
    } catch (error) {
      console.error('Error in regex highlighting:', error);
      return text;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map(recipe => (
        <div 
          key={recipe.id} 
          className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
          <Link to={`/recipes/${recipe.id}`} className="block">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {recipe.image_url ? (
                <img
                  src={recipe.image_url}
                  alt={recipe.title}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    // Safe fallback for image errors
                    e.currentTarget.src = '/placeholder-recipe.jpg';
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 
                className="text-lg font-medium mb-2"
                dangerouslySetInnerHTML={{ 
                  __html: highlightMatch(safeString(recipe.title), searchTerm) 
                }}
              />
              
              {recipe.description && (
                <p 
                  className="text-gray-600 text-sm line-clamp-2"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightMatch(recipe.description, searchTerm) 
                  }}
                />
              )}
              
              {recipe.tags && recipe.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {recipe.tags.map((tag, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-1 text-xs bg-gray-100 rounded-full text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RecipeList;
