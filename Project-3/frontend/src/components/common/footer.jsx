import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
     
          <Link to="/" className="text-2xl font-bold text-gray-900">
            Rental<span className="text-rose-500">Hub</span>
          </Link>

         
          <div className="flex gap-6 text-sm text-gray-600 font-medium">
            <Link to="/" className="hover:text-rose-500 transition">
              Home
            </Link>
            <Link to="/search" className="hover:text-rose-500 transition">
              Search Properties
            </Link>
            <Link to="/login" className="hover:text-rose-500 transition">
              Login
            </Link>
            <Link to="/register" className="hover:text-rose-500 transition">
              Register
            </Link>
          </div>

        
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} RentalHub, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;