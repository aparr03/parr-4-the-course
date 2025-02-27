import { supabase, usingMockData } from './supabase';
import * as mockData from './mockData';

/**
 * Data service to handle getting data from either Supabase or mock data
 * depending on the usingMockData flag
 */

// Types for function parameters
interface GetRecipesParams {
  limit?: number;
  offset?: number;
  search?: string;
}

// Get recipes (either from Supabase or mock data)
export async function getRecipes({ limit = 10, offset = 0, search = '' }: GetRecipesParams) {
  if (usingMockData) {
    // Filter by search term if provided
    let filteredRecipes = mockData.mockRecipes;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRecipes = filteredRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchLower) || 
        recipe.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Simulate pagination
    const paginatedRecipes = filteredRecipes.slice(offset, offset + limit);
    
    return {
      data: paginatedRecipes,
      count: filteredRecipes.length,
      error: null
    };
  }
  
  // Use real Supabase data
  try {
    let query = supabase
      .from('recipes')
      .select('*', { count: 'exact' });
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { data, count, error };
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return { data: null, count: 0, error };
  }
}

// Get a single recipe with its ingredients and categories
export async function getRecipe(id: string | number) {
  if (usingMockData) {
    const recipe = mockData.mockRecipes.find(r => r.id === id);
    if (!recipe) {
      return { data: null, error: { message: 'Recipe not found' } };
    }
    
    // Get recipe ingredients
    const recipeIngredients = mockData.mockRecipeIngredients.filter(ri => ri.recipe_id === id);
    const ingredientsWithDetails = recipeIngredients.map(ri => {
      const ingredient = mockData.mockIngredients.find(i => i.id === ri.ingredient_id);
      return {
        ...ri,
        ingredient_name: ingredient?.name
      };
    });
    
    // Get recipe categories
    const recipeCategories = mockData.mockRecipeCategories.filter(rc => rc.recipe_id === id);
    const categoriesWithDetails = recipeCategories.map(rc => {
      const category = mockData.mockCategories.find(c => c.id === rc.category_id);
      return {
        ...rc,
        category_name: category?.name
      };
    });
    
    return {
      data: {
        ...recipe,
        ingredients: ingredientsWithDetails,
        categories: categoriesWithDetails
      },
      error: null
    };
  }
  
  // Use real Supabase data
  try {
    // Get recipe details
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (recipeError) {
      return { data: null, error: recipeError };
    }
    
    // Get recipe ingredients
    const { data: ingredients, error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .select(`
        id, quantity, unit,
        ingredients (id, name)
      `)
      .eq('recipe_id', id);
    
    // Get recipe categories
    const { data: categories, error: categoriesError } = await supabase
      .from('recipe_categories')
      .select(`
        id,
        categories (id, name)
      `)
      .eq('recipe_id', id);
    
    if (ingredientsError || categoriesError) {
      console.error('Error fetching recipe details:', { ingredientsError, categoriesError });
    }
    
    return {
      data: {
        ...recipe,
        ingredients: ingredients || [],
        categories: categories || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return { data: null, error };
  }
}
