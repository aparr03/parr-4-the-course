import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, componentStyles } from '../styles/theme';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    time: '',
    servings: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Recipe to save:', recipe);
    
    navigate('/recipes');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className={componentStyles.pageHeading}>Add New Recipe</h1>
      
      <div className={`${colors.background.card} shadow-md rounded-lg p-6 ${colors.text.primary}`}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block mb-1 font-medium">Recipe Title</label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={recipe.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="ingredients" className="block mb-1 font-medium">Ingredients</label>
            <textarea
              id="ingredients"
              name="ingredients"
              required
              value={recipe.ingredients}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Enter ingredients, one per line"
            />
          </div>
          
          <div>
            <label htmlFor="instructions" className="block mb-1 font-medium">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              required
              value={recipe.instructions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
              placeholder="Enter step by step instructions"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="time" className="block mb-1 font-medium">Cooking Time (minutes)</label>
              <input
                id="time"
                name="time"
                type="number"
                value={recipe.time}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="servings" className="block mb-1 font-medium">Servings</label>
              <input
                id="servings"
                name="servings"
                type="number"
                value={recipe.servings}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipePage;
