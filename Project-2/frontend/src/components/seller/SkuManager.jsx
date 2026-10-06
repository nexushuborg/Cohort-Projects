import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import skuApi from '../../services/sku.api';
import variantApi from '../../services/variant.api';
import Loading from '../common/Loading';

export default function SkuManager({ productId }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data: skuRes, isLoading: skuLoading } = useQuery({
    queryKey: ['skus', productId],
    queryFn: () => skuApi.getSkus(productId),
    enabled: !!productId,
  });

  const { data: varRes } = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantApi.getVariants(productId),
    enabled: !!productId,
  });

  // Flatten all variant options for selection
  const variantTypes = varRes?.data?.data || [];
  const allOptions = variantTypes.flatMap((vt) =>
    (vt.options || []).map((opt) => ({ ...opt, variantTypeName: vt.name }))
  );

  const createMutation = useMutation({
    mutationFn: (d) => skuApi.createSku(productId, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['skus', productId] }); setAdding(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ skuId, ...d }) => skuApi.updateSku(productId, skuId, d),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['skus', productId] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (skuId) => skuApi.deleteSku(productId, skuId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skus', productId] }),
  });

  const skus = skuRes?.data?.data || [];

  if (skuLoading) return <Loading />;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">SKUs</h2>
        <button onClick={() => setAdding(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          Add SKU
        </button>
      </div>

      {adding && (
        <SkuForm
          options={allOptions}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setAdding(false)}
          error={createMutation.isError ? createMutation.error.response?.data?.error?.message : null}
        />
      )}

      {skus.length === 0 ? (
        <p className="text-sm text-gray-500">No SKUs yet</p>
      ) : (
        <div className="space-y-2">
          {skus.map((sku) => (
            <div key={sku.id} className="border rounded p-3 flex items-center justify-between">
              {editing === sku.id ? (
                <SkuForm
                  initial={sku}
                  options={allOptions}
                  onSubmit={(d) => updateMutation.mutate({ skuId: sku.id, ...d })}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="text-sm">
                  <span className="font-mono font-medium">{sku.sku_code}</span>
                  {sku.price_override != null && <span className="ml-2 text-gray-500">${Number(sku.price_override).toFixed(2)}</span>}
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                    sku.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>{sku.status}</span>
                  {sku.variant_options && sku.variant_options.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({sku.variant_options.map((v) => v.value).join(' / ')})
                    </span>
                  )}
                </div>
              )}
              <div className="flex gap-2">
                {editing !== sku.id && <button onClick={() => setEditing(sku.id)} className="text-xs text-blue-600 hover:underline">Edit</button>}
                <button onClick={() => { if (window.confirm('Delete SKU?')) deleteMutation.mutate(sku.id); }} className="text-xs text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SkuForm({ initial, options, onSubmit, onCancel, error }) {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      skuCode: initial?.sku_code || '',
      priceOverride: initial?.price_override ?? '',
      status: initial?.status || 'draft',
      variantOptionIds: initial?.variant_options?.map((v) => v.id) || [],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 w-full">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-3">
        <input {...register('skuCode', { required: true })} placeholder="SKU Code *" className="border rounded px-3 py-1.5 text-sm" />
        <input type="number" step="0.01" min="0" {...register('priceOverride')} placeholder="Price Override (optional)" className="border rounded px-3 py-1.5 text-sm" />
      </div>
      <select {...register('status')} className="border rounded px-3 py-1.5 text-sm w-full">
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      {options.length > 0 && (
        <div>
          <label className="block text-xs text-gray-500 mb-1">Variant Options</label>
          <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
              <label key={opt.id} className="flex items-center gap-1 text-xs bg-gray-50 border rounded px-2 py-1">
                <input type="checkbox" value={opt.id} {...register('variantOptionIds')} />
                {opt.variantTypeName}: {opt.value}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm">Save</button>
        <button type="button" onClick={onCancel} className="border px-3 py-1.5 rounded text-sm">Cancel</button>
      </div>
    </form>
  );
}
