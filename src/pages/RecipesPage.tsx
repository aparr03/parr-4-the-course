import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import RecipeCard from '../components/RecipeCard'
import { Database } from '../types/supabase'

type Recipe = Database['public']['Tables']['recipes']['Row']
type SupabaseClient = typeof supabase;

const RecipesPage = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('title', { ascending: true })

        if (error) throw error
        setRecipes(data || [])
      } catch (error: any) {
        console.error('Error fetching recipes:', error)
        setError('Failed to load recipes')
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description && recipe.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Recipes</h1>
      
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search recipes..."
          className="w-full p-3 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Loading recipes...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-md">
          <p>{error}</p>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">
          {searchTerm ? "No recipes found matching your search." : "No recipes found. Add some recipes to get started!"}
        </p>
      )}
    </div>
  )
}

export default RecipesPage
