import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-northeastern-red text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold hover:text-gray-200 transition">
            NortheasternConnect
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="hover:text-gray-200 transition">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/posts" className="hover:text-gray-200 transition">
                  Posts
                </Link>
                <Link to="/events" className="hover:text-gray-200 transition">
                  Events
                </Link>
                <Link to="/users" className="hover:text-gray-200 transition">
                  Users
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="hover:text-gray-200 transition">
                    Admin
                  </Link>
                )}
                <Link
                  to={`/profile/${user?._id}`}
                  className="hover:text-gray-200 transition"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-white text-northeastern-red px-4 py-2 rounded hover:bg-gray-100 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-gray-200 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-northeastern-red px-4 py-2 rounded hover:bg-gray-100 transition"
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