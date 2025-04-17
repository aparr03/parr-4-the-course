// Mock Supabase client for testing
export interface MockUser {
  id: string;
  email: string;
  username: string;
}

export interface MockSession {
  access_token: string;
  refresh_token: string;
  user: MockUser;
}

export interface MockComment {
  id: string;
  content: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export const mockUser: MockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser'
};

export const mockSession: MockSession = {
  access_token: 'test-token',
  refresh_token: 'test-refresh-token',
  user: mockUser
};

// Mock data for recipes and comments
export const mockComments: MockComment[] = [
  {
    id: 'comment-1',
    content: 'Great recipe!',
    profiles: {
      username: 'testuser',
      avatar_url: '/test-avatar.png'
    }
  }
];

// Create a factory function to get a fresh mock for each test
export const createSupabaseMock = (customConfig = {}) => {
  const defaultMock = {
    auth: {
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
    },
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
  };

  // Custom config handling with proper type handling
  const customConfigAny = customConfig as any;
  
  // Deep merge the default mock with any custom configurations
  return {
    ...defaultMock,
    ...(customConfig || {}),
    // Ensure auth object is properly merged and exists
    auth: {
      ...defaultMock.auth,
      ...(customConfigAny?.auth || {})
    },
    // Ensure other objects are merged correctly
    from: customConfigAny.hasOwnProperty('from') ? customConfigAny.from : defaultMock.from,
    storage: {
      ...defaultMock.storage,
      ...(customConfigAny?.storage || {})
    },
    functions: {
      ...defaultMock.functions,
      ...(customConfigAny?.functions || {})
    }
  };
};

// Export a default instance for simple tests
export const supabase = createSupabaseMock(); 