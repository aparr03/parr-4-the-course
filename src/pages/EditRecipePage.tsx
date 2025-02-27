import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Database } from '../types/supabase'

type Recipe = Database['public']['Tables']['recipes']['Row']
type SupabaseClient = typeof supabase;

const EditRecipePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cookingTime, setCookingTime] = useState(0)
  const [servings, setServings] = useState(0)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  
  // Fetch recipe data
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) return
      
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single()
          
        if (error) throw error
        
        if (data) {
          setTitle(data.title)
          setDescription(data.description || '')
          setCookingTime(data.cooking_time)
          setServings(data.servings)
          setCategory(data.category || '')
          setTags(data.tags ? data.tags.join(', ') : '')
          setIngredients(data.ingredients.join('\n'))
          setInstructions(data.instructions)
          setImageUrl(data.image_url || '')
        }
      } catch (error: any) {
        console.error('Error fetching recipe:', error)
        setError('Failed to load recipe')
      } finally {
        setLoading(false)
      }
    }
    
    fetchRecipe()
  }, [id])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!id || !title || !ingredients || !instructions) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setSaving(true)
      setError(null)
      
      const ingredientsArray = ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
        
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : []
        
      const { error } = await supabase
        .from('recipes')
        .update({
          title,
          description: description || null,
          cooking_time: cookingTime,
          servings,
          category: category || null,
          tags: tagsArray.length > 0 ? tagsArray : null,
          ingredients: ingredientsArray,
          instructions,
          image_url: imageUrl || null,
          // Keep user_id unchanged
        })
        .eq('id', id)
        
      if (error) throw error
      
      navigate(`/recipes/${id}`)
    } catch (error: any) {
      console.error('Error updating recipe:', error)
      setError('Failed to update recipe')
    } finally {
      setSaving(false)
    }
  }
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <p>Loading recipe...</p>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Recipe</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">
              Recipe Title *
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Cooking Time (minutes) *
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={cookingTime}
              onChange={(e) => setCookingTime(Number(e.target.value))}
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Servings *
            </label>
            <input
              type="number"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
              min="1"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="E.g., Dessert, Main Course"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="E.g., quick, vegetarian, pasta"
            />
          </div>
          
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">
              Image URL
            </label>
            <input
              type="url"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">
              Ingredients * (one per line)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={6}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              required
            />
          </div>
          
          <div className="col-span-full">
            <label className="block text-gray-700 font-medium mb-2">
              Instructions *
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={8}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/recipes/${id}`)}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-opacity-80 disabled:opacity-50"
          >
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditRecipePage
