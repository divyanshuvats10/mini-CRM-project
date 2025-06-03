import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../utils/api';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useAuth();
  
  // Get the route the user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSuccess = (credentialResponse) => {
    api.post('/auth/google', {
      credential: credentialResponse.credential
    })
      .then(response => {
        setUser(response.data.user);
        navigate(from, { replace: true });
      })
      .catch(error => {
        console.error('Login failed:', error);
      });
  };

  const handleError = () => {
    console.log('Login Failed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Welcome Back
          </h2>
          <p className="mt-3 text-lg text-gray-600">
            Sign in to access your Mini CRM dashboard
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-full flex justify-center items-center">
                <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin
                      onSuccess={handleSuccess}
                      onError={handleError}
                      shape="pill"
                      size="large"
                      width="100%"
                      text="continue_with"
                      theme="filled_blue"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure authentication powered by Google
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                By signing in, you agree to our{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600">
          <p>
            Need help?{' '}
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
