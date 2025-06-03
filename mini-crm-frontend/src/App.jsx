import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import api from './utils/api';
import HomePage from './pages/HomePage';
import CreateSegment from './pages/CreateSegment';
import CampaignHistory from './pages/CampaignHistory';
import CampaignLogs from './pages/CampaignLogs';
import LoginPage from './pages/LoginPage';
import LogoutPage from './pages/LogoutPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetail from './pages/CustomerDetail';
import OrdersPage from './pages/OrdersPage';
import OrderDetail from './pages/OrderDetail';
import CustomerForm from './components/CustomerForm';
import OrderForm from './components/OrderForm';
import Navbar from './components/Navbar';
import LaunchCampaign from './pages/LaunchCampaign';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/segments/create" element={
            <ProtectedRoute>
              <CreateSegment />
            </ProtectedRoute>
          } />
          <Route path="/campaigns/history" element={
            <ProtectedRoute>
              <CampaignHistory />
            </ProtectedRoute>
          } />
          <Route path="/campaigns/:campaignId/logs" element={
            <ProtectedRoute>
              <CampaignLogs />
            </ProtectedRoute>
          } />
          <Route path="/customers" element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          } />
          <Route path="/customers/:id" element={
            <ProtectedRoute>
              <CustomerDetail />
            </ProtectedRoute>
          } />
          <Route
            path="/add-customer"
            element={
              <ProtectedRoute>
                <CustomerForm onAdd={(data) => {
                  api.post('/api/customers', data)
                    .then(res => {
                      console.log('Customer added:', res.data);
                      alert('Customer data successfully ingested! The information has been added to the processing queue.');
                      // Optionally redirect or show a toast
                    })
                    .catch(err => {
                      console.error(err);
                      alert('Error adding customer. Please try again.');
                    });
                }} />
              </ProtectedRoute>
            }
          />
          <Route path="/orders" element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
          <Route
            path="/add-order"
            element={
              <ProtectedRoute>
                <OrderForm
                  onAdd={(data) => {
                    api.post('/api/orders', data)
                      .then(res => {
                        console.log('Order added:', res.data);
                        alert('Order data successfully ingested! The information has been added to the processing queue.');
                        // Optionally redirect or show a toast
                      })
                      .catch(err => {
                        console.error(err);
                        alert('Error adding order. Please try again.');
                      });
                  }}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/campaigns/launch" element={
            <ProtectedRoute>
              <LaunchCampaign />
            </ProtectedRoute>
          } />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/logout" element={<LogoutPage />} />
          <Route path="*" element={<div>Welcome to Mini CRM! Select an option above.</div>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
