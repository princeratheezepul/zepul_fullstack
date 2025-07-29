import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute - Current state:', {
    isAuthenticated,
    isLoading,
    user,
    allowedRoles,
    currentPath: location.pathname
  });

  // Show loading while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute - Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to login');
    // If trying to access an admin route, redirect to /admin/login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    // Otherwise, redirect to the unified login
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.type)) {
    console.log('ProtectedRoute - Role mismatch, redirecting to login');
    // If trying to access an admin route, redirect to /admin/login
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    // Otherwise, redirect to the unified login
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute - Access granted, rendering children');
  return children;
};

export default ProtectedRoute; 