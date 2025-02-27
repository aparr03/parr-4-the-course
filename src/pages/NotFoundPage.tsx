import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl mb-8">Page not found</p>
      <p className="mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link 
        to="/" 
        className="bg-secondary text-white py-2 px-4 rounded hover:bg-opacity-80 transition-all"
      >
        Return to Home
      </Link>
    </div>
  )
}

export default NotFoundPage
