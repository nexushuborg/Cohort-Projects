import { Link } from "react-router-dom";

function Sidebar({ role = "host" }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
      <h2 className="text-xl font-bold text-gray-900 mb-6 capitalize">
        {role} Panel
      </h2>

      <nav className="flex flex-col gap-2 text-sm font-medium">
        {role === "admin" ? (
          <>
            <Link to="/admin" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
               Dashboard
            </Link>
            <Link to="/admin/users" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
               Manage Users
            </Link>
            <Link to="/admin/properties" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
               Manage Properties
            </Link>
          </>
        ) : (
          <>
            <Link to="/host" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
              Host Overview
            </Link>
            <Link to="/host/listings" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
               My Listings
            </Link>
            <Link to="/host/listings/new" className="p-3 text-gray-700 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition">
               Create Listing
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;