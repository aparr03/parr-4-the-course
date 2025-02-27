import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type Recipe = Database['public']['Tables']['recipes']['Row']

const RecipeDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (!id) return
        
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single()
          
        if (error) throw error
        setRecipe(data)
      } catch (error) {
        console.error('Error fetching recipe:', error)
        setError('Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecipe()
  }, [id])
  
  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this recipe?')) return
    
    try {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id)
        
      if (error) throw error
      navigate('/recipes')
    } catch (error) {
      console.error('Error deleting recipe:', error)
      alert('Failed to delete recipe')
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading recipe...</p>
      </div>
    )
  }
  
  if (error || !recipe) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error || 'Recipe not found'}</p>
        <Link to="/recipes" className="text-secondary">Return to all recipes</Link>
      </div>
    )
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <Link to="/recipes" className="text-secondary">&larr; Back to recipes</Link>
        <div className="space-x-3">
          <Link 
            to={`/recipes/edit/${recipe.id}`} 
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Edit
          </Link>
          <button 
            onClick={handleDelete}
            className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      
      {recipe.image_url && (
        <img 
          src={recipe.image_url} 
          alt={recipe.title} 
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
      )}
      
      <h1 className="text-3xl font-bold mb-2">{recipe.title}</h1>
      
      {recipe.description && (
        <p className="text-gray-700 mb-6">{recipe.description}</p>
      )}
      
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-gray-100 px-4 py-2 rounded-md">
          <p className="text-sm text-gray-500">Cooking Time</p>
          <p className="font-medium">{recipe.cooking_time} minutes</p>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-md">
          <p className="text-sm text-gray-500">Servings</p>
          <p className="font-medium">{recipe.servings}</p>
        </div>
        {recipe.category && (
          <div className="bg-gray-100 px-4 py-2 rounded-md">
            <p className="text-sm text-gray-500">Category</p>
            <p className="font-medium">{recipe.category}</p>
          </div>
        )}
      </div>
      
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="mb-6">
          <p className="font-medium mb-2">Tags</p>
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="bg-secondary bg-opacity-20 text-secondary px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <div className="space-y-4">
            {recipe.instructions.split('\n').map((step, index) => (
              <p key={index}>{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage
