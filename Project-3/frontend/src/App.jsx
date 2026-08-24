import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Booking from "./pages/Booking";
import MyTrips from "./pages/MyTrips";
import Checkout from "./pages/Checkout";

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
        path: "admin",
        element: <AdminDashboard />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;