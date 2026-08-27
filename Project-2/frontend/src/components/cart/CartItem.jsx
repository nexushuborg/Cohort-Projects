export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
        <span className="text-xs text-gray-400">SKU</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.productTitle}</p>
        <p className="text-xs text-gray-500">{item.skuCode}</p>
        {item.store && (
          <p className="text-xs text-gray-400">{item.store.name}</p>
        )}
        <p className="text-sm font-semibold mt-1">${item.effectivePrice?.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          className="w-7 h-7 border rounded text-sm hover:bg-gray-100"
        >
          -
        </button>
        <span className="text-sm w-6 text-center">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 border rounded text-sm hover:bg-gray-100"
        >
          +
        </button>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold">${item.subtotal?.toFixed(2)}</p>
        <button
          onClick={() => onRemove(item.id)}
          className="text-xs text-red-500 hover:text-red-700 mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
