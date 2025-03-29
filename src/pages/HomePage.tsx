import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const HomePage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleCreateRecipe = () => {
    navigate('/add-recipe');
  };
  
  useEffect(() => {
    setVisible(true);
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach((el) => observer.observe(el));
    
    return () => {
      animateElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className={`transition-opacity duration-700 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <div 
        ref={heroRef}
        className="mx-auto mb-12 text-center"
      >
        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 py-1 leading-relaxed">
          Discover Amazing Recipes
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-blue-400 dark:text-white mb-8">
          Your journey to culinary excellence begins here. Explore, create, and share your favorite recipes with our growing community.
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/recipes" 
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white dark:text-white dark:hover:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Browse Recipes
          </Link>
          <button 
            onClick={handleCreateRecipe} 
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow border border-blue-200 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Create Recipe
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div 
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700"
      >
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Discover Recipes</h3>
          <p className="text-gray-600">Find recipes from around the world, filtered by cuisine, ingredients, or dietary preferences.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Create & Share</h3>
          <p className="text-gray-600">Add your own recipes with our easy-to-use form and share them with friends and family.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900">Save Favorites</h3>
          <p className="text-gray-600">Bookmark your favorite recipes for quick access and organize them into collections.</p>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-8 rounded-xl animate-on-scroll opacity-0 transform translate-y-8 transition-all duration-700">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start your culinary journey?</h2>
          <p className="mb-6 max-w-2xl mx-auto">Join our community of food enthusiasts and share your passion for cooking.</p>
          <button 
            onClick={handleCreateRecipe} 
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Create Your First Recipe
          </button>
        </div>
      </div>
      
      <style>
        {`
          .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;
