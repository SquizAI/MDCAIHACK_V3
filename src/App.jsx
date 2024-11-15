import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const Navbar = lazy(() => import('./components/Navbar'));
const Home = lazy(() => import('./components/Home'));
const Schedule = lazy(() => import('./components/Schedule'));
const Register = lazy(() => import('./components/Register'));
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const Dashboard = lazy(() => import('./components/admin/Dashboard'));
const UserLogin = lazy(() => import('./components/UserLogin'));
const ResetPassword = lazy(() => import('./components/ResetPassword'));
const ParticipantDashboard = lazy(() => import('./components/auth/ParticipantDashboard'));
const VolunteerDashboard = lazy(() => import('./components/auth/VolunteerDashboard'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

// Error Fallback
const ErrorFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Component</h2>
      <p className="text-gray-700 mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userRole } = useAuth();

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    console.log('User role not allowed:', userRole);
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gray-50">
            <Suspense fallback={<Loading />}>
              <ErrorBoundary>
                <Navbar />
              </ErrorBoundary>
              <div className="pt-16">
                <Suspense fallback={<Loading />}>
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <ErrorBoundary>
                          <Home />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/schedule" 
                      element={
                        <ErrorBoundary>
                          <Schedule />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/register" 
                      element={
                        <ErrorBoundary>
                          <Register />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/login" 
                      element={
                        <ErrorBoundary>
                          <UserLogin />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/reset-password" 
                      element={
                        <ErrorBoundary>
                          <ResetPassword />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin" 
                      element={
                        <ErrorBoundary>
                          <AdminLogin />
                        </ErrorBoundary>
                      } 
                    />
                    <Route 
                      path="/admin/dashboard" 
                      element={
                        <ErrorBoundary>
                          <ProtectedRoute allowedRoles={['admin']}>
                            <Dashboard />
                          </ProtectedRoute>
                        </ErrorBoundary>
                      } 
                    />
                    <Route
                      path="/participant/dashboard"
                      element={
                        <ErrorBoundary>
                          <ProtectedRoute allowedRoles={['participant', 'both']}>
                            <ParticipantDashboard />
                          </ProtectedRoute>
                        </ErrorBoundary>
                      }
                    />
                    <Route
                      path="/volunteer/dashboard"
                      element={
                        <ErrorBoundary>
                          <ProtectedRoute allowedRoles={['volunteer', 'both']}>
                            <VolunteerDashboard />
                          </ProtectedRoute>
                        </ErrorBoundary>
                      }
                    />
                    <Route 
                      path="*" 
                      element={
                        <ErrorBoundary>
                          <Navigate to="/" replace />
                        </ErrorBoundary>
                      } 
                    />
                  </Routes>
                </Suspense>
              </div>
            </Suspense>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;