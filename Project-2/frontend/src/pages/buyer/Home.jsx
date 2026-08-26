import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import productApi from '../../services/product.api';
import categoryApi from '../../services/category.api';
import ProductGrid from '../../components/product/ProductGrid';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function Home() {
  const { data: prodRes, isLoading: prodLoading, error: prodError, refetch: prodRefetch } = useQuery({
    queryKey: ['products', { page: 1, limit: 8 }],
    queryFn: () => productApi.getProducts({ page: 1, limit: 8 }),
  });

  const { data: catRes, isLoading: catLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const products = prodRes?.data?.data?.items || [];
  const categories = catRes?.data?.data?.items || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="bg-blue-600 text-white rounded-xl p-8 md:p-12 mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to the Marketplace</h1>
        <p className="text-blue-100 mb-6 max-w-lg">Discover products from multiple sellers. Browse, compare, and shop with confidence.</p>
        <Link to="/products" className="inline-block bg-white text-blue-600 px-6 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors">
          Browse Products
        </Link>
      </section>

      {/* Categories */}
      {!catLoading && categories.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:border-blue-400 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/products" className="text-sm text-blue-600 hover:underline">View All</Link>
        </div>
        {prodLoading ? (
          <Loading />
        ) : prodError ? (
          <ErrorMessage message="Failed to load products" onRetry={prodRefetch} />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>
    </div>
  );
}
