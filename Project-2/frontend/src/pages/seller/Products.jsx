import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import sellerApi from '../../services/seller.api';
import productApi from '../../services/product.api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Products() {
  const queryClient = useQueryClient();

  const { data: storeRes, isLoading: storeLoading } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: () => sellerApi.getMyStore(),
  });

  const store = storeRes?.data?.data;

  const { data: prodRes, isLoading: prodLoading, error } = useQuery({
    queryKey: ['sellerProducts', store?.id],
    queryFn: () => productApi.getProductsByStore(store.id),
    enabled: !!store?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sellerProducts'] }),
  });

  const products = prodRes?.data?.data?.items || [];

  if (storeLoading || prodLoading) return <Loading />;
  if (!store) return <EmptyState message="Create a store first" action="Create Store" onAction={() => window.location.href = '/seller/store'} />;
  if (error) return <ErrorMessage message="Failed to load products" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/seller/products/new" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState message="No products yet" action="Create Product" onAction={() => window.location.href = '/seller/products/new'} />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">img</span>
                      </div>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        {p.brand && <p className="text-xs text-gray-500">{p.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">${Number(p.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' :
                      p.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/seller/products/${p.id}/edit`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button
                      onClick={() => { if (window.confirm('Delete this product?')) deleteMutation.mutate(p.id); }}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
