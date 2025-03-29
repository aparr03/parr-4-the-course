import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import { createSlug } from '../utils/slugify';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const { } = useAuth();
  const [recipe, setRecipe] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    time: '',
    servings: '',
    imageUrl: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard'
  });
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Load existing recipe data when in edit mode
  useEffect(() => {
    // Check if we're in edit mode (slug parameter exists)
    if (slug) {
      setIsEditMode(true);
      loadRecipeData(slug);
    }
    
    setFormVisible(true);
    
    // Load available tags
    loadAvailableTags();
  }, [slug]);

  // Load available tags from the database
  const loadAvailableTags = async () => {
    try {
      const { data, error } = await recipeService.getAllTags();
      if (error) throw error;
      if (data) {
        setAvailableTags(data);
      }
    } catch (err) {
      console.error('Error loading available tags:', err);
    }
  };

  // Function to load recipe data when editing
  const loadRecipeData = async (recipeSlug: string) => {
    setLoading(true);
    try {
      // First, get all recipes to find the one with the matching slug
      const { data: recipes, error: recipesError } = await recipeService.getAllRecipes();
      
      if (recipesError) {
        throw recipesError;
      }
      
      // Find recipe with matching slug
      const matchingRecipe = recipes?.find(r => createSlug(r.title) === recipeSlug);
      
      if (!matchingRecipe) {
        throw new Error('Recipe not found');
      }
      
      // Now fetch the full recipe by ID
      const { data, error } = await recipeService.getRecipe(matchingRecipe.id);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRecipeId(data.id);
        setRecipe({
          title: data.title || '',
          description: data.description || '',
          ingredients: data.ingredients || '',
          instructions: data.instructions || '',
          time: data.time || '',
          servings: data.servings || '',
          imageUrl: data.imageUrl || '',
          difficulty: data.difficulty || 'easy'
        });
        
        // Set tags if they exist
        if (data.tags) {
          setTags(data.tags);
        }
        
        // Set image preview if there's an image URL
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      }
    } catch (err: any) {
      console.error('Error loading recipe for editing:', err);
      setError(err.message || 'Failed to load recipe data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRecipe({
      ...recipe,
      [name]: value
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle adding a new tag
  const handleAddTag = (tagValue?: string) => {
    const tag = (tagValue || tagInput).trim().toLowerCase();
    if (!tag) return;
    
    // Check if tag already exists in the list
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    
    setTagInput('');
    setShowTagSuggestions(false);
  };

  // Handle removing a tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Filter available tags based on tag input
  const filteredTags = availableTags
    .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
    .filter(tag => !tags.includes(tag)) // Don't show already added tags
    .slice(0, 5); // Limit to 5 suggestions

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert form data to match Recipe type
      const recipeData = {
        title: recipe.title,
        description: recipe.description,
        ingredients: recipe.ingredients.split('\n').filter(i => i.trim()),
        instructions: recipe.instructions.split('\n').filter(i => i.trim()),
        time: parseInt(recipe.time, 10) || 0,
        servings: parseInt(recipe.servings, 10) || 0,
        difficulty: recipe.difficulty,
        imageUrl: recipe.imageUrl,
        tags: tags,
        updated_at: new Date().toISOString()
      };

      let result;
      
      // If we're in edit mode, update the existing recipe
      if (isEditMode && recipeId) {
        console.log('Updating existing recipe:', recipeId);
        result = await recipeService.updateRecipe(recipeId, recipeData);
      } else {
        // Otherwise create a new recipe
        console.log('Creating new recipe');
        result = await recipeService.createRecipe(recipeData);
      }
      
      const { data, error } = result;
      
      if (error) {
        throw error;
      }
      
      console.log(`Recipe ${isEditMode ? 'updated' : 'saved'} successfully:`, data);
      
      // Navigate to recipes page after successful save
      navigate(`/recipes/${createSlug(data.title)}`);
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} recipe:`, err);
      setError(err.message || `An error occurred while ${isEditMode ? 'updating' : 'saving'} the recipe`);
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
    <div className="max-w-4xl mx-auto p-4 pb-20">
      <div className={`bg-white dark:bg-gray-800/90 rounded-xl shadow-lg p-6 sm:p-8 transition-opacity duration-500 ${formVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
          {isEditMode ? 'Edit Recipe' : 'Add New Recipe'}
        </h1>
      
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
      
        <div className="bg-white dark:bg-gray-700/90 shadow-lg rounded-xl p-8 transform transition-all duration-500 hover:shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Information */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(1) ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Basic Information</h2>
            
            <div>
                <label htmlFor="title" className="block mb-2 font-medium text-gray-700 dark:text-white">Recipe Title</label>
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
                <label htmlFor="imageUrl" className="block mb-2 font-medium text-gray-700 dark:text-white">Recipe Image</label>
                <div className="space-y-3">
                  <input 
                    ref={fileInputRef}
                    type="file"
                    id="imageFile"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  
                  {imagePreview ? (
                    <div className="mt-2">
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-300">
                        <img 
                          src={imagePreview} 
                          alt="Recipe preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600 dark:text-white">Click to upload an image</span>
                      <span className="text-xs text-gray-500 mt-1 dark:text-white">(PNG, JPG, JPEG up to 5MB)</span>
                    </button>
                  )}
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600 dark:text-white">Or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                  </div>
                  
              <input
                id="imageUrl"
                name="imageUrl"
                type="url"
                value={recipe.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="tags" className="block mb-2 font-medium text-gray-700 dark:text-white">Tags</label>
                <div className="space-y-2">
                  {/* Display added tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {tags.map((tag, index) => (
                      <div 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Tag input with autocomplete */}
                  <div className="relative">
                    <div className="flex">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => {
                          setTagInput(e.target.value);
                          setShowTagSuggestions(true);
                        }}
                        onFocus={() => setShowTagSuggestions(true)}
                        placeholder="Add tags (e.g. dinner, vegetarian, easy)"
                        className="flex-grow px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddTag()}
                        className="px-4 py-3 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      >
                        Add
                      </button>
                    </div>
                    
                    {/* Tag suggestions */}
                    {showTagSuggestions && tagInput.trim() !== '' && filteredTags.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                        {filteredTags.map((tag, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => handleAddTag(tag)}
                          >
                            {tag}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Tags help users find your recipe. Add up to 5 tags.
                  </p>
                </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <div></div>
              <button
                type="button"
                onClick={() => moveToStep(2)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                  <span className="text-white">Next Step</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Step 2: Ingredients */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(2) ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Ingredients</h2>
            
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
                  <label htmlFor="time" className="block mb-2 font-medium text-gray-700 dark:text-white">Cooking Time (minutes)</label>
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
                  className="px-6 py-3 bg-gray-400 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                  <span className="text-white">Previous</span>
              </button>
              <button
                type="button"
                onClick={() => moveToStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                  <span className="text-white">Next Step</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Step 3: Instructions */}
          <div className={`space-y-6 transition-opacity duration-300 ${isCurrentStep(3) ? 'block opacity-100' : 'hidden opacity-0'}`}>
              <h2 className="text-xl font-semibold mb-4 dark:text-white text-gray-800">Cooking Instructions</h2>
            
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
                  className="px-6 py-3 bg-gray-400 dark:text-white text-gray-800 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                  <span className="text-white">Previous</span>
              </button>
              <button
                type="submit"
                disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                      <span>Saving Recipe...</span>
                  </>
                ) : (
                  <>
                      <span className="text-white">Save Recipe</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export default AddRecipePage;
