/**
 * Mock data for use in development when Supabase connection is unavailable
 */

export const mockRecipes = [
  {
    id: '1',
    title: 'Classic Spaghetti Carbonara',
    description: 'A creamy Italian pasta dish with pancetta and cheese',
    instructions: '1. Cook pasta\n2. Fry pancetta\n3. Mix eggs and cheese\n4. Combine everything',
    cook_time_minutes: 15,
    prep_time_minutes: 10,
    servings: 4,
    image_url: 'https://example.com/images/carbonara.jpg',
    user_id: 'user123',
    created_at: '2023-01-15T12:00:00Z',
    updated_at: '2023-01-15T12:00:00Z'
  },
  {
    id: '2',
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken with vegetables',
    instructions: '1. Prepare vegetables\n2. Cook chicken\n3. Stir fry everything with sauce',
    cook_time_minutes: 12,
    prep_time_minutes: 15,
    servings: 3,
    image_url: 'https://example.com/images/stirfry.jpg',
    user_id: 'user123',
    created_at: '2023-02-10T14:30:00Z',
    updated_at: '2023-02-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'Avocado Toast',
    description: 'Simple and nutritious breakfast',
    instructions: '1. Toast bread\n2. Mash avocado\n3. Spread on toast\n4. Add toppings',
    cook_time_minutes: 5,
    prep_time_minutes: 5,
    servings: 1,
    image_url: 'https://example.com/images/avocado-toast.jpg',
    user_id: 'user456',
    created_at: '2023-03-05T08:15:00Z',
    updated_at: '2023-03-05T08:15:00Z'
  }
];

export const mockCategories = [
  { id: '1', name: 'Breakfast', created_at: '2023-01-01T00:00:00Z' },
  { id: '2', name: 'Lunch', created_at: '2023-01-01T00:00:00Z' },
  { id: '3', name: 'Dinner', created_at: '2023-01-01T00:00:00Z' },
  { id: '4', name: 'Dessert', created_at: '2023-01-01T00:00:00Z' },
  { id: '5', name: 'Vegetarian', created_at: '2023-01-01T00:00:00Z' },
  { id: '6', name: 'Quick & Easy', created_at: '2023-01-01T00:00:00Z' }
];

export const mockIngredients = [
  { id: '1', name: 'Pasta', created_at: '2023-01-01T00:00:00Z' },
  { id: '2', name: 'Eggs', created_at: '2023-01-01T00:00:00Z' },
  { id: '3', name: 'Cheese', created_at: '2023-01-01T00:00:00Z' },
  { id: '4', name: 'Chicken', created_at: '2023-01-01T00:00:00Z' },
  { id: '5', name: 'Bell Pepper', created_at: '2023-01-01T00:00:00Z' },
  { id: '6', name: 'Avocado', created_at: '2023-01-01T00:00:00Z' },
  { id: '7', name: 'Bread', created_at: '2023-01-01T00:00:00Z' }
];

// Mock user profile
export const mockUserProfile = {
  id: 'user123',
  username: 'cookmaster',
  full_name: 'Chef Johnson',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2022-12-01T10:00:00Z',
  updated_at: '2023-01-15T11:30:00Z'
};

// Add relationships between data
export const mockRecipeIngredients = [
  { 
    id: '1', 
    recipe_id: '1', 
    ingredient_id: '1', 
    quantity: '200', 
    unit: 'g', 
    created_at: '2023-01-15T12:00:00Z',
    updated_at: '2023-01-15T12:00:00Z'
  },
  { 
    id: '2', 
    recipe_id: '1', 
    ingredient_id: '2', 
    quantity: '2', 
    unit: 'large', 
    created_at: '2023-01-15T12:00:00Z',
    updated_at: '2023-01-15T12:00:00Z'
  },
  { 
    id: '3', 
    recipe_id: '1', 
    ingredient_id: '3', 
    quantity: '50', 
    unit: 'g', 
    created_at: '2023-01-15T12:00:00Z',
    updated_at: '2023-01-15T12:00:00Z'
  },
  { 
    id: '4', 
    recipe_id: '2', 
    ingredient_id: '4', 
    quantity: '300', 
    unit: 'g', 
    created_at: '2023-02-10T14:30:00Z',
    updated_at: '2023-02-10T14:30:00Z'
  },
  { 
    id: '5', 
    recipe_id: '2', 
    ingredient_id: '5', 
    quantity: '1', 
    unit: 'medium', 
    created_at: '2023-02-10T14:30:00Z',
    updated_at: '2023-02-10T14:30:00Z'
  },
  { 
    id: '6', 
    recipe_id: '3', 
    ingredient_id: '6', 
    quantity: '1', 
    unit: 'ripe', 
    created_at: '2023-03-05T08:15:00Z',
    updated_at: '2023-03-05T08:15:00Z'
  },
  { 
    id: '7', 
    recipe_id: '3', 
    ingredient_id: '7', 
    quantity: '2', 
    unit: 'slices', 
    created_at: '2023-03-05T08:15:00Z',
    updated_at: '2023-03-05T08:15:00Z'
  }
];

export const mockRecipeCategories = [
  { id: '1', recipe_id: '1', category_id: '3', created_at: '2023-01-15T12:00:00Z' },
  { id: '2', recipe_id: '2', category_id: '3', created_at: '2023-02-10T14:30:00Z' },
  { id: '3', recipe_id: '2', category_id: '6', created_at: '2023-02-10T14:30:00Z' },
  { id: '4', recipe_id: '3', category_id: '1', created_at: '2023-03-05T08:15:00Z' },
  { id: '5', recipe_id: '3', category_id: '5', created_at: '2023-03-05T08:15:00Z' }
];
