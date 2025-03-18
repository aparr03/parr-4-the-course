import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, signInWithUsername, user } = useAuth();

  const [formVisible, setFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/');
    }
    setFormVisible(true);
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Basic form validation
    if (!formData.emailOrUsername.trim()) {
      setError('Please enter your email or username');
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      const { emailOrUsername, password } = formData;
      let result;
      
      // Check if input is email or username
      const isEmail = emailOrUsername.includes('@');
      
      if (isEmail) {
        // Login with email
        result = await signIn(emailOrUsername, password);
      } else {
        // Login with username
        result = await signInWithUsername(emailOrUsername, password);
      }
      
      if (result.error) {
        throw result.error;
      }

      // Redirect is handled by the useEffect when user state changes
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-4 mt-20 transition-opacity duration-500 ${formVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Welcome Back</h1>
        <p className="text-gray-600">Sign in to access your account</p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 transform transition-all duration-500 hover:shadow-xl">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            <p className="font-medium">{error}</p>
            {error.includes('Incorrect email or password') && (
              <p className="text-sm mt-1">
                Make sure you're using the correct credentials. If you've forgotten your password, use the "Forgot password" link.
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="emailOrUsername" className="block mb-2 font-medium text-gray-700">
              Email or Username
            </label>
            <input
              id="emailOrUsername"
              name="emailOrUsername"
              type="text"
              autoComplete="username"
              required
              value={formData.emailOrUsername}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="example@email.com or username"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label htmlFor="password" className="font-medium text-gray-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 flex items-center justify-center space-x-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in</span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 