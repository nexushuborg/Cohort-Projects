import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import authApi from '../../services/auth.api';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* clear local state anyway */ }
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            Marketplace
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gray-600 hover:text-gray-900 text-sm">Products</Link>

            {isAuthenticated && user?.role === 'seller' && (
              <Link to="/seller/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Seller Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900 text-sm">Admin Dashboard</Link>
            )}

            {isAuthenticated && user?.role === 'buyer' && (
              <Link to="/cart" className="text-gray-600 hover:text-gray-900">
                <ShoppingCart size={20} />
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <User size={16} />
                  {user?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-red-600 flex items-center gap-1"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">Login</Link>
                <Link to="/register" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-600">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link to="/products" onClick={() => setMobileOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm">Products</Link>
            {isAuthenticated && user?.role === 'buyer' && (
              <Link to="/cart" onClick={() => setMobileOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm">Cart</Link>
            )}
            {isAuthenticated && user?.role === 'seller' && (
              <Link to="/seller/dashboard" onClick={() => setMobileOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm">Seller Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="block text-gray-600 hover:text-gray-900 text-sm">Admin Dashboard</Link>
            )}
            {isAuthenticated ? (
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="block text-sm text-red-600">Logout</button>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="text-sm text-gray-600">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="text-sm text-blue-600">Register</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
