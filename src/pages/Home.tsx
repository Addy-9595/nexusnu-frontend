import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, eventAPI } from '../services/api';
import type { Post, Event } from '../types';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, eventsRes] = await Promise.all([
          postAPI.getAllPosts(),
          eventAPI.getAllEvents(),
        ]);

        setRecentPosts(postsRes.data.posts.slice(0, 5));
        setUpcomingEvents(eventsRes.data.events.slice(0, 5));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div className="bg-northeastern-red text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to NortheasternConnect
          </h1>
          <p className="text-xl mb-8">
            {isAuthenticated
              ? `Welcome back, ${user?.name}!`
              : 'Connect with students, professors, and alumni at Northeastern University'}
          </p>
          {!isAuthenticated && (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-white text-northeastern-red px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-northeastern-red transition inline-block"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Recent Posts */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Recent Posts</h2>
              <Link
                to="/posts"
                className="text-northeastern-red hover:underline text-sm font-semibold"
              >
                View All
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <p className="text-gray-500">No posts yet. Be the first to post!</p>
            ) : (
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Link
                    key={post._id}
                    to={`/posts/${post._id}`}
                    className="block p-4 border border-gray-200 rounded hover:border-northeastern-red transition"
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium">{post.author.name}</span>
                      <span className="mx-2">•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{post.likes.length} likes</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Upcoming Events</h2>
              <Link
                to="/events"
                className="text-northeastern-red hover:underline text-sm font-semibold"
              >
                View All
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500">No upcoming events.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    className="block p-4 border border-gray-200 rounded hover:border-northeastern-red transition"
                  >
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>📍 {event.location}</span>
                      <span className="mx-2">•</span>
                      <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <span>{event.participants.length} participants</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        {!isAuthenticated && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              What You Can Do
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-xl font-bold mb-2">Share Posts</h3>
                <p className="text-gray-600">
                  Share your thoughts, projects, and academic achievements with the community
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold mb-2">Join Events</h3>
                <p className="text-gray-600">
                  Discover and participate in events, workshops, and study groups
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold mb-2">Connect</h3>
                <p className="text-gray-600">
                  Follow students and professors, build your academic network
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;