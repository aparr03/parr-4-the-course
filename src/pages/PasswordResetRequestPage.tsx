import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PasswordResetRequestPage = () => {
  const { resetPasswordForEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageVisible, setPageVisible] = useState(false);

  useEffect(() => {
    setPageVisible(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await resetPasswordForEmail(email);
      
      if (error) {
        throw error;
      }
      
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-4 mt-20 transition-opacity duration-500 ${pageVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2 text-blue-600">Reset Your Password</h1>
        <p className="text-gray-600">Enter your email to receive a password reset link</p>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-8 transform transition-all duration-500 hover:shadow-xl">
        {emailSent ? (
          <div className="text-center">
            <div className="mx-auto mb-6 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-4">Check Your Email</h2>
            <p className="text-gray-600 mb-8">
              We've sent a password reset link to <span className="font-semibold">{email}</span>. 
              Please check your email and follow the instructions to reset your password.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              If you don't receive an email within a few minutes, please check your spam folder
              or try again.
            </p>
            <button 
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="text-blue-600 hover:underline mb-4 block mx-auto"
            >
              Try another email
            </button>
            <Link
              to="/login"
              className="text-gray-500 hover:text-gray-700"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform transition hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <div className="text-center mt-4">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordResetRequestPage; 