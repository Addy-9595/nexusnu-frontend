import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { postAPI } from '../../services/api';
import type { Post } from '../../types';

const PostsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [, setPosts] = useState<Post[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const selectedTag = searchParams.get('tag');
  const [loading, setLoading] = useState(true);
  const [imageIndexes, setImageIndexes] = useState<{[key: string]: number}>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await postAPI.getAllPosts();
        console.log('📥 Fetched posts:', response.data.posts);
        console.log('🖼️ First post images:', response.data.posts[0]?.images);
        setPosts(response.data.posts);
        if (selectedTag) {
          const filtered = response.data.posts.filter((post: Post) =>
            post.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
          );
          setFilteredPosts(filtered);
        } else {
          setFilteredPosts(response.data.posts);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    window.scrollTo(0, 0);
  }, [selectedTag]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await postAPI.toggleLike(postId);
      const response = await postAPI.getAllPosts();
      setPosts(response.data.posts);
      // Update filtered posts too
      if (selectedTag) {
        const filtered = response.data.posts.filter((post: Post) =>
          post.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
        );
        setFilteredPosts(filtered);
      } else {
        setFilteredPosts(response.data.posts);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {selectedTag ? (
                <>
                  Posts tagged with <span className="text-northeastern-red">#{selectedTag}</span>
                </>
              ) : (
                'All Posts'
              )}
            </h1>
            {selectedTag && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-600 hover:text-northeastern-red transition mt-2"
              >
                ✕ Clear filter
              </button>
            )}
          </div>
          {isAuthenticated && (
            <Link
              to="/posts/create"
              className="bg-northeastern-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Create Post
            </Link>
          )}
        </div>

        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 mb-4">
              {selectedTag ? `No posts found with tag #${selectedTag}` : 'No posts yet. Be the first to post!'}
            </p>
            {isAuthenticated && !selectedTag && (
              <Link
                to="/posts/create"
                className="inline-block bg-northeastern-red text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <div key={post._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {post.author ? (
                      <Link to={`/profile/${post.author._id}`} className="flex items-center">
                        <div className="w-10 h-10 bg-northeastern-red rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {post.author.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{post.author.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          ?
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Unknown User</p>
                          <p className="text-xs text-gray-500">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Link to={`/posts/${post._id}`}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 hover:text-northeastern-red transition">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                  </Link>

                  {post.images && post.images.length > 0 && (
                    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4">
                      <img
                        src={post.images[imageIndexes[post._id] || 0]}
                        alt={post.title}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                      {post.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const len = post.images?.length || 0;
                              setImageIndexes(prev => ({
                                ...prev,
                                [post._id]: ((prev[post._id] || 0) - 1 + len) % len
                              }));
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
                          >
                            ‹
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const len = post.images?.length || 0;
                              setImageIndexes(prev => ({
                                ...prev,
                                [post._id]: ((prev[post._id] || 0) + 1) % len
                              }));
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition"
                          >
                            ›
                          </button>
                          <span className="absolute bottom-2 right-2 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {(imageIndexes[post._id] || 0) + 1} / {post.images?.length || 0}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <Link
                          key={index}
                          to={`/posts?tag=${encodeURIComponent(tag)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-northeastern-red hover:text-white transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <button
                      onClick={(e) => handleLike(e, post._id)}
                      className={`flex items-center hover:text-northeastern-red transition ${
                        user && post.likes.includes(user._id) ? 'text-red-600' : ''
                      }`}
                    >
                      {user && post.likes.includes(user._id) ? '❤️' : '🤍'} {post.likes.length} likes
                    </button>
                    <Link to={`/posts/${post._id}`} className="flex items-center hover:text-northeastern-red transition">
                      💬 {post.comments.length} comments
                    </Link>
                    <Link
                      to={`/posts/${post._id}`}
                      className="text-northeastern-red hover:underline font-semibold"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsPage;