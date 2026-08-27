import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ModeProvider } from './context/ModeContext';
import Navbar from './components/Navbar/Navbar';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { PageLoader } from './components/Spinner/Spinner';

// Pages
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Profile from './pages/Profile/Profile';
import Home from './pages/Home/Home';
import RideDetail from './pages/RideDetail/RideDetail';
import PostRide from './pages/PostRide/PostRide';
import MyBookings from './pages/MyBookings/MyBookings';
import DriverTrips from './pages/DriverTrips/DriverTrips';
import DriverSetup from './pages/DriverSetup/DriverSetup';
import Wallet from './pages/Wallet/Wallet';
import DriverDashboard from './pages/DriverDashboard/DriverDashboard';
import RiderDashboard from './pages/RiderDashboard/RiderDashboard';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  return (
    <>
      <ErrorBoundary>
      <Navbar />
      <main>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rides/:id" element={<RideDetail />} />
          <Route path="/search" element={<Home />} />

          {/* Guest only */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vehicle-management"
            element={
              <ProtectedRoute>
                <DriverSetup />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-ride"
            element={
              <ProtectedRoute>
                <PostRide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/driver/trips"
            element={
              <ProtectedRoute>
                <DriverTrips />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/driver"
            element={
              <ProtectedRoute>
                <DriverDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/rider"
            element={
              <ProtectedRoute>
                <RiderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      </ErrorBoundary>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ModeProvider>
          <AppRoutes />
        </ModeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
