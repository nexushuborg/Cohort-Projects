import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import inventoryApi from '../../services/inventory.api';
import skuApi from '../../services/sku.api';
import Loading from '../common/Loading';

export default function InventoryManager({ productId }) {
  const queryClient = useQueryClient();
  const [adjusting, setAdjusting] = useState(null);
  const [setValue, setSetValue] = useState({});

  const { data: invRes, isLoading: invLoading } = useQuery({
    queryKey: ['inventory', productId],
    queryFn: () => inventoryApi.getInventory(productId),
    enabled: !!productId,
  });

  const { data: skuRes } = useQuery({
    queryKey: ['skus', productId],
    queryFn: () => skuApi.getSkus(productId),
    enabled: !!productId,
  });

  const setMutation = useMutation({
    mutationFn: ({ skuId, quantity }) => inventoryApi.setInventory(productId, skuId, { quantity }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory', productId] }); setSetValue({}); },
  });

  const adjustMutation = useMutation({
    mutationFn: ({ skuId, quantity }) => inventoryApi.adjustInventory(productId, skuId, { quantity }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['inventory', productId] }); setAdjusting(null); },
  });

  const inventory = invRes?.data?.data || [];
  const skus = skuRes?.data?.data || [];

  if (invLoading) return <Loading />;

  // Build inventory map
  const invMap = {};
  inventory.forEach((inv) => { invMap[inv.sku_id || inv.id] = inv; });

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Inventory</h2>
      {skus.length === 0 ? (
        <p className="text-sm text-gray-500">Create SKUs first to manage inventory</p>
      ) : (
        <div className="space-y-2">
          {skus.map((sku) => {
            const inv = invMap[sku.id];
            const stock = inv?.stock_quantity ?? sku.stock_quantity ?? 0;
            return (
              <div key={sku.id} className="border rounded p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-mono">{sku.sku_code}</span>
                    <span className="ml-3 font-semibold">{stock} in stock</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAdjusting(adjusting === sku.id ? null : sku.id)} className="text-xs text-blue-600 hover:underline">Adjust</button>
                  </div>
                </div>
                {/* Set stock */}
                <div className="flex gap-2 mt-2 items-center">
                  <input
                    type="number" min="0"
                    placeholder="Set stock"
                    value={setValue[sku.id] || ''}
                    onChange={(e) => setSetValue({ ...setValue, [sku.id]: e.target.value })}
                    className="border rounded px-2 py-1 text-sm w-28"
                  />
                  <button
                    onClick={() => { if (setValue[sku.id] !== '') setMutation.mutate({ skuId: sku.id, quantity: parseInt(setValue[sku.id]) }); }}
                    className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                  >Set</button>
                </div>
                {/* Adjust stock */}
                {adjusting === sku.id && (
                  <div className="flex gap-2 mt-2 items-center">
                    <input
                      type="number"
                      placeholder="+/- amount"
                      className="border rounded px-2 py-1 text-sm w-28"
                      id={`adj-${sku.id}`}
                    />
                    <button
                      onClick={() => {
                        const el = document.getElementById(`adj-${sku.id}`);
                        const val = parseInt(el.value);
                        if (!isNaN(val)) adjustMutation.mutate({ skuId: sku.id, quantity: val });
                      }}
                      className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                    >Apply</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
