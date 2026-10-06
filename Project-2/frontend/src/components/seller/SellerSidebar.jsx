import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Store, Package, Plus, BarChart3, Menu, X, LogOut } from 'lucide-react';
import useAuthStore from '../../store/auth.store';
import authApi from '../../services/auth.api';

const links = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/store', label: 'Store', icon: Store },
  { to: '/seller/products', label: 'Products', icon: Package },
  { to: '/seller/products/new', label: 'Add Product', icon: Plus },
  { to: '/seller/inventory', label: 'Inventory', icon: BarChart3 },
];

export default function SellerSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* clear anyway */ }
    logout();
    navigate('/login');
  };

  const nav = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <Link to="/seller/dashboard" className="text-lg font-bold text-blue-600">Seller Panel</Link>
        {user && <p className="text-xs text-gray-500 mt-1">{user.name}</p>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
              location.pathname === to
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-200">
        <Link to="/" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
          Back to Marketplace
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded w-full">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden fixed top-4 left-4 z-50 bg-white border rounded-md p-2 shadow-sm">
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-56 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
        {nav}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg overflow-y-auto">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}
