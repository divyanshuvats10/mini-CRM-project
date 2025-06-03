// src/pages/LogoutPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

function LogoutPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post('/auth/logout');
        setUser(null);
        navigate('/');
      } catch (error) {
        console.error('Logout failed:', error);
        // Still redirect even if logout fails
        setUser(null);
        navigate('/');
      }
    };

    logout();
  }, [navigate, setUser]);

  return <div>Logging out...</div>;
}

export default LogoutPage;
