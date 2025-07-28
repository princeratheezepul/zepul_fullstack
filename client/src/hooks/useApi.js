import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const useApi = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const refreshToken = async () => {
    try {
      const userType = user?.type || 'manager';
      const refreshEndpoints = {
        'admin': '/api/admin/refresh-token',
        'manager': '/api/manager/refresh-token',
        'accountmanager': '/api/accountmanager/refresh-token',
        'recruiter': '/api/recruiter/refresh-token'
      };
      
      const endpoint = refreshEndpoints[userType] || '/api/manager/refresh-token';
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}${endpoint}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.accessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  const apiCall = async (url, options = {}) => {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      let response = await fetch(url, finalOptions);
      
      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401) {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Retry the original request with the new token
          response = await fetch(url, finalOptions);
          
          if (response.status === 401) {
            // Still getting 401 after refresh, logout user
            logout();
            const userType = user?.type || 'manager';
            const loginRoutes = {
              'admin': '/admin/login',
              'manager': '/manager/login',
              'accountmanager': '/accountmanager/login',
              'recruiter': '/signin/recruiter'
            };
            navigate(loginRoutes[userType] || '/manager/login');
            throw new Error('Session expired. Please login again.');
          }
        } else {
          // Refresh failed, logout user
          logout();
          const userType = user?.type || 'manager';
          const loginRoutes = {
            'admin': '/admin/login',
            'manager': '/manager/login',
            'accountmanager': '/accountmanager/login',
            'recruiter': '/signin/recruiter'
          };
          navigate(loginRoutes[userType] || '/manager/login');
          throw new Error('Session expired. Please login again.');
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  };

  const get = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'GET' });
  };

  const post = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  };

  const put = (url, data, options = {}) => {
    return apiCall(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  };

  const del = (url, options = {}) => {
    return apiCall(url, { ...options, method: 'DELETE' });
  };

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  };
}; 