import ProductCard from '../common/ProductCard';
import EmptyState from '../common/EmptyState';

export default function ProductGrid({ products = [] }) {
  if (products.length === 0) {
    return <EmptyState message="No products found" />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
