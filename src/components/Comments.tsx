import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Heart } from 'lucide-react';

interface CommentData {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  user_id: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_liked: boolean;
  user: {
    username: string;
    avatar_url: string;
  };
}

interface CommentsProps {
  recipeId: string;
}

export const Comments: React.FC<CommentsProps> = ({ recipeId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      // First, fetch the comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('recipe_comments')
        .select('*')
        .eq('recipe_id', recipeId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // If user is logged in, fetch their likes
      let likedCommentIds = new Set<string>();
      if (user) {
        const { data: likesData } = await supabase
          .from('recipe_comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);

        likedCommentIds = new Set(likesData?.map(like => like.comment_id) || []);
      }

      // Fetch user profiles for all comments
      const userIds = [...new Set((commentsData as CommentData[]).map(comment => comment.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      // Fetch like counts for each comment
      const commentIds = (commentsData as CommentData[]).map(comment => comment.id);
      const { data: likesData } = await supabase
        .from('recipe_comment_likes')
        .select('comment_id')
        .in('comment_id', commentIds);

      // Create a map of comment_id -> like count
      const likesCountMap = new Map<string, number>();
      if (likesData) {
        likesData.forEach(like => {
          const count = likesCountMap.get(like.comment_id) || 0;
          likesCountMap.set(like.comment_id, count + 1);
        });
      }
      
      const profilesMap = new Map(profilesData?.map(profile => [profile.id, profile]) || []);

      // Format comments with user data and accurate like counts
      const formattedComments = (commentsData as CommentData[]).map(comment => {
        const profile = profilesMap.get(comment.user_id);
        // Use the count from our map or fall back to the likes_count in the comment
        const likeCount = likesCountMap.get(comment.id) || comment.likes_count || 0;
        
        return {
          id: comment.id,
          content: comment.content,
          created_at: comment.created_at,
          likes_count: likeCount,
          user: profile || { username: 'Unknown', avatar_url: '/default-avatar.png' },
          is_liked: likedCommentIds.has(comment.id)
        };
      });

      setComments(formattedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      // Insert the comment
      const { data: commentData, error: commentError } = await supabase
        .from('recipe_comments')
        .insert([
          {
            recipe_id: recipeId,
            user_id: user.id,
            content: newComment.trim()
          }
        ])
        .select()
        .single();

      if (commentError) throw commentError;

      // Fetch the user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single();

      const formattedComment: Comment = {
        id: commentData.id,
        content: commentData.content,
        created_at: commentData.created_at,
        likes_count: commentData.likes_count,
        user: profileData || { username: 'Unknown', avatar_url: '/default-avatar.png' },
        is_liked: false
      };

      setComments([...comments, formattedComment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      // Prompt user to log in
      const confirmed = window.confirm('Please log in to like comments. Would you like to go to the login page?');
      if (confirmed) {
        window.location.href = '/login';
      }
      return;
    }

    try {
      const commentIndex = comments.findIndex(c => c.id === commentId);
      if (commentIndex === -1) return;
      
      const comment = comments[commentIndex];
      const newComments = [...comments];
      
      if (comment.is_liked) {
        // Unlike
        const { error } = await supabase
          .from('recipe_comment_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);

        if (error) throw error;

        // Update local state
        newComments[commentIndex] = {
          ...comment,
          is_liked: false,
          likes_count: Math.max(0, comment.likes_count - 1)
        };
        setComments(newComments);
      } else {
        // Like
        const { error } = await supabase
          .from('recipe_comment_likes')
          .insert([{ user_id: user.id, comment_id: commentId }]);

        if (error) throw error;

        // Update local state
        newComments[commentIndex] = {
          ...comment,
          is_liked: true,
          likes_count: comment.likes_count + 1
        };
        setComments(newComments);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error);
      // If there was an error, refresh comments to get the correct state
      fetchComments();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex space-x-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6" id="comments">
      <h3 className="text-2xl font-semibold dark:text-white">Comments</h3>

      {user && (
        <div className="space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <img
              src={comment.user.avatar_url || '/default-avatar.png'}
              alt={comment.user.username}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">{comment.user.username}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {comment.content}
              </p>
              <button
                onClick={() => handleLikeComment(comment.id)}
                className={`mt-2 flex items-center space-x-1 text-sm ${
                  comment.is_liked
                    ? 'text-red-500'
                    : 'text-gray-500 dark:text-gray-400 hover:text-red-500'
                }`}
                aria-label={comment.is_liked ? "Unlike this comment" : "Like this comment"}
              >
                <Heart 
                  className="w-4 h-4 transition-colors" 
                  fill={comment.is_liked ? "currentColor" : "none"} 
                  stroke="currentColor"
                />
                <span className="font-medium">{comment.likes_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 