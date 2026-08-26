import { useNavigate } from 'react-router-dom';

export default function CartSummary({ summary, onClear }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Items</span>
          <span>{summary.totalItems}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span>${summary.totalAmount?.toFixed(2)}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">Checkout coming soon</p>
      <button
        onClick={onClear}
        className="w-full mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-md text-sm hover:bg-red-50"
      >
        Clear Cart
      </button>
    </div>
  );
}
