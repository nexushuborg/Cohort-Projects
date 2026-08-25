import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import PropertyDetails from "./pages/PropertyDetails";
import Booking from "./pages/Booking";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import HostDashboard from "./pages/host/HostDashboard";
import MyListings from "./pages/host/MyListings";
import CreateListing from "./pages/host/CreateListing";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Users from "./pages/admin/Users";
import Properties from "./pages/admin/Properties";
import Bookings from "./pages/admin/Bookings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      { index: true, element: <Search /> },
      { path: "search", 
        element: <Search />
       },
      { path: "properties/:id", 
        element: <PropertyDetails />
       },
      { path: "login",
         element: <Login /> },
      { path: "register",
         element: <Register /> },

      {
        element: <ProtectedRoute allowedRoles={["guest", "host", "admin"]} />,
        children: [
          { path: "properties/:id/book", 
            element: <Booking /> },
          { path: "trips",
             element: <MyTrips /> },
          { path: "profile",
             element: <Profile /> },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={["host", "admin"]} />,
        children: [
          { path: "host", 
            element: <HostDashboard /> },
          { path: "host/dashboard", 
            element: <HostDashboard /> },
          { path: "host/listings",
             element: <MyListings /> },
          { path: "host/create-listing",
             element: <CreateListing /> },
        ],
      },

      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [
          { path: "admin", 
            element: <AdminDashboard /> },
          { path: "admin/users",
             element: <Users /> },
          { path: "admin/properties", 
            element: <Properties /> },
          { path: "admin/bookings", 
            element: <Bookings /> },
        ],
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;