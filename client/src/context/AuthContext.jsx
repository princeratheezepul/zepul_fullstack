import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to check if a JWT token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Check if we have a stored token and if it's expired
          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            const userInfo = JSON.parse(storedUserInfo);
            if (userInfo.data?.accessToken && isTokenExpired(userInfo.data.accessToken)) {
              // Token is expired, clear storage and require re-login
              localStorage.removeItem('authUser');
              localStorage.removeItem('userInfo');
              setUser(null);
              setIsAuthenticated(false);
              setIsLoading(false);
              return;
            }
          }
          
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('userInfo');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData) => {
    console.log('AuthContext login - userData received:', userData);
    console.log('AuthContext login - accessToken in userData:', userData?.data?.accessToken);
    
    // Store full response data in localStorage for admin components
    localStorage.setItem('userInfo', JSON.stringify(userData));
    
    // Verify what was stored
    const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));
    console.log('AuthContext login - stored userInfo:', storedUserInfo);
    console.log('AuthContext login - accessToken in stored userInfo:', storedUserInfo?.data?.accessToken);
    
    // Store minimal user data in localStorage for AuthContext
    const minimalUserData = {
      id: userData.data.user._id,
      email: userData.data.user.email,
      username: userData.data.user.username,
      fullname: userData.data.user.fullname,
      type: userData.data.user.type,
      adminId: userData.data.user.adminId,
      isAuthenticated: true
    };

    localStorage.setItem('authUser', JSON.stringify(minimalUserData));
    setUser(minimalUserData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('userInfo');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 