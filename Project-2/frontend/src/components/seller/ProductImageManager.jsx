import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import productImageApi from '../../services/productImage.api';
import Loading from '../common/Loading';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductImageManager({ productId }) {
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const { data, isLoading } = useQuery({
    queryKey: ['productImages', productId],
    queryFn: () => productImageApi.getProductImages(productId),
    enabled: !!productId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file) => productImageApi.uploadProductImage(productId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productImages', productId] }),
  });

  const primaryMutation = useMutation({
    mutationFn: (imageId) => productImageApi.setPrimaryImage(productId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productImages', productId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId) => productImageApi.deleteProductImage(productId, imageId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['productImages', productId] }),
  });

  const images = data?.data?.data || [];

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Images</h2>
        <button onClick={() => fileRef.current?.click()} className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700">
          Upload Image
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
      </div>
      {uploadMutation.isError && <p className="text-red-500 text-sm mb-3">{uploadMutation.error.response?.data?.error?.message || 'Upload failed'}</p>}
      {isLoading ? <Loading /> : images.length === 0 ? (
        <p className="text-sm text-gray-500">No images uploaded yet</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <img src={`${API_BASE}${img.url}`} alt="" className={`w-full aspect-square object-cover rounded border-2 ${img.is_primary ? 'border-blue-500' : 'border-transparent'}`} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center gap-2">
                {!img.is_primary && (
                  <button onClick={() => primaryMutation.mutate(img.id)} className="bg-white text-xs px-2 py-1 rounded">Primary</button>
                )}
                <button onClick={() => { if (window.confirm('Delete?')) deleteMutation.mutate(img.id); }} className="bg-red-500 text-white text-xs px-2 py-1 rounded">Delete</button>
              </div>
              {img.is_primary && <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">Primary</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
