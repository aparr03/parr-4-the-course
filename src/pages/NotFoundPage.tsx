import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NotFoundPage = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-16 px-4">
      <div className={`text-center transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-9xl font-extrabold text-blue-600 mb-4">404</h1>
        <div className="bg-blue-100 text-blue-600 px-4 py-2 text-sm rounded-md inline-block mb-8">
          Page Not Found
        </div>
        <p className="text-xl mb-4 text-gray-600 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link 
            to="/" 
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Return Home
          </Link>
          <Link 
            to="/recipes" 
            className="border border-blue-600 text-blue-600 py-3 px-8 rounded-lg hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
          >
            Browse Recipes
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-blue-200 rounded-full animate-ping" style={{animationDuration: '3s'}}></div>
      <div className="absolute bottom-1/4 right-1/3 w-5 h-5 bg-green-200 rounded-full animate-ping" style={{animationDuration: '2.5s'}}></div>
      <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-purple-200 rounded-full animate-ping" style={{animationDuration: '4s'}}></div>
    </div>
  )
}

export default NotFoundPage
