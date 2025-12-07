import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { chatAPI } from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      const loadUnread = async () => {
        try {
          const res = await chatAPI.getConversations();
          const total = res.data.conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);
          setUnreadCount(total);
        } catch (error) {
          console.error('Load unread error:', error);
        }
      };
      loadUnread();
      const interval = setInterval(loadUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  if (loading) {
    return (
      <nav className="bg-gradient-to-r from-northeastern-red via-northeastern-red-dark to-northeastern-black text-white shadow-neu backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-2xl lg:text-3xl font-black text-northeastern-red" style={{ fontFamily: 'Georgia, serif' }}>N</span>
              </div>
              <span className="text-lg lg:text-2xl font-black tracking-tight">
                NexusNU
              </span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gradient-to-r from-northeastern-red via-northeastern-red-dark to-northeastern-black text-white shadow-neu backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link to="/" className="flex items-center space-x-2 lg:space-x-3 group z-50">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
              <span className="text-2xl lg:text-3xl font-black text-northeastern-red" style={{ fontFamily: 'Georgia, serif' }}>N</span>
            </div>
            <span className="text-lg lg:text-2xl font-black tracking-tight group-hover:text-gray-100 transition-colors hidden sm:block">
              NexusNU
            </span>
            <span className="text-lg lg:text-2xl font-black tracking-tight group-hover:text-gray-100 transition-colors sm:hidden">
              NEU
            </span>
          </Link>

          <div className="hidden lg:flex items-center space-x-8">
            <Link
              to="/"
              className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
            >
              Home
            </Link>
            <Link
              to="/posts"
              className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
            >
              Posts
            </Link>
            <Link
              to="/events"
              className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
            >
              Events
            </Link>
            <Link
              to="/users"
              className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
            >
              Community
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/jobs"
                  className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
                >
                  Jobs
                </Link>
                <Link 
                  to="/chat" 
                  className="relative text-base font-semibold hover:text-gray-200 transition-colors after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
                >
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 w-5 h-5 bg-white text-northeastern-red rounded-full flex items-center justify-center text-xs font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-base font-semibold hover:text-gray-200 transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-white after:transition-all after:duration-300"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={`/profile/${user._id}`}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-northeastern-red">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span className="font-semibold">{user.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white text-northeastern-red px-5 py-2.5 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-base font-semibold hover:text-gray-200 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-northeastern-red px-6 py-2.5 rounded-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden z-50 p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${
                  mobileMenuOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block h-0.5 w-full bg-white transition-all duration-300 ${
                  mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          style={{ top: '64px' }}
          onClick={closeMobileMenu}
        />
      )}

      <div
        className={`lg:hidden fixed left-0 right-0 bg-northeastern-black/95 backdrop-blur-lg transition-all duration-300 z-50 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
        style={{ top: '64px' }}
      >
        <div className="container mx-auto px-4 py-8 bg-northeastern-red/100">
          <div className="flex flex-col space-y-4">
            <Link
              to="/"
              onClick={closeMobileMenu}
              className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
            >
              Home
            </Link>

            {isAuthenticated && user ? (
              <>
                <Link
                  to="/posts"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Posts
                </Link>
                <Link
                  to="/events"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Events
                </Link>
                <Link
                  to="/jobs"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Jobs
                </Link>
                <Link
                  to="/users"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Community
                </Link>
                <Link
                  to="/chat"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-between"
                >
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span className="w-6 h-6 bg-white text-northeastern-red rounded-full flex items-center justify-center text-sm font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to={`/profile/${user._id}`}
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-northeastern-red">
                      {user.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                  <span>Profile ({user.name})</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left bg-white text-northeastern-red text-xl font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="text-white text-xl font-semibold py-3 px-4 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="bg-white text-northeastern-red text-xl font-bold py-3 px-4 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;