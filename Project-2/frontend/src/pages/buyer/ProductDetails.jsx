import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productApi from '../../services/product.api';
import productImageApi from '../../services/productImage.api';
import skuApi from '../../services/sku.api';
import cartApi from '../../services/cart.api';
import useAuthStore from '../../store/auth.store';
import VariantSelector from '../../components/product/VariantSelector';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [addMsg, setAddMsg] = useState('');

  const { data: prodRes, isLoading, error, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });

  const { data: imgRes } = useQuery({
    queryKey: ['productImages', id],
    queryFn: () => productImageApi.getProductImages(id),
    enabled: !!id,
  });

  const { data: skuRes } = useQuery({
    queryKey: ['skus', id],
    queryFn: () => skuApi.getSkus(id),
    enabled: !!id,
  });

  const addMutation = useMutation({
    mutationFn: (data) => cartApi.addCartItem(data),
    onSuccess: () => {
      setAddMsg('Added to cart!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      setTimeout(() => setAddMsg(''), 3000);
    },
    onError: (err) => {
      setAddMsg(err.response?.data?.error?.message || 'Failed to add to cart');
    },
  });

  const product = prodRes?.data?.data;
  const images = imgRes?.data?.data || [];
  const skus = skuRes?.data?.data || [];

  const handleAddToCart = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const sku = skus[0];
    if (!sku) { setAddMsg('No SKU available'); return; }
    addMutation.mutate({ skuId: sku.id, quantity });
  };

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-8"><Loading /></div>;
  if (error) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message="Product not found" onRetry={refetch} /></div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-8"><ErrorMessage message="Product not found" /></div>;

  const primaryImg = images.find((img) => img.is_primary) || images[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-4">
            {primaryImg ? (
              <img src={`${API_BASE}${primaryImg.url}`} alt={product.title} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <span className="text-gray-400">No image</span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img) => (
                <img key={img.id} src={`${API_BASE}${img.url}`} alt="" className="w-16 h-16 object-cover rounded border" />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h1>
          {product.brand && <p className="text-sm text-gray-500 mb-1">{product.brand}</p>}
          {product.store && <p className="text-sm text-gray-400 mb-4">Sold by {product.store.name}</p>}
          <p className="text-3xl font-bold text-gray-900 mb-4">${Number(product.price).toFixed(2)}</p>
          {product.description && <p className="text-gray-600 text-sm mb-6">{product.description}</p>}

          <VariantSelector
            productId={id}
            selectedOptions={selectedOptions}
            onSelect={setSelectedOptions}
          />

          {skus.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              {skus[0].stock_quantity > 0 ? (
                <span className="text-green-600">In stock ({skus[0].stock_quantity} available)</span>
              ) : (
                <span className="text-red-500">Out of stock</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mt-6">
            <label className="text-sm text-gray-700">Qty:</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-16 border border-gray-300 rounded px-2 py-1 text-sm"
            />
            <button
              onClick={handleAddToCart}
              disabled={addMutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {addMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
          {addMsg && (
            <p className={`text-sm mt-2 ${addMsg.includes('Failed') || addMsg.includes('No SKU') ? 'text-red-500' : 'text-green-600'}`}>
              {addMsg}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
