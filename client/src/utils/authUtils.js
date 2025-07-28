import { useAuth } from '../context/AuthContext';

export const logoutUser = async (navigate, userType = 'manager') => {
  try {
    // Determine the appropriate logout endpoint based on user type
    const logoutEndpoints = {
      'admin': '/api/admin/logout',
      'manager': '/api/manager/logout',
      'accountmanager': '/api/accountmanager/logout',
      'recruiter': '/api/recruiter/logout'
    };
    
    const endpoint = logoutEndpoints[userType] || '/api/manager/logout';
    
    // Call logout endpoint to clear server-side tokens
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      console.log('Logged out successfully');
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear client-side state regardless of server response
    localStorage.removeItem('userInfo');
    
    // Navigate to appropriate login page based on user type
    const loginRoutes = {
      'admin': '/admin/login',
      'manager': '/manager/login',
      'accountmanager': '/accountmanager/login',
      'recruiter': '/signin/recruiter'
    };
    
    const loginRoute = loginRoutes[userType] || '/manager/login';
    
    if (navigate) {
      navigate(loginRoute);
    }
  }
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
}; 