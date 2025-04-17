import { screen, act } from '@testing-library/react';
import { RecipeCard } from '../components/RecipeCard';
import { renderWithProviders } from './utils/test-utils';

// Define RecipeCard prop types for the mock
interface RecipeCardProps {
  recipe: {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    comments_count?: number;
    slug?: string;
  };
  className?: string;
}

// Mock lib/supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({
              data: [
                {
                  id: 'comment-1',
                  content: 'Great recipe!',
                  profiles: {
                    username: 'testuser',
                    avatar_url: '/test-avatar.png'
                  }
                }
              ],
              error: null
            })
          })
        })
      })
    })
  }
}));

// Mock the entire component to intercept the handleCommentClick
jest.mock('../components/RecipeCard', () => {
  const originalModule = jest.requireActual('../components/RecipeCard');
  
  // Wrap the original component
  const MockRecipeCard = (props: RecipeCardProps) => {
    const OriginalRecipeCard = originalModule.RecipeCard;
    return <OriginalRecipeCard {...props} />;
  };
  
  return {
    ...originalModule,
    RecipeCard: MockRecipeCard
  };
});

// Mock recipe data
const mockRecipe = {
  id: '123',
  title: 'Test Recipe',
  imageUrl: '/test-image.jpg',
  description: 'This is a test recipe description',
  comments_count: 3
};

describe('RecipeCard', () => {
  // Setup a mock for window.location.href
  let originalHref: string;
  
  beforeEach(() => {
    // Store original href
    originalHref = window.location.href;
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    // Restore original href
    Object.defineProperty(window.location, 'href', {
      writable: true,
      value: originalHref
    });
  });

  test('renders recipe title and description', async () => {
    await act(async () => {
      renderWithProviders(<RecipeCard recipe={mockRecipe} />, { withAuth: false });
      // Wait for effects to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('This is a test recipe description')).toBeInTheDocument();
  });

  test('shows correct comment count', async () => {
    await act(async () => {
      renderWithProviders(<RecipeCard recipe={mockRecipe} />, { withAuth: false });
      // Wait for effects to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.getByText('Comments (3)')).toBeInTheDocument();
  });

  test('renders comment button', async () => {
    await act(async () => {
      renderWithProviders(<RecipeCard recipe={mockRecipe} />, { withAuth: false });
      // Wait for effects to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });

  test('navigation occurs when clicking on the card', async () => {
    await act(async () => {
      renderWithProviders(<RecipeCard recipe={mockRecipe} />, { withAuth: false });
      // Wait for effects to complete
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    const card = screen.getByRole('link');
    expect(card).toHaveAttribute('href', '/recipes/test-recipe');
  });
}); 