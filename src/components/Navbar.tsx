import { Link } from 'react-router-dom'
import { useState } from 'react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-primary text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">Parr-4-The-Course</Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            <Link to="/" className="hover:text-secondary">Home</Link>
            <Link to="/recipes" className="hover:text-secondary">Recipes</Link>
            <Link to="/recipes/add" className="hover:text-secondary">Add Recipe</Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-2">
            <Link to="/" className="block hover:text-secondary">Home</Link>
            <Link to="/recipes" className="block hover:text-secondary">Recipes</Link>
            <Link to="/recipes/add" className="block hover:text-secondary">Add Recipe</Link>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
