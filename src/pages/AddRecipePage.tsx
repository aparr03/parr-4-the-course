import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
//import { Database } from '../types/supabase'

//type SupabaseClient = typeof supabase;

const AddRecipePage = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cookingTime, setCookingTime] = useState(30)
  const [servings, setServings] = useState(4)
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [ingredients, setIngredients] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !ingredients || !instructions) {
      setError('Please fill in all required fields')
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const ingredientsArray = ingredients
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean)
        
      const tagsArray = tags
        ? tags.split(',').map(tag => tag.trim()).filter(Boolean)
        : []
        
      const { data, error } = await supabase
        .from('recipes')
        .insert([
          {
            title,
            description: description || null,
            cooking_time: cookingTime,
            servings,
            category: category || null,
            tags: tagsArray.length > 0 ? tagsArray : null,
            ingredients: ingredientsArray,
            instructions,
            image_url: imageUrl || null,
            user_id: 'anonymous', // In a real app, you'd use authenticated user's ID
          }
        ])
        .select()
        
      if (error) throw error
      
      // Navigate to the new recipe page
      if (data && data[0]) {
        navigate(`/recipes/${data[0].id}`)
      } else {
        navigate('/recipes')
      }
    } catch (error: any) {
      console.error('Error adding recipe:', error)
      setError('Failed to add recipe')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Recipe</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Title *
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
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
              placeholder="2 cups flour
1 tsp salt
3 tbsp butter"
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
              placeholder="Detailed step-by-step instructions..."
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/recipes')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-opacity-80 disabled:opacity-50"
          >
            {loading ? 'Adding Recipe...' : 'Add Recipe'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddRecipePage
