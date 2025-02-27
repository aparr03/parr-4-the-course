import { supabase } from './supabase';

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
   // Real Supabase data
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
  // Real Supabase data
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
