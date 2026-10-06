import { useQuery } from '@tanstack/react-query';
import variantApi from '../../services/variant.api';

export default function VariantSelector({ productId, selectedOptions, onSelect }) {
  const { data, isLoading } = useQuery({
    queryKey: ['variants', productId],
    queryFn: () => variantApi.getVariants(productId),
    enabled: !!productId,
  });

  const variantTypes = data?.data?.data || [];

  if (isLoading) return <p className="text-sm text-gray-500">Loading variants...</p>;
  if (variantTypes.length === 0) return null;

  return (
    <div className="space-y-3">
      {variantTypes.map((vt) => (
        <div key={vt.id}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{vt.name}</label>
          <div className="flex flex-wrap gap-2">
            {(vt.options || []).map((opt) => (
              <button
                key={opt.id}
                onClick={() => onSelect({ ...selectedOptions, [vt.name]: opt.value })}
                className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                  selectedOptions?.[vt.name] === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {opt.value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
