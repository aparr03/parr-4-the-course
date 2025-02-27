# Using Mock Data

This application supports a mock data mode for development purposes. This is useful when:

- You're working on the frontend without a Supabase connection
- You're developing offline
- You want to test with controlled data

## How to Enable/Disable Mock Data

Mock data is controlled by the `VITE_USE_MOCK_DATA` environment variable:

```
# In your .env file
VITE_USE_MOCK_DATA=true  # Enable mock data
VITE_USE_MOCK_DATA=false # Use real data from Supabase
```

## Available Mock Data

The mock data includes:

- Recipes
- Categories
- Ingredients
- Recipe-Ingredient relationships
- Recipe-Category relationships
- User profile

You can find and modify the mock data in `src/lib/mockData.ts`.

## Visual Indicator

When mock data is enabled, a yellow banner appears at the top of the application to remind you that you're working with mock data.

## Data Service

The application uses a data service (`src/lib/dataService.ts`) that automatically switches between mock data and real Supabase data based on the `VITE_USE_MOCK_DATA` environment variable.

When building data access functions, make sure to use the data service pattern to handle both mock and real data cases.
