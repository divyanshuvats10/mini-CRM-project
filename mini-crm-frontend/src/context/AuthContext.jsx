// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Checking authentication status...');
        console.log('🌐 Current origin:', window.location.origin);
        console.log('📡 API Base URL:', api.defaults.baseURL);
        console.log('🍪 All cookies:', document.cookie);
        console.log('🍪 Session cookies:', document.cookie.split(';').filter(c => c.includes('sessionId')));
        
        const response = await api.get('/auth/user');
        console.log('🔐 Auth check response:', response.data);
        console.log('🍪 Response headers:', response.headers);
        console.log('🍪 Set-Cookie header:', response.headers['set-cookie']);
        
        if (response.data.user) {
          setUser(response.data.user);
          console.log('✅ User authenticated:', response.data.user.name);
        } else {
          setUser(null);
          console.log('❌ No user authenticated');
        }
      } catch (error) {
        console.error('🚨 Auth check failed:', error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers
        });
        
        // If it's a CORS or network error, log more details
        if (error.code === 'ERR_NETWORK') {
          console.error('🌐 Network error - possible CORS issue');
        }
        
        // If the request fails, assume no authentication
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🏁 Auth check completed');
        console.log('🍪 Cookies after auth check:', document.cookie);
      }
    };

    checkAuth();
  }, []);

  // Logout function
  const logout = async () => {
    try {
      console.log('🚪 Attempting logout...');
      console.log('🍪 Cookies before logout:', document.cookie);
      
      await api.post('/auth/logout');
      setUser(null);
      console.log('✅ User logged out successfully');
      console.log('🍪 Cookies after logout:', document.cookie);
    } catch (error) {
      console.error('🚨 Logout failed:', error);
      // Still clear user state even if request fails
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
