/// <reference types="jest" />

// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Add TextEncoder and TextDecoder for React Router DOM
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}

// Mock console.error before all tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    // Filter out act() warnings which can occur in tests
    if (args[0] && typeof args[0] === 'string' && args[0].includes('not wrapped in act')) {
      return;
    }
    originalError(...args);
  };
});

// Restore console.error after all tests
afterAll(() => {
  console.error = originalError;
});

// Create robust mocks for Supabase
const createAuthObject = () => ({
  getSession: jest.fn().mockResolvedValue({ 
    data: { session: null }, 
    error: null 
  }),
  getUser: jest.fn().mockResolvedValue({ 
    data: { user: null }, 
    error: null 
  }),
  signUp: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null
  }),
  signIn: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null
  }),
  signInWithPassword: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null
  }),
  signOut: jest.fn().mockResolvedValue({
    error: null
  }),
  onAuthStateChange: jest.fn().mockReturnValue({ 
    data: { subscription: { unsubscribe: jest.fn() } } 
  }),
  resetPasswordForEmail: jest.fn().mockResolvedValue({
    data: {},
    error: null
  }),
  updateUser: jest.fn().mockResolvedValue({
    data: { user: null },
    error: null
  }),
});

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => {
  const authMock = createAuthObject();

  const createClient = jest.fn(() => ({
    auth: authMock,
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
        })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: null, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'mock-url' } })),
        remove: jest.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
    rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: null, error: null }))
    }
  }));

  return { createClient };
});

// Ensure we mock the lib/supabase client as well to avoid direct imports
// This is critical because the actual path imported in components is '../lib/supabase'
jest.mock('./lib/supabase', () => {
  const authMock = createAuthObject();
  
  return {
    supabase: {
      auth: authMock,
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null
        }),
        single: jest.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        }),
        maybeSingle: jest.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        }),
        insert: jest.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          })
        }),
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          })
        }),
      }),
      storage: {
        from: jest.fn().mockReturnValue({
          upload: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          }),
          getPublicUrl: jest.fn().mockReturnValue({ 
            data: { publicUrl: 'mock-url' } 
          }),
          remove: jest.fn().mockResolvedValue({ 
            data: null, 
            error: null 
          }),
        }),
      },
      rpc: jest.fn().mockResolvedValue({ 
        data: null, 
        error: null 
      }),
      functions: {
        invoke: jest.fn().mockResolvedValue({ 
          data: null, 
          error: null 
        })
      }
    }
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }
  callback: IntersectionObserverCallback;
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Create a safe mock for window.location
const locationMock = {
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

// Save original properties to avoid TypeScript errors
const originalLocation = { ...window.location };

// Apply mock location by copying properties instead of replacing the entire object
Object.defineProperty(window, 'location', {
  configurable: true,
  get: () => ({
    ...originalLocation,
    ...locationMock,
  }),
}); 