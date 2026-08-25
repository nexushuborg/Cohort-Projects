import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import sellerApi from '../../services/seller.api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Store() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: () => sellerApi.getMyStore(),
  });

  const store = data?.data?.data;
  const hasStore = !!store;

  const createMutation = useMutation({
    mutationFn: (d) => sellerApi.registerStore(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerStore'] });
      setMsg('Store created!');
      setEditing(false);
    },
    onError: (e) => setMsg(e.response?.data?.error?.message || 'Failed to create store'),
  });

  const updateMutation = useMutation({
    mutationFn: (d) => sellerApi.updateStore(store.id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sellerStore'] });
      setMsg('Store updated!');
      setEditing(false);
    },
    onError: (e) => setMsg(e.response?.data?.error?.message || 'Failed to update store'),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load store" />;

  if (!hasStore && !editing) {
    return (
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Your Store</h1>
        <div className="bg-white rounded-lg border p-8 text-center">
          <p className="text-gray-500 mb-4">You haven&apos;t created a store yet.</p>
          <button onClick={() => setEditing(true)} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm">
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">{hasStore && !editing ? 'Your Store' : (hasStore ? 'Edit Store' : 'Create Store')}</h1>
      {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}
      <StoreForm
        initial={hasStore ? store : {}}
        isEdit={hasStore}
        onSubmit={(d) => hasStore ? updateMutation.mutate(d) : createMutation.mutate(d)}
        onCancel={() => { setEditing(false); setMsg(''); }}
        loading={createMutation.isPending || updateMutation.isPending}
      />
      {hasStore && !editing && (
        <div className="mt-6 bg-white rounded-lg border p-6 space-y-2 text-sm">
          <div><span className="text-gray-500">Name:</span> {store.name}</div>
          <div><span className="text-gray-500">Slug:</span> {store.slug}</div>
          <div><span className="text-gray-500">Status:</span> <span className={`px-2 py-0.5 rounded text-xs ${
            store.status === 'active' ? 'bg-green-100 text-green-700' :
            store.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>{store.status}</span></div>
          {store.description && <div><span className="text-gray-500">Description:</span> {store.description}</div>}
          {store.contactEmail && <div><span className="text-gray-500">Email:</span> {store.contactEmail}</div>}
          {store.contactPhone && <div><span className="text-gray-500">Phone:</span> {store.contactPhone}</div>}
          <button onClick={() => setEditing(true)} className="mt-4 text-blue-600 hover:underline text-sm">Edit Store</button>
        </div>
      )}
    </div>
  );
}

function StoreForm({ initial = {}, isEdit, onSubmit, onCancel, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: initial.name || '',
      description: initial.description || '',
      contactEmail: initial.contactEmail || '',
      contactPhone: initial.contactPhone || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border p-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
        <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
          className="w-full border rounded-md px-3 py-2 text-sm" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea {...register('description')} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
          <input type="email" {...register('contactEmail')} className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
          <input {...register('contactPhone')} className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Saving...' : (isEdit ? 'Update Store' : 'Create Store')}
        </button>
        <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  );
}
