import React from 'react';
import { render, RenderOptions, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

// Setup global Supabase mock to avoid dependency issues
beforeAll(() => {
  // If we haven't explicitly mocked supabase elsewhere, set up a default mock
  if (!jest.isMockFunction(require('../../lib/supabase').supabase.auth?.getSession)) {
    jest.mock('../../lib/supabase', () => ({
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
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      }
    }));
  }
});

// Helper function to wait for React state updates
export const waitForStateUpdate = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

// Custom wrapper with common providers
interface AllProvidersProps {
  children: React.ReactNode;
}

// Providers without Auth - useful for components that don't need auth
export const BasicProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Full providers with Auth
export const AllProviders: React.FC<AllProvidersProps> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );
};

// Custom render with providers
export const renderWithProviders = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { withAuth?: boolean }
) => {
  const WithAuth = options?.withAuth !== false;
  const Wrapper = WithAuth ? AllProviders : BasicProviders;
  
  // Remove our custom withAuth option before passing to render
  const { withAuth, ...renderOptions } = options || {};
  
  return render(ui, { 
    wrapper: Wrapper, 
    ...renderOptions 
  });
};

// Mock for window.location (call in test setup)
export const mockWindowLocation = () => {
  const originalLocation = window.location;
  const mockLocation = {
    assign: jest.fn(),
    href: '',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
    replace: jest.fn(),
    reload: jest.fn(),
    toString: jest.fn().mockReturnValue('http://localhost:3000'),
  };
  
  // Save and mock
  beforeAll(() => {
    // @ts-ignore - intentionally modifying read-only property for testing
    delete window.location;
    // @ts-ignore - intentionally modifying read-only property for testing
    window.location = mockLocation;
  });
  
  // Restore after tests
  afterAll(() => {
    // @ts-ignore - restoring original
    window.location = originalLocation;
  });
  
  return mockLocation;
}; 