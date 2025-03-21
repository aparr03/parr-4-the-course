import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';

const AddRecipePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { } = useAuth();
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing recipe data when in edit mode
  useEffect(() => {
    // Check if we're in edit mode (id parameter exists)
    if (id) {
      setIsEditMode(true);
      loadRecipeData(id);
    }
    
    setFormVisible(true);
  }, [id]);

  // Function to load recipe data when editing
  const loadRecipeData = async (recipeId: string) => {
    setLoading(true);
    try {
      const { data, error } = await recipeService.getRecipe(recipeId);
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setRecipe({
          title: data.title || '',
          ingredients: data.ingredients || '',
          instructions: data.instructions || '',
          time: data.time || '',
          servings: data.servings || '',
          imageUrl: data.imageUrl || ''
        });
        
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
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.match('image.*')) {
      setError('Please select an image file (png, jpg, jpeg)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setError('Image size should be less than 5MB');
      return;
    }
    
    setImageFile(file);
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let finalRecipe = { ...recipe };
      
      // If there's an image file, upload it first
      if (imageFile) {
        setUploadingImage(true);
        try {
          const { publicUrl } = await recipeService.uploadRecipeImage(imageFile);
          finalRecipe.imageUrl = publicUrl;
          console.log('Image uploaded successfully:', publicUrl);
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          setError('Failed to upload image. Please try again or use an image URL instead.');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }
      
      let result;
      
      // If we're in edit mode, update the existing recipe
      if (isEditMode && id) {
        console.log('Updating existing recipe:', id);
        result = await recipeService.updateRecipe(id, finalRecipe);
      } else {
        // Otherwise create a new recipe
        console.log('Creating new recipe');
        result = await recipeService.createRecipe(finalRecipe);
      }
      
      const { data, error } = result;
      
      if (error) {
        throw error;
      }
      
      console.log(`Recipe ${isEditMode ? 'updated' : 'saved'} successfully:`, data);
      
      // Navigate to recipes page after successful save
      navigate('/recipes');
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
      <div className={`bg-white rounded-xl shadow-lg p-6 sm:p-8 transition-opacity duration-500 ${formVisible ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
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
                <label htmlFor="imageUrl" className="block mb-2 font-medium text-gray-700">Recipe Image</label>
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
                            setImageFile(null);
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
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-600">Click to upload an image</span>
                      <span className="text-xs text-gray-500 mt-1">(PNG, JPG, JPEG up to 5MB)</span>
                    </button>
                  )}
                  
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-600">Or</span>
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
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{uploadingImage ? 'Uploading Image...' : (isEditMode ? 'Updating Recipe...' : 'Saving Recipe...')}</span>
                    </>
                  ) : (
                    <>
                      <span>{isEditMode ? 'Update Recipe' : 'Save Recipe'}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
