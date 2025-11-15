import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

interface Post {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  likes: string[];
  comments: any[];
  tags: string[];
  createdAt: string;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizer: {
    _id: string;
    name: string;
  };
  attendees: string[];
  createdAt: string;
}

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postsRes, eventsRes] = await Promise.all([
          api.get('/posts?limit=3'),
          api.get('/events?limit=3'),
        ]);
        setRecentPosts(postsRes.data);
        setUpcomingEvents(eventsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-br from-northeastern-red via-northeastern-red-dark to-northeastern-black text-white py-16 sm:py-20 lg:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-48 h-48 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-48 h-48 sm:w-96 sm:h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-slide-up">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-tight px-4">
              Welcome to <br className="hidden sm:block"/>
              <span className="inline-block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-white">
                NortheasternConnect
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-2xl mx-auto font-medium leading-relaxed px-4">
              {isAuthenticated && user
                ? `Welcome back, ${user.name}! Ready to connect and collaborate?`
                : 'Connect with students, professors, and alumni at Northeastern University'}
            </p>
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 sm:pt-8 px-4">
                <Link
                  to="/register"
                  className="w-full sm:w-auto btn-primary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 text-center"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto btn-ghost text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 text-center"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16 shadow-neu">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[
              { label: 'Active Users', value: '10K+', icon: '👥' },
              { label: 'Posts Shared', value: '50K+', icon: '📝' },
              { label: 'Events Hosted', value: '500+', icon: '🎉' },
              { label: 'Connections Made', value: '100K+', icon: '🤝' },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-northeastern-gray-50 to-white border border-northeastern-gray-200 hover:shadow-neu transform hover:scale-105 transition-all duration-300 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl mb-2 sm:mb-3">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-black gradient-text mb-1 sm:mb-2">{stat.value}</div>
                <div className="text-xs sm:text-sm lg:text-base text-northeastern-gray-600 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 sm:w-16 sm:h-16 border-4 border-northeastern-red border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm sm:text-base text-northeastern-gray-600 font-semibold">Loading amazing content...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
            {/* Recent Posts */}
            <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-northeastern-gray-900">
                  Recent <span className="gradient-text">Posts</span>
                </h2>
                <Link
                  to="/posts"
                  className="text-northeastern-red hover:text-northeastern-red-dark font-bold flex items-center space-x-2 group text-sm sm:text-base"
                >
                  <span>View All</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              {recentPosts.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">📝</div>
                  <p className="text-sm sm:text-base text-northeastern-gray-500 font-semibold">No posts yet. Be the first to share!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {recentPosts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/posts/${post._id}`}
                      className="block glass-card rounded-2xl p-4 sm:p-6 card-hover group"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-northeastern-red to-northeastern-red-dark rounded-xl flex items-center justify-center text-white font-black text-base sm:text-lg flex-shrink-0">
                          {post.author.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-northeastern-gray-900 text-base sm:text-lg lg:text-xl mb-1 group-hover:text-northeastern-red transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-northeastern-gray-600 font-medium">
                            by {post.author.name} • {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-northeastern-gray-700 line-clamp-3 mb-4 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-northeastern-gray-500 font-semibold">
                        <span>❤️ {post.likes.length}</span>
                        <span>💬 {post.comments.length}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-northeastern-gray-900">
                  Upcoming <span className="gradient-text">Events</span>
                </h2>
                <Link
                  to="/events"
                  className="text-northeastern-red hover:text-northeastern-red-dark font-bold flex items-center space-x-2 group text-sm sm:text-base"
                >
                  <span>View All</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>

              {upcomingEvents.length === 0 ? (
                <div className="glass-card rounded-2xl p-8 sm:p-12 text-center">
                  <div className="text-4xl sm:text-6xl mb-4">🎉</div>
                  <p className="text-sm sm:text-base text-northeastern-gray-500 font-semibold">No upcoming events. Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="block glass-card rounded-2xl p-4 sm:p-6 card-hover group"
                    >
                      <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-northeastern-red to-northeastern-red-dark rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                          <span className="text-xs font-bold">
                            {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-xl sm:text-2xl font-black">
                            {new Date(event.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-northeastern-gray-900 text-base sm:text-lg lg:text-xl mb-1 group-hover:text-northeastern-red transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-northeastern-gray-600 font-medium mb-2">
                            📍 {event.location}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-northeastern-gray-700 line-clamp-2 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-northeastern-gray-500 font-semibold">
                        <span>👥 {event.attendees.length} attending</span>
                        <span className="truncate">by {event.organizer.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-northeastern-red via-northeastern-red-dark to-northeastern-black py-16 sm:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6 px-4">
              Ready to Join the Community?
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
              Create your account today and start connecting with thousands of Northeastern students and alumni.
            </p>
            <Link
              to="/register"
              className="inline-block bg-white text-northeastern-red px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Join Now - It's Free!
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;