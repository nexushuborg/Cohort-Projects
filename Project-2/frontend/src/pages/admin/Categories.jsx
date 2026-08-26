import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import categoryApi from '../../services/category.api';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function Categories() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (d) => categoryApi.createCategory(d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCategories'] }); setShowCreate(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => categoryApi.updateCategory(id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminCategories'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminCategories'] }),
  });

  const categories = data?.data?.data?.items || [];

  if (isLoading) return <Loading />;
  if (error) return <ErrorMessage message="Failed to load categories" onRetry={refetch} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setShowCreate(true)} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700">
          Add Category
        </button>
      </div>

      {showCreate && (
        <CategoryForm
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setShowCreate(false)}
          error={createMutation.isError ? createMutation.error.response?.data?.error?.message : null}
          loading={createMutation.isPending}
        />
      )}

      {categories.length === 0 ? (
        <EmptyState message="No categories found" />
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Parent</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-4 py-3">
                    {editing === cat.id ? (
                      <CategoryForm
                        initial={cat}
                        onSubmit={(d) => updateMutation.mutate({ id: cat.id, ...d })}
                        onCancel={() => setEditing(null)}
                        loading={updateMutation.isPending}
                        compact
                      />
                    ) : (
                      <span className="font-medium">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono">{cat.slug || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{cat.parent_id || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {editing !== cat.id && (
                      <>
                        <button onClick={() => setEditing(cat.id)} className="text-xs text-blue-600 hover:underline mr-3">Edit</button>
                        <button
                          onClick={() => { if (window.confirm('Delete this category?')) deleteMutation.mutate(cat.id); }}
                          className="text-xs text-red-600 hover:underline"
                        >Delete</button>
                      </>
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

function CategoryForm({ initial, onSubmit, onCancel, error, loading, compact }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: initial?.name || '', parentId: initial?.parent_id || '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={compact ? '' : 'bg-white rounded-lg border p-6 mb-6'}>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
          <input {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 chars' } })}
            className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Category name" />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent ID</label>
          <input {...register('parentId')} className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Optional UUID" />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button type="button" onClick={onCancel} className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </div>
    </form>
  );
}
