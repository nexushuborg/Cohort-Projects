import { Link, Outlet } from "react-router-dom";

function Navbar() {
  const isLoggedIn = false;

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-gray-900"
          >
            Rental<span className="text-rose-500">Hub</span>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-6">

            <Link
              to="/"
              className="text-gray-600 transition hover:text-rose-500"
            >
              Home
            </Link>

            <Link
              to="/search"
              className="text-gray-600 transition hover:text-rose-500"
            >
              Search
            </Link>

            {!isLoggedIn ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 transition hover:text-rose-500"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-rose-500 px-5 py-2.5 font-medium text-white transition hover:bg-rose-600"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  className="text-gray-600 hover:text-rose-500"
                >
                  Profile
                </Link>

                <button className="rounded-lg bg-gray-900 px-5 py-2.5 text-white hover:bg-gray-800">
                  Logout
                </button>
              </>
            )}

          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
}

export default Navbar;