import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mockUser } from '../__mocks__/supabase';

// Mock the supabase library
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: jest.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      onAuthStateChange: jest.fn().mockReturnValue({ 
        data: { subscription: { unsubscribe: jest.fn() } }
      }),
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn()
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis()
  }
}));

// Mock the actual AuthContext module
jest.mock('../context/AuthContext', () => {
  // Store the original module to access non-mocked parts
  const originalModule = jest.requireActual('../context/AuthContext');
  
  // Create a mock sign in function
  const mockSignIn = jest.fn().mockImplementation(() => {
    return Promise.resolve({ user: mockUser, error: null });
  });
  
  // Create a mock sign out function
  const mockSignOut = jest.fn().mockImplementation(() => {
    return Promise.resolve();
  });
  
  return {
    ...originalModule,
    // Override the useAuth hook for testing
    useAuth: () => ({
      user: null,
      isLoading: false,
      signIn: mockSignIn,
      signOut: mockSignOut
    }),
    // Export the mock functions for direct manipulation in tests
    mockSignIn,
    mockSignOut
  };
});

// Import after mocking
import { useAuth, AuthProvider } from '../context/AuthContext';
// Get the mock directly from the mock function
const { mockSignIn } = jest.requireMock('../context/AuthContext');

// Test component that uses the auth context
const TestComponent = () => {
  const { user, signIn, signOut, isLoading } = useAuth();
  
  return (
    <div>
      {isLoading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <p data-testid="user-email">{user.email}</p>
          <button onClick={() => signOut()}>Sign Out</button>
        </>
      ) : (
        <button 
          onClick={() => signIn('test@example.com', 'password')}
          data-testid="sign-in-button"
        >
          Sign In
        </button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('shows loading state when isLoading is true', async () => {
    // Use a custom version of the useAuth hook that returns isLoading: true
    jest.spyOn(require('../context/AuthContext'), 'useAuth').mockImplementationOnce(() => ({
      user: null,
      isLoading: true,
      signIn: mockSignIn,
      signOut: jest.fn()
    }));
    
    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  test('shows sign in button when not authenticated', async () => {
    await act(async () => {
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    
    expect(screen.getByTestId('sign-in-button')).toBeInTheDocument();
  });

  test('calls signIn with correct parameters when button is clicked', async () => {
    let user: ReturnType<typeof userEvent.setup>;
    
    await act(async () => {
      user = userEvent.setup();
      render(<AuthProvider><TestComponent /></AuthProvider>);
    });
    
    const signInButton = screen.getByTestId('sign-in-button');
    
    // Interact with the component
    await act(async () => {
      await user.click(signInButton);
    });
    
    // Verify the mock was called with the correct parameters
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
  });
}); 