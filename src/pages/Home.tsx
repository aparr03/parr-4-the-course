import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* ...existing code... */}
      
      {/* Update the Create Recipe button to navigate to the AddRecipe page */}
      <div className="text-center mt-8">
        <Link
          to="/add-recipe"
          className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Create Recipe
        </Link>
      </div>
      
      {/* ...existing code... */}
    </div>
  );
};

export default Home;
