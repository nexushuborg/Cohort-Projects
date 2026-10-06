import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Marketplace</h3>
            <p className="text-sm text-gray-500">A multi-vendor marketplace connecting sellers and buyers.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Browse</h4>
            <div className="space-y-1">
              <Link to="/products" className="block text-sm text-gray-500 hover:text-gray-700">Products</Link>
              <Link to="/" className="block text-sm text-gray-500 hover:text-gray-700">Home</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2 text-sm">Account</h4>
            <div className="space-y-1">
              <Link to="/login" className="block text-sm text-gray-500 hover:text-gray-700">Login</Link>
              <Link to="/register" className="block text-sm text-gray-500 hover:text-gray-700">Register</Link>
            </div>
          </div>
        </div>
        <div className="border-t mt-8 pt-4 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Marketplace. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
