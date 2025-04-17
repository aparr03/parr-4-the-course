import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  slug?: string;
  comments_count?: number;
}

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, className = '' }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate a slug from the title if one isn't provided
  const slug = recipe.slug || recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  useEffect(() => {
    fetchComments();
  }, [recipe.id]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('recipe_comments')
        .select(`
          id,
          content,
          profiles!recipe_comments_user_id_fkey (
            username,
            avatar_url
          )
        `)
        .eq('recipe_id', recipe.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setComments(data as unknown as Comment[] || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = `/recipes/${slug}#comments`;
  };

  return (
    <Link
      to={`/recipes/${slug}`}
      className={`block bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}
    >
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {recipe.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {recipe.description}
        </p>

        {/* Comments section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Comments ({recipe.comments_count || 0})
            </h4>
            <button
              onClick={handleCommentClick}
              className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-2">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-2">
                  <img
                    src={comment.profiles.avatar_url || '/default-avatar.png'}
                    alt={comment.profiles.username}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {comment.profiles.username}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
              No comments yet
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}; 