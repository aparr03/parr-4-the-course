import { Link } from 'react-router-dom'
import { Database } from '../types/supabase'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface RecipeCardProps {
  recipe: Recipe
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {recipe.image_url && (
        <img 
          src={recipe.image_url} 
          alt={recipe.title} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{recipe.title}</h3>
        {recipe.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
        )}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{recipe.cooking_time} mins</span>
          <span>Serves {recipe.servings}</span>
        </div>
        <div className="mt-4">
          <Link 
            to={`/recipes/${recipe.id}`} 
            className="bg-secondary text-white py-2 px-4 rounded hover:bg-opacity-80 transition-all"
          >
            View Recipe
          </Link>
        </div>
      </div>
    </div>
  )
}

export default RecipeCard
