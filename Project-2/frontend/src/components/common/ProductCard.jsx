import { Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductCard({ product }) {
  const imageUrl = product.images?.[0]?.url
    ? `${API_BASE}${product.images[0].url}`
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-square bg-gray-100 flex items-center justify-center">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{product.title}</h3>
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
        )}
        {product.store && (
          <p className="text-xs text-gray-400 mb-2">{product.store.name}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </span>
          <Link
            to={`/products/${product.id}`}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
