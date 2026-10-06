import { Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import BuyerLayout from '../layouts/BuyerLayout';
import SellerLayout from '../layouts/SellerLayout';
import AdminLayout from '../layouts/AdminLayout';
import Home from '../pages/buyer/Home';
import Products from '../pages/buyer/Products';
import ProductDetails from '../pages/buyer/ProductDetails';
import Cart from '../pages/buyer/Cart';
import SellerDashboard from '../pages/seller/Dashboard';
import SellerStore from '../pages/seller/Store';
import SellerProducts from '../pages/seller/Products';
import SellerAddProduct from '../pages/seller/AddProduct';
import SellerEditProduct from '../pages/seller/EditProduct';
import SellerInventory from '../pages/seller/Inventory';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminStores from '../pages/admin/Stores';
import AdminCategories from '../pages/admin/Categories';

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">404</h2>
        <p className="text-gray-500">Page not found</p>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth routes — no layout */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public marketplace with BuyerLayout */}
      <Route element={<BuyerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={['buyer']}>
              <Cart />
            </RoleRoute>
          </ProtectedRoute>
        } />
      </Route>

      {/* Seller routes with SellerLayout */}
      <Route element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['seller', 'admin']}>
            <SellerLayout />
          </RoleRoute>
        </ProtectedRoute>
      }>
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/store" element={<SellerStore />} />
        <Route path="/seller/products" element={<SellerProducts />} />
        <Route path="/seller/products/new" element={<SellerAddProduct />} />
        <Route path="/seller/products/:id/edit" element={<SellerEditProduct />} />
        <Route path="/seller/inventory" element={<SellerInventory />} />
      </Route>

      {/* Admin routes with AdminLayout */}
      <Route element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        </ProtectedRoute>
      }>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stores" element={<AdminStores />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
