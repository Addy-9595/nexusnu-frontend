import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage'; // Import the new page
import PostsPage from './pages/post/PostsPage';
import CreatePostPage from './pages/post/CreatePostPage';
import PostDetailPage from './pages/post/PostDetailPage';
import EventsPage from './pages/event/EventsPage';
import CreateEventPage from './pages/event/CreateEventPage';
import EventDetailPage from './pages/event/EventDetailPage';
import UsersPage from './pages/UsersPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatPage from "./pages/chat/ChatPage";
// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Users Routes */}
          <Route path="/users" element={<UsersPage />} />
          
          {/* Posts Routes */}
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/:id" element={<PostDetailPage />} />
          <Route
            path="/posts/create"
            element={
              <ProtectedRoute>
                <CreatePostPage />
              </ProtectedRoute>
            }
          />

 {/* Edit Post Route */}
  <Route
  path="/posts/:id/edit"
  element={
    <ProtectedRoute>
      <CreatePostPage />
    </ProtectedRoute>
  }
/>
          
          {/* Events Routes */}
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route
            path="/events/create"
            element={
              <ProtectedRoute>
                <CreateEventPage />
              </ProtectedRoute>
            }
          />

          {/* Edit Event Route */}
          <Route
  path="/events/:id/edit"
  element={
    <ProtectedRoute>
      <CreateEventPage />
    </ProtectedRoute>
  }
/>
          
          {/* Profile Routes - IMPORTANT: /profile/edit must come BEFORE /profile/:id */}
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile/:id" element={<ProfilePage />} />

{/* Chat Routes */}
          <Route
  path="/chat"
  element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/chat/:userId"
  element={
    <ProtectedRoute>
      <ChatPage />
    </ProtectedRoute>
  }
/>
          
          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;