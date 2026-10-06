import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import sellerApi from '../../services/seller.api';
import productApi from '../../services/product.api';
import categoryApi from '../../services/category.api';
import Loading from '../../components/common/Loading';

export default function AddProduct() {
  const navigate = useNavigate();

  const { data: storeRes, isLoading: storeLoading } = useQuery({
    queryKey: ['sellerStore'],
    queryFn: () => sellerApi.getMyStore(),
  });

  const { data: catRes } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const store = storeRes?.data?.data;
  const categories = catRes?.data?.data?.items || [];

  const mutation = useMutation({
    mutationFn: (d) => productApi.createProduct(d),
    onSuccess: (res) => {
      const id = res.data?.data?.id;
      navigate(id ? `/seller/products/${id}/edit` : '/seller/products');
    },
  });

  const { register, handleSubmit, formState: { errors } } = useForm();

  if (storeLoading) return <Loading />;
  if (!store) return <div className="text-center py-12 text-gray-500">Create a store first.</div>;

  const onSubmit = (data) => {
    mutation.mutate({
      storeId: store.id,
      title: data.title,
      description: data.description || null,
      brand: data.brand || null,
      price: parseFloat(data.price),
      categoryId: data.categoryId || null,
      status: data.status || 'draft',
    });
  };

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {mutation.error.response?.data?.error?.message || 'Failed to create product'}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'Min 3 chars' } })}
            className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Product title" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea {...register('description')} rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input type="number" step="0.01" min="0.01" {...register('price', { required: 'Price is required', min: { value: 0.01, message: 'Min 0.01' } })}
              className="w-full border rounded-md px-3 py-2 text-sm" placeholder="0.00" />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input {...register('brand')} className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
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
          </select>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/seller/products')} className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}
