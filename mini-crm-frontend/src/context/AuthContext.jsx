// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api, { getToken, removeToken } from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing JWT token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking JWT authentication status...');
        console.log('🌐 Current origin:', window.location.origin);
        console.log('📡 API Base URL:', api.defaults.baseURL);
        
        const token = getToken();
        if (!token) {
          console.log('🔓 No JWT token found in localStorage');
          setUser(null);
          setLoading(false);
          return;
        }
        
        console.log('🔐 JWT token found, verifying...');
        
        const response = await api.get('/auth/user-jwt');
        console.log('🔐 JWT auth check response:', response.data);
        
        if (response.data.user) {
          setUser(response.data.user);
          console.log('✅ User authenticated via JWT:', response.data.user.name);
        } else {
          setUser(null);
          removeToken(); // Remove invalid token
          console.log('❌ JWT token invalid, removed from storage');
        }
      } catch (error) {
        console.error('🚨 JWT auth check failed:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
        });
        
        // If token is invalid, remove it
        removeToken();
        setUser(null);
        console.log('🔓 Removed invalid JWT token');
      } finally {
        setLoading(false);
        console.log('🏁 JWT auth check completed');
      }
    };

    checkAuth();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Attempting JWT logout...');
      
      // Remove token from localStorage
      removeToken();
      setUser(null);
      console.log('✅ JWT logout successful - token removed');
      
      // Optional: Also call backend logout (for session cleanup if needed)
      try {
        await api.post('/auth/logout');
      } catch (err) {
        // Ignore backend logout errors, local logout is sufficient for JWT
        console.log('Backend logout call failed (ignored for JWT):', err.message);
      }
    } catch (error) {
      console.error('🚨 JWT logout failed:', error);
      // Still clear user state and token even if request fails
      removeToken();
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
