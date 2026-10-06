import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import sellerApi from '../../services/seller.api';
import productApi from '../../services/product.api';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

export default function Inventory() {
  const { data: storeRes, isLoading: storeLoading } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: () => sellerApi.getMyStore(),
  });

  const store = storeRes?.data?.data;

  const { data: prodRes, isLoading: prodLoading } = useQuery({
    queryKey: ['sellerProducts', store?.id],
    queryFn: () => productApi.getProductsByStore(store.id),
    enabled: !!store?.id,
  });

  const products = prodRes?.data?.data?.items || [];

  if (storeLoading || prodLoading) return <Loading />;
  if (!store) return <EmptyState message="Create a store first" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      {products.length === 0 ? (
        <EmptyState message="No products to manage inventory for" />
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/seller/products/${p.id}/edit`} className="text-blue-600 hover:underline">Manage SKUs & Stock</Link>
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
