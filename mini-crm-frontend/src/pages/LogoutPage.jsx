// src/pages/LogoutPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LogoutPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        console.log('Logout successful, redirecting to home');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        setIsLoggingOut(false);
        // Redirect to home page after logout
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          {isLoggingOut ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Logging out...
              </h2>
              <p className="mt-2 text-gray-600">
                Please wait while we sign you out.
              </p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Logged out successfully
              </h2>
              <p className="mt-2 text-gray-600">
                Redirecting you to the home page...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogoutPage;
