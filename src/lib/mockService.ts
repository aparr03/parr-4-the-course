import { Database } from '../types/supabase';

// Sample data for development/testing
const sampleRecipes: Database['public']['Tables']['recipes']['Row'][] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    title: 'Chocolate Chip Cookies',
    description: 'Classic chocolate chip cookies that are crispy on the outside and chewy on the inside.',
    ingredients: [
      '2 1/4 cups all-purpose flour',
      '1 tsp baking soda',
      '1 tsp salt',
      '1 cup unsalted butter, softened',
      '3/4 cup granulated sugar',
      '3/4 cup brown sugar',
      '2 large eggs',
      '2 tsp vanilla extract',
      '2 cups semi-sweet chocolate chips'
    ],
    instructions: 'Preheat oven to 375°F (190°C).\nWhisk together flour, baking soda, and salt in a bowl.\nIn a separate bowl, cream together butter and sugars until light and fluffy.\nAdd eggs one at a time, then stir in vanilla.\nGradually blend in the dry ingredients.\nStir in chocolate chips.\nDrop rounded tablespoons of dough onto ungreased baking sheets.\nBake for 9 to 11 minutes or until golden brown.\nLet stand for 2 minutes before removing to cool on wire racks.',
    cooking_time: 20,
    servings: 24,
    image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    user_id: 'anonymous',
    category: 'Dessert',
    tags: ['cookies', 'chocolate', 'baking']
  },
  {
    id: '2',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    title: 'Spaghetti Carbonara',
    description: 'A classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
    ingredients: [
      '1 pound spaghetti',
      '3 1/2 oz pancetta or bacon, diced',
      '2 cloves garlic, minced',
      '2 large eggs',
      '1 cup freshly grated Parmesan cheese',
      '1 tsp black pepper',
      'Salt to taste'
    ],
    instructions: 'Bring a large pot of salted water to boil and cook spaghetti according to package directions.\nWhile pasta is cooking, cook pancetta in a large skillet over medium heat until crispy, about 5 minutes.\nAdd garlic and cook for another minute.\nIn a bowl, whisk together eggs, Parmesan, and black pepper.\nDrain pasta, reserving 1/2 cup of pasta water.\nImmediately add hot pasta to the skillet with pancetta, tossing to coat.\nRemove from heat and quickly add egg mixture, tossing constantly with tongs until creamy sauce forms. If needed, add reserved pasta water to thin the sauce.\nSeason with salt to taste and serve immediately with additional Parmesan.',
    cooking_time: 25,
    servings: 4,
    image_url: 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    user_id: 'anonymous',
    category: 'Main Course',
    tags: ['pasta', 'italian', 'quick']
  },
  {
    id: '3',
    created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    title: 'Classic Caesar Salad',
    description: 'A refreshing salad with romaine lettuce, croutons, and a creamy dressing.',
    ingredients: [
      '1 large head romaine lettuce',
      '1 cup croutons',
      '1/2 cup Parmesan cheese, grated',
      '2 cloves garlic, minced',
      '1 tsp Dijon mustard',
      '1 tsp Worcestershire sauce',
      '1 tbsp lemon juice',
      '1/3 cup olive oil',
      '1 egg yolk (optional)',
      'Salt and black pepper to taste'
    ],
    instructions: 'Wash and dry romaine lettuce, then tear into bite-sized pieces.\nIn a small bowl, whisk together garlic, mustard, Worcestershire sauce, lemon juice, and egg yolk if using.\nSlowly drizzle in olive oil while whisking to create an emulsion.\nSeason dressing with salt and pepper.\nIn a large bowl, toss lettuce with enough dressing to coat.\nAdd croutons and toss again.\nSprinkle with Parmesan cheese and additional black pepper before serving.',
    cooking_time: 15,
    servings: 4,
    image_url: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
    user_id: 'anonymous',
    category: 'Salad',
    tags: ['salad', 'starter', 'healthy']
  }
];

// Mock service that mimics Supabase API for development
export const mockSupabase = {
  from: (table: string) => {
    if (table === 'recipes') {
      return {
        select: (columns: string = '*') => {
          return {
            order: (column: string, { ascending }: { ascending: boolean }) => {
              const sortedData = [...sampleRecipes].sort((a, b) => {
                if (column === 'created_at') {
                  return ascending 
                    ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                }
                if (column === 'title') {
                  return ascending 
                    ? a.title.localeCompare(b.title)
                    : b.title.localeCompare(a.title);
                }
                return 0;
              });
              return {
                limit: (num: number) => {
                  return {
                    then: (callback: Function) => {
                      setTimeout(() => {
                        callback({ data: sortedData.slice(0, num), error: null });
                      }, 500); // Simulate network delay
                    }
                  };
                },
                eq: (field: string, value: any) => {
                  const filteredData = sortedData.filter(item => (item as any)[field] === value);
                  return {
                    single: () => {
                      return {
                        then: (callback: Function) => {
                          setTimeout(() => {
                            callback({ data: filteredData[0] || null, error: null });
                          }, 500);
                        }
                      };
                    }
                  };
                },
                then: (callback: Function) => {
                  setTimeout(() => {
                    callback({ data: sortedData, error: null });
                  }, 500);
                }
              };
            }
          };
        },
        insert: (data: any) => {
          return {
            select: () => {
              return {
                then: (callback: Function) => {
                  const newId = (Math.max(...sampleRecipes.map(r => parseInt(r.id))) + 1).toString();
                  const newItem = { ...data[0], id: newId, created_at: new Date().toISOString() };
                  sampleRecipes.push(newItem as any);
                  setTimeout(() => {
                    callback({ data: [newItem], error: null });
                  }, 500);
                }
              };
            }
          };
        },
        update: (data: any) => {
          return {
            eq: (field: string, value: any) => {
              return {
                then: (callback: Function) => {
                  const index = sampleRecipes.findIndex(item => (item as any)[field] === value);
                  if (index >= 0) {
                    sampleRecipes[index] = { ...sampleRecipes[index], ...data };
                  }
                  setTimeout(() => {
                    callback({ data: index >= 0 ? sampleRecipes[index] : null, error: null });
                  }, 500);
                }
              };
            }
          };
        },
        delete: () => {
          return {
            eq: (field: string, value: any) => {
              return {
                then: (callback: Function) => {
                  const index = sampleRecipes.findIndex(item => (item as any)[field] === value);
                  let deletedItem = null;
                  if (index >= 0) {
                    deletedItem = sampleRecipes[index];
                    sampleRecipes.splice(index, 1);
                  }
                  setTimeout(() => {
                    callback({ data: deletedItem, error: null });
                  }, 500);
                }
              };
            }
          };
        }
      };
    }
    return {
      select: () => ({
        then: (callback: Function) => callback({ data: [], error: null })
      })
    };
  }
};

// Add this to properly type the mock service:
export type MockSupabase = typeof mockSupabase;
