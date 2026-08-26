import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import sellerApi from '../../services/seller.api';
import productApi from '../../services/product.api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Dashboard() {
  const { data: storeRes, isLoading: storeLoading, error: storeError } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: () => sellerApi.getMyStore(),
  });

  const store = storeRes?.data?.data;
  const hasStore = !!store;

  const { data: prodRes, isLoading: prodLoading } = useQuery({
    queryKey: ['sellerProducts', store?.id],
    queryFn: () => productApi.getProductsByStore(store.id),
    enabled: !!store?.id,
  });

  const products = prodRes?.data?.data?.items || [];
  const productCount = prodRes?.data?.data?.pagination?.total || products.length;

  if (storeLoading) return <Loading />;
  if (storeError) return <ErrorMessage message="Failed to load store" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Dashboard</h1>

      {!hasStore ? (
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t created a store yet.</p>
          <Link to="/seller/store" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm">
            Create Your Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm text-gray-500">Store</h3>
            <p className="text-xl font-bold mt-1">{store.name}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded ${
              store.status === 'active' ? 'bg-green-100 text-green-700' :
              store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>{store.status}</span>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm text-gray-500">Products</h3>
            <p className="text-xl font-bold mt-1">{productCount}</p>
            <Link to="/seller/products" className="text-blue-600 text-sm hover:underline mt-2 inline-block">View all</Link>
          </div>
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-sm text-gray-500">Quick Actions</h3>
            <div className="mt-3 space-y-2">
              <Link to="/seller/products/new" className="block text-sm text-blue-600 hover:underline">Add Product</Link>
              <Link to="/seller/store" className="block text-sm text-blue-600 hover:underline">Edit Store</Link>
              <Link to="/seller/inventory" className="block text-sm text-blue-600 hover:underline">Manage Inventory</Link>
            </div>
          </div>
        </div>
      )}

      {hasStore && products.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-3">Recent Products</h2>
          <div className="bg-white rounded-lg border divide-y">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-gray-500">${Number(p.price).toFixed(2)} · {p.status}</p>
                </div>
                <Link to={`/seller/products/${p.id}/edit`} className="text-xs text-blue-600 hover:underline">Edit</Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
