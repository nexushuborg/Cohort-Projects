import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import productApi from '../../services/product.api';
import categoryApi from '../../services/category.api';
import ProductImageManager from '../../components/seller/ProductImageManager';
import VariantManager from '../../components/seller/VariantManager';
import SkuManager from '../../components/seller/SkuManager';
import InventoryManager from '../../components/seller/InventoryManager';
import Loading from '../../components/common/Loading';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: prodRes, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProduct(id),
    enabled: !!id,
  });

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const updateMutation = useMutation({
    mutationFn: (d) => productApi.updateProduct(id, d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['sellerProducts'] });
    },
  });

  const product = prodRes?.data?.data;
  const categories = catRes?.data?.data?.items || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: product ? {
      title: product.title || '',
      description: product.description || '',
      brand: product.brand || '',
      price: product.price || '',
      categoryId: product.category_id || product.categoryId || '',
      status: product.status || 'draft',
    } : undefined,
  });

  if (isLoading) return <Loading />;
  if (!product) return <div className="text-center py-12 text-gray-500">Product not found</div>;

  const onSubmit = (data) => {
    updateMutation.mutate({
      title: data.title,
      description: data.description || null,
      brand: data.brand || null,
      price: parseFloat(data.price),
      categoryId: data.categoryId || null,
      status: data.status,
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/seller/products')} className="text-gray-500 hover:text-gray-700 text-sm">&larr; Products</button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>

      {updateMutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {updateMutation.error.response?.data?.error?.message || 'Update failed'}
        </div>
      )}
      {updateMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 text-sm">Saved!</div>
      )}

      {/* Product Info */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border p-6 space-y-4 mb-6">
        <h2 className="font-semibold text-gray-900">Product Information</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input {...register('title', { required: 'Required', minLength: { value: 3, message: 'Min 3 chars' } })}
            className="w-full border rounded-md px-3 py-2 text-sm" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input type="number" step="0.01" min="0.01" {...register('price', { required: 'Required', min: { value: 0.01, message: 'Min 0.01' } })}
              className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input {...register('brand')} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('categoryId')} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select {...register('status')} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={updateMutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
          {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Images */}
      <div className="mb-6">
        <ProductImageManager productId={id} />
      </div>

      {/* Variants */}
      <div className="mb-6">
        <VariantManager productId={id} />
      </div>

      {/* SKUs */}
      <div className="mb-6">
        <SkuManager productId={id} />
      </div>

      {/* Inventory */}
      <div className="mb-6">
        <InventoryManager productId={id} />
      </div>
    </div>
  );
}
