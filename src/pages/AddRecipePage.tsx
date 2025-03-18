import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    time: '',
    servings: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  // Animation effect when component mounts
  useEffect(() => {
    setFormVisible(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Save the recipe to Supabase
      const { data, error } = await recipeService.createRecipe(recipe);
      
      if (error) {
        throw error;
      }
      
      console.log('Recipe saved successfully:', data);
      
      // Navigate to recipes page after successful save
      navigate('/recipes');
    } catch (err: any) {
      console.error('Error saving recipe:', err);
      setError(err.message || 'An error occurred while saving the recipe');
    } finally {
      setLoading(false);
    }
  };

  const moveToStep = (step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setActiveStep(step);
    }
  };

  const isCurrentStep = (step: number) => activeStep === step;

  return (
    <div className={`max-w-4xl mx-auto p-4 transition-opacity duration-500 ${formVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Create New Recipe</h1>
        <p className="text-gray-600">Share your culinary masterpiece with the world</p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <button 
              key={index}
              onClick={() => moveToStep(index + 1)}
              className={`flex-1 text-center font-medium ${isCurrentStep(index + 1) ? 'text-blue-600' : 'text-gray-400'}`}
            >
              Step {index + 1}
            </button>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full mt-2">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${(activeStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white shadow-lg rounded-xl p-8 transform transition-all duration-500 hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(1) ? 'block opacity-100' : 'hidden opacity-0'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Basic Information</h2>
            
            <div>
              <label htmlFor="title" className="block mb-2 font-medium text-gray-700">Recipe Title</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={recipe.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g. Grandma's Apple Pie"
              />
            </div>
            
            <div>
              <label htmlFor="imageUrl" className="block mb-2 font-medium text-gray-700">Image URL (optional)</label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={recipe.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="https://example.com/your-image.jpg"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <div></div>
              <button
                type="button"
                onClick={() => moveToStep(2)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Next Step</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Step 2: Ingredients */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(2) ? 'block opacity-100' : 'hidden opacity-0'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Ingredients</h2>
            
            <div>
              <label htmlFor="ingredients" className="block mb-2 font-medium text-gray-700">Ingredients</label>
              <textarea
                id="ingredients"
                name="ingredients"
                required
                value={recipe.ingredients}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={6}
                placeholder="Enter ingredients, one per line&#10;e.g.&#10;2 cups flour&#10;1 cup sugar&#10;1/2 tsp salt"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="time" className="block mb-2 font-medium text-gray-700">Cooking Time (minutes)</label>
                <input
                  id="time"
                  name="time"
                  type="number"
                  value={recipe.time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="1"
                  placeholder="30"
                />
              </div>
              <div>
                <label htmlFor="servings" className="block mb-2 font-medium text-gray-700">Servings</label>
                <input
                  id="servings"
                  name="servings"
                  type="number"
                  value={recipe.servings}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  min="1"
                  placeholder="4"
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => moveToStep(1)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={() => moveToStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <span>Next Step</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Step 3: Instructions */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(3) ? 'block opacity-100' : 'hidden opacity-0'}`}>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Cooking Instructions</h2>
            
            <div>
              <label htmlFor="instructions" className="block mb-2 font-medium text-gray-700">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                required
                value={recipe.instructions}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={8}
                placeholder="Enter step by step instructions&#10;e.g.&#10;1. Preheat oven to 350°F&#10;2. Mix all dry ingredients&#10;3. Add wet ingredients and stir until combined"
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => moveToStep(2)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                type="submit"
                className={`px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save Recipe</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecipePage;
