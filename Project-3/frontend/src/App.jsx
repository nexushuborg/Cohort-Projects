import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import AdminDashboard from "./pages/AdminDashboard";
import PropertyDetails from "./pages/PropertyDetails";
import Booking from "./pages/Booking";

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
        { path: "properties/:id/book", 
          element: <Booking /> },
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
      {
        path: "properties/:id",
        element: <PropertyDetails />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;