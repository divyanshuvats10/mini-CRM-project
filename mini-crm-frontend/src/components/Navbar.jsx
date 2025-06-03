import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navGroups = [
    {
      title: 'Campaigns',
      items: [
        { name: 'Create Segment', path: '/segments/create' },
        { name: 'Launch Campaign', path: '/campaigns/launch' },
        { name: 'Campaign History', path: '/campaigns/history' }
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Customers', path: '/customers' },
        { name: 'Orders', path: '/orders' }
      ]
    }
  ];

  const actionItems = [
    { name: 'Add Customer', path: '/add-customer' },
    { name: 'Add Order', path: '/add-order' }
  ];

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-purple-900">
      {/* Top bar with logo and user info */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold text-white">
                Mini CRM
              </span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-sm font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white/90">{user.name}</span>
                </div>
                <Link
                  to="/logout"
                  onClick={logout}
                  className="text-sm text-white/80 hover:text-white transition-colors"
                >
                  Logout
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-white hover:text-white/90 transition-colors"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      {user && (
        <div className="hidden sm:block bg-white/10 backdrop-blur-sm border-t border-white/10">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div className="flex space-x-8">
                {navGroups.map((group) => (
                  <div key={group.title} className="flex items-center space-x-6">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      {group.title}
                    </span>
                    <div className="flex space-x-4">
                      {group.items.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className={`text-sm font-medium transition-colors ${
                            isActive(item.path)
                              ? 'text-white'
                              : 'text-white/80 hover:text-white'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                {actionItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-900 bg-white hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-white/10 backdrop-blur-sm border-t border-white/10">
          <div className="pt-2 pb-3 space-y-1">
            {navGroups.map((group) => (
              <div key={group.title} className="px-3 py-2">
                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                  {group.title}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive(item.path)
                          ? 'bg-white/20 text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="px-3 py-2">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Actions
              </div>
              <div className="space-y-1">
                {actionItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-3 py-2 rounded-md text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-white/10">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">{user.name}</div>
                </div>
              </div>
              <div className="mt-3">
                <Link
                  to="/logout"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block px-4 py-2 text-base font-medium text-white/80 hover:bg-white/10 hover:text-white"
                >
                  Logout
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
