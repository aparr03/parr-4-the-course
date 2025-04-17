/**
 * API client for communicating with the backend API
 */

// Base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Helper to handle response errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    // Try to parse the error json
    try {
      const errorData = await response.json();
      throw new Error(errorData.error || `API error: ${response.status}`);
    } catch (e) {
      // If json parsing fails, use the status text
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }
  
  // Check if response is empty
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// Get authentication token from local storage
const getAuthToken = () => {
  // This should match how you're storing the auth token with Supabase
  const supabaseAuth = localStorage.getItem('supabase.auth.token');
  if (supabaseAuth) {
    try {
      const parsedAuth = JSON.parse(supabaseAuth);
      return parsedAuth?.currentSession?.access_token;
    } catch (e) {
      console.error('Error parsing auth token', e);
      return null;
    }
  }
  return null;
};

// Basic fetch wrapper with authentication and error handling
const fetchWithAuth = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return handleResponse(response);
};

// Define the API client
export const apiClient = {
  // Recipe endpoints
  recipes: {
    getAll: () => fetchWithAuth('/api/recipes'),
    getById: (id: string) => fetchWithAuth(`/api/recipes/${id}`),
    create: (data: any) => fetchWithAuth('/api/recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => fetchWithAuth(`/api/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => fetchWithAuth(`/api/recipes/${id}`, {
      method: 'DELETE',
    }),
  },
  
  // Auth endpoints
  auth: {
    getCurrentUser: () => fetchWithAuth('/api/auth/me'),
    login: (email: string, password: string) => fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
    logout: () => fetchWithAuth('/api/auth/logout', {
      method: 'POST',
    }),
    register: (userData: any) => fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    resetPassword: (email: string) => fetchWithAuth('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),
  },
  
  // Bookmark endpoints
  bookmarks: {
    getAll: () => fetchWithAuth('/api/bookmarks'),
    toggle: (recipeId: string) => fetchWithAuth('/api/bookmarks/toggle', {
      method: 'POST',
      body: JSON.stringify({ recipeId }),
    }),
  },
  
  // Profile endpoints
  profiles: {
    get: (userId: string) => fetchWithAuth(`/api/profiles/${userId}`),
    update: (userId: string, data: any) => fetchWithAuth(`/api/profiles/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    uploadAvatar: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = getAuthToken();
      
      const response = await fetch(`${API_BASE_URL}/api/profiles/avatar`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });
      
      return handleResponse(response);
    },
  },
}; 