import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import variantApi from '../../services/variant.api';
import Loading from '../common/Loading';

export default function VariantManager({ productId }) {
  const queryClient = useQueryClient();
  const [addingType, setAddingType] = useState(false);
  const [addingOption, setAddingOption] = useState(null); // variantTypeId
  const [editingType, setEditingType] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantApi.getVariants(productId),
    enabled: !!productId,
  });

  const createTypeMutation = useMutation({
    mutationFn: (d) => variantApi.createVariant(productId, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['variants', productId] }); setAddingType(false); },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, ...d }) => variantApi.updateVariant(productId, id, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['variants', productId] }); setEditingType(null); },
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id) => variantApi.deleteVariant(productId, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['variants', productId] }),
  });

  const createOptionMutation = useMutation({
    mutationFn: ({ variantTypeId, value }) => variantApi.createVariantOption(productId, variantTypeId, { value }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['variants', productId] }); setAddingOption(null); },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: ({ variantTypeId, optionId }) => variantApi.deleteVariantOption(productId, variantTypeId, optionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['variants', productId] }),
  });

  const variantTypes = data?.data?.data || [];

  if (isLoading) return <Loading />;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Variants</h2>
        <button onClick={() => setAddingType(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          Add Variant Type
        </button>
      </div>

      {addingType && (
        <AddTypeForm onSubmit={(d) => createTypeMutation.mutate(d)} onCancel={() => setAddingType(false)} loading={createTypeMutation.isPending} />
      )}

      {variantTypes.length === 0 ? (
        <p className="text-sm text-gray-500">No variants yet</p>
      ) : (
        <div className="space-y-4">
          {variantTypes.map((vt) => (
            <div key={vt.id} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                {editingType === vt.id ? (
                  <EditTypeForm initial={vt.name} onSubmit={(d) => updateTypeMutation.mutate({ id: vt.id, ...d })} onCancel={() => setEditingType(null)} />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{vt.name}</span>
                    <button onClick={() => setEditingType(vt.id)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => { if (window.confirm('Delete variant type?')) deleteTypeMutation.mutate(vt.id); }} className="text-xs text-red-600 hover:underline">Delete</button>
                  </div>
                )}
                <button onClick={() => setAddingOption(addingOption === vt.id ? null : vt.id)} className="text-xs text-blue-600 hover:underline">
                  {addingOption === vt.id ? 'Cancel' : '+ Add Option'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(vt.options || []).map((opt) => (
                  <span key={opt.id} className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded flex items-center gap-1">
                    {opt.value}
                    <button onClick={() => deleteOptionMutation.mutate({ variantTypeId: vt.id, optionId: opt.id })} className="text-red-400 hover:text-red-600 ml-1">&times;</button>
                  </span>
                ))}
              </div>
              {addingOption === vt.id && (
                <AddOptionForm onSubmit={(d) => createOptionMutation.mutate({ variantTypeId: vt.id, ...d })} onCancel={() => setAddingOption(null)} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddTypeForm({ onSubmit, onCancel, loading }) {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mb-4">
      <input {...register('name', { required: true })} placeholder="Variant name (e.g. Color)" className="border rounded px-3 py-1.5 text-sm flex-1" />
      <button type="submit" disabled={loading} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Save</button>
      <button type="button" onClick={onCancel} className="border px-3 py-1.5 rounded text-sm">Cancel</button>
    </form>
  );
}

function EditTypeForm({ initial, onSubmit, onCancel }) {
  const { register, handleSubmit } = useForm({ defaultValues: { name: initial } });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <input {...register('name', { required: true })} className="border rounded px-3 py-1.5 text-sm flex-1" />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs">Save</button>
      <button type="button" onClick={onCancel} className="border px-3 py-1.5 rounded text-xs">Cancel</button>
    </form>
  );
}

function AddOptionForm({ onSubmit, onCancel }) {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 mt-2">
      <input {...register('value', { required: true })} placeholder="Option value (e.g. Red)" className="border rounded px-3 py-1.5 text-sm flex-1" />
      <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs">Add</button>
      <button type="button" onClick={onCancel} className="border px-3 py-1.5 rounded text-xs">Cancel</button>
    </form>
  );
}
