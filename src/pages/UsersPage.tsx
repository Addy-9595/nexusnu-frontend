import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';
import type { User } from '../types';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getAllUsers();
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  const filteredUsers = users.filter((user) => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Community Members</h1>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'all'
                  ? 'bg-northeastern-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({users.length})
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'student'
                  ? 'bg-northeastern-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Students ({users.filter((u) => u.role === 'student').length})
            </button>
            <button
              onClick={() => setFilter('professor')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'professor'
                  ? 'bg-northeastern-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Professors ({users.filter((u) => u.role === 'professor').length})
            </button>
            <button
              onClick={() => setFilter('admin')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === 'admin'
                  ? 'bg-northeastern-red text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Admins ({users.filter((u) => u.role === 'admin').length})
            </button>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Link
                key={user._id}
                to={`/profile/${user._id}`}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-northeastern-red rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">
                    {user.name}
                    {user.isVerified && (
                      <span className="ml-1 text-blue-500">✓</span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-3">
                    <span className="bg-northeastern-red text-white px-3 py-1 rounded-full text-xs">
                      {user.role}
                    </span>
                    {user.major && (
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {user.major}
                      </span>
                    )}
                    {user.department && (
                      <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-xs">
                        {user.department}
                      </span>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-bold">{user.followers.length}</span>
                      <span className="ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-bold">{user.following.length}</span>
                      <span className="ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;