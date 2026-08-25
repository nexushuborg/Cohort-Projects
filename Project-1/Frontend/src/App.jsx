import { useEffect } from "react";
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { getCurrentUser } from "./api/authApi";
import useAuthStore from "./stores/authStore";
import ProtectedRoute from "./components/ProtectedRoute";

import CreateEvent from "./pages/CreateEvent";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Checkout from "./pages/Checkout";
import MyBookings from "./pages/MyBookings";
import MyTickets from "./pages/MyTickets";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (!accessToken) return;
    getCurrentUser().then((response) => setUser(response.data)).catch(logout);
  }, [accessToken, setUser, logout]);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        <Route path="/create-event" element={<ProtectedRoute roles={["organizer", "admin"]}><CreateEvent /></ProtectedRoute>} />
        <Route path="/organizer-dashboard" element={<ProtectedRoute roles={["organizer", "admin"]}><OrganizerDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
