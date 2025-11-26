import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import type { Post } from '../../types';

const PostDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const response = await postAPI.getPostById(id);
        setPost(response.data.post);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!isAuthenticated || !id) {
      navigate('/login');
      return;
    }

    try {
      await postAPI.toggleLike(id);
      // Refresh post
      const response = await postAPI.getPostById(id);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !id || !commentText.trim()) {
      return;
    }

    setSubmitting(true);
    try {
      await postAPI.addComment(id, commentText, replyingTo || undefined);
      setCommentText('');
      setReplyingTo(null);
      const response = await postAPI.getPostById(id);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    
    try {
      await postAPI.deleteComment(id!, commentId);
      const response = await postAPI.getPostById(id!);
      setPost(response.data.post);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const canDeleteComment = (comment: any) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (post?.author._id === user._id) return true;
    const commentUser = typeof comment.user === 'object' ? comment.user : null;
    return commentUser?._id === user._id;
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postAPI.deletePost(id);
      navigate('/posts');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading post...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Post not found</div>
      </div>
    );
  }

  const isLiked = user && post.likes.includes(user._id);
  const isAuthor = user && post.author._id === user._id;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Link
          to="/posts"
          className="inline-flex items-center text-northeastern-red hover:underline mb-6"
        >
          ← Back to Posts
        </Link>

        {/* Post Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          {/* Author Info */}
          <div className="flex items-center justify-between mb-6">
            <Link to={`/profile/${post.author._id}`} className="flex items-center">
              <div className="w-12 h-12 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold mr-3">
                {post.author.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{post.author.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
            </Link>

            {isAuthor && (
              <div className="flex space-x-2">
                <Link
                  to={`/posts/${id}/edit`}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Post Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{post.title}</h1>

           {/* Post Images */}
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full rounded-lg mb-6 max-h-96 object-cover"
            />
          )}
          
          {post.images && post.images.length > 0 && (
            <div className="relative w-full h-96 bg-gray-100 rounded-lg mb-6 overflow-hidden">
              <img
                src={`http://localhost:5000${post.images[currentImageIndex]}`}
                alt={`${post.title} ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />
              {post.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex - 1 + post.images.length) % post.images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((currentImageIndex + 1) % post.images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {post.images.length}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Post Content */}
          <div className="text-gray-700 mb-6 whitespace-pre-wrap">{post.content}</div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Like Button */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                isLiked
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{isLiked ? '❤️' : '🤍'}</span>
              <span>{post.likes.length} likes</span>
            </button>
            <span className="text-gray-600">💬 {post.comments.length} comments</span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Comments ({post.comments.length})
          </h2>

          {/* Add Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleComment} className="mb-8">
              {replyingTo && (
                <div className="mb-2 text-sm text-gray-600">
                  Replying to comment... <button type="button" onClick={() => setReplyingTo(null)} className="text-northeastern-red hover:underline">Cancel</button>
                </div>
              )}
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? "Write a reply..." : "Write a comment..."}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-northeastern-red mb-2"
              />
              <button
                type="submit"
                disabled={submitting || !commentText.trim()}
                className="bg-northeastern-red text-white px-6 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {submitting ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-600 mb-2">Please login to comment</p>
              <Link
                to="/login"
                className="text-northeastern-red hover:underline font-semibold"
              >
                Login here
              </Link>
            </div>
          )}

          {/* Comments List */}
          {post.comments.length === 0 ? (
            <p className="text-gray-500 text-center">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {post.comments.filter(c => !c.parentCommentId).map((comment) => {
                const commentUser = typeof comment.user === 'object' ? comment.user : null;
                const replies = post.comments.filter(c => c.parentCommentId === comment._id);
                return (
                  <div key={comment._id}>
                    <div className="border-l-4 border-northeastern-red pl-4">
                      <div className="flex items-center mb-2">
                        {commentUser && (
                          <Link to={`/profile/${commentUser._id}`} className="flex items-center">
                            <div className="w-8 h-8 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold mr-2 text-sm">
                              {commentUser.name.charAt(0).toUpperCase()}
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{commentUser.name}</p>
                          </Link>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">{new Date(comment.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                      <div className="mt-2 flex gap-2">
                        {isAuthenticated && (
                          <button onClick={() => setReplyingTo(comment._id!)} className="text-xs text-northeastern-red hover:underline">
                            Reply
                          </button>
                        )}
                        {canDeleteComment(comment) && (
                          <button onClick={() => handleDeleteComment(comment._id!)} className="text-xs text-red-600 hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                     {replies.length > 0 && (
                      <div className="ml-8 mt-3 space-y-3">
                        {replies.map(reply => {
                          const replyUser = typeof reply.user === 'object' ? reply.user : null;
                          return (
                            <div key={reply._id} className="bg-gray-50 border-l-4 border-blue-400 pl-4 py-3 rounded-r">
                              <div className="flex items-center mb-2">
                                <span className="text-xs text-blue-600 font-semibold mr-2">↳ Reply</span>
                                {replyUser && (
                                  <Link to={`/profile/${replyUser._id}`} className="flex items-center">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2 text-xs">
                                      {replyUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <p className="font-semibold text-gray-800 text-xs">{replyUser.name}</p>
                                  </Link>
                                )}
                                <span className="text-xs text-gray-500 ml-auto">{new Date(reply.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-gray-700 text-sm ml-6">{reply.text}</p>
                              {canDeleteComment(reply) && (
                                <button onClick={() => handleDeleteComment(reply._id!)} className="text-xs text-red-600 hover:underline mt-2 ml-6">
                                  Delete
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;