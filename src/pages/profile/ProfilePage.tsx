// frontend/src/pages/profile/ProfilePage.tsx

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import type { User, Post, Event } from '../../types';

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;

      try {
        const response = await userAPI.getUserById(id);
        setUser(response.data.user);
        setPosts(response.data.posts);
        setEvents(response.data.events);

        if (currentUser) {
          const followStatus = response.data.user.followers.some(
            (follower: any) => follower._id === currentUser._id
          );
          console.log('🔍 FOLLOW CHECK:', {
            currentUserId: currentUser._id,
            targetUserId: id,
            followersArray: response.data.user.followers.map((f: any) => f._id),
            isFollowing: followStatus
          });
          setIsFollowing(followStatus);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    window.scrollTo(0, 0);
  }, [id, currentUser]);

  const handleFollowToggle = async () => {
    if (!id || !currentUser) return;

    try {
      if (isFollowing) {
        console.log('🔴 UNFOLLOW ACTION:', { targetId: id });
        await userAPI.unfollowUser(id);
        setIsFollowing(false);
        setUser((prev) => prev ? {
          ...prev,
          followers: prev.followers.filter((f: any) => f._id !== currentUser._id)
        } : null);
      } else {
        console.log('🔵 FOLLOW ACTION:', { targetId: id });
        await userAPI.followUser(id);
        setIsFollowing(true);
        setUser((prev) => prev ? {
          ...prev,
          followers: [...prev.followers, { _id: currentUser._id, name: currentUser.name }] as any
        } : null);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-northeastern-red rounded-full flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture.startsWith('http') ? user.profilePicture : `${BASE_URL}${user.profilePicture}`}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {user.name}
                  {user.isVerified && (
                    <span className="ml-2 text-blue-500">✓</span>
                  )}
                </h1>
                <p className="text-gray-600 mb-1">{user.email}</p>
                <span className="inline-block bg-northeastern-red text-white px-3 py-1 rounded text-sm">
                  {user.role}
                </span>
                {user.major && (
                  <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm ml-2">
                    {user.major}
                  </span>
                )}
                {user.department && (
                  <span className="inline-block bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm ml-2">
                    {user.department}
                  </span>
                )}
              </div>
            </div>

            {currentUser && !isOwnProfile && (
              <div className="flex gap-2">
                <button
                  onClick={handleFollowToggle}
                  className={`px-6 py-2 rounded-lg font-semibold transition ${
                    isFollowing
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-northeastern-red text-white hover:bg-red-700'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>

                <Link
                  to={`/chat/${id}`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Message
                </Link>
              </div>
            )}

            {isOwnProfile && (
              <Link
                to="/profile/edit"
                className="px-6 py-2 bg-northeastern-red text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Edit Profile
              </Link>
            )}
          </div>

          {user.bio && (
            <p className="mt-6 text-gray-700">{user.bio}</p>
          )}

          {isOwnProfile && user.location && (
            <>
            <br />
              <span>Lives in</span>
              <span className="inline-block px-2 py-1 rounded text-sm">
                {user.location}
              </span>
            </>
          )}

          {user.skills && user.skills.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.certifications && user.certifications.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Certifications</h3>
              <div className="space-y-2">
                {user.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <p className="font-semibold text-gray-800">{cert.certificate_name}</p>
                    <p className="text-sm text-gray-600">{cert.issuer}</p>
                    {cert.completion_date && (
                      <p className="text-xs text-gray-500">{cert.completion_date}</p>
                    )}
                    {cert.credential_url && (
                      <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        View Certificate
                      </a>
                    )}
                    {cert.verified && <span className="text-green-600 text-xs ml-2">✓ Verified</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-8 mt-6 text-sm">
            <div>
              <span className="font-bold text-lg">{user.followers.length}</span>
              <span className="text-gray-600 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold text-lg">{user.following.length}</span>
              <span className="text-gray-600 ml-1">Following</span>
            </div>
            <div>
              <span className="font-bold text-lg">{posts.length}</span>
              <span className="text-gray-600 ml-1">Posts</span>
            </div>
            <div>
              <span className="font-bold text-lg">{events.length}</span>
              <span className="text-gray-600 ml-1">Events</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Posts</h2>
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post._id}
                  to={`/posts/${post._id}`}
                  className="block p-4 border border-gray-200 rounded hover:border-northeastern-red transition"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{post.content}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>{post.likes.length} likes</span>
                    <span className="mx-2">•</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Events Organized</h2>
          {events.length === 0 ? (
            <p className="text-gray-500">No events organized yet.</p>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <Link
                  key={event._id}
                  to={`/events/${event._id}`}
                  className="block p-4 border border-gray-200 rounded hover:border-northeastern-red transition"
                >
                  <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{event.description}</p>
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
    </div>
  );
};

export default ProfilePage;