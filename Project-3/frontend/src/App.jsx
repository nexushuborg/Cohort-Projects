import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Booking from "./pages/Booking";
import MyTrips from "./pages/MyTrips";
import Checkout from "./pages/Checkout";
import GuestDashboard from "./pages/GuestDashboard";
import MyListings from "./pages/host/MyListings";
import CreateListing from "./pages/host/CreateListing";
import HostDashboard from "./pages/host/HostDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      {
        index: true,
        element: <Search />,
      },
      {
        path: "search",
        element: <Search />,
      },
      {
        path: "properties/:id",
        element: <PropertyDetails />,
      },
      {
        path: "properties/:id/book",
        element: <Booking />,
      },
      {
        path: "trips",
        element: <MyTrips />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "dashboard",
        element: <GuestDashboard />,
      },
      {
        path: "admin",
        element: <AdminDashboard />,
      },
      {
        path: "host/listings",
        element: <MyListings />,
      },
      {
        path: "host/create-listing",
        element: <CreateListing />,
      },
      {
        path: "host/dashboard",
        element: <HostDashboard />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;