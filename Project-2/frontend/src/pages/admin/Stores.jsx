import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import sellerApi from '../../services/seller.api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function Stores() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminStores'],
    queryFn: () => sellerApi.getStores(),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => sellerApi.updateStoreStatus(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminStores'] }),
  });

  const stores = data?.data?.data?.items || [];

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load stores" onRetry={refetch} />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Stores</h1>
      {stores.length === 0 ? (
        <EmptyState message="No stores found" />
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Store</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Owner</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Created</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {stores.map((s) => (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{s.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      s.status === 'active' ? 'bg-green-100 text-green-700' :
                      s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.owner?.name || s.ownerId || '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {s.status !== 'active' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: s.id, status: 'active' })}
                        disabled={statusMutation.isPending}
                        className="text-xs text-green-600 hover:underline mr-3"
                      >Approve</button>
                    )}
                    {s.status !== 'suspended' && (
                      <button
                        onClick={() => { if (window.confirm('Suspend this store?')) statusMutation.mutate({ id: s.id, status: 'suspended' }); }}
                        disabled={statusMutation.isPending}
                        className="text-xs text-red-600 hover:underline"
                      >Suspend</button>
                    )}
                    {s.status === 'suspended' && (
                      <button
                        onClick={() => statusMutation.mutate({ id: s.id, status: 'active' })}
                        disabled={statusMutation.isPending}
                        className="text-xs text-green-600 hover:underline"
                      >Reactivate</button>
                    )}
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
