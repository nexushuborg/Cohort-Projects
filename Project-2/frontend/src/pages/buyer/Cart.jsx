import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import cartApi from '../../services/cart.api';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';

export default function Cart() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, quantity }) => cartApi.updateCartItem(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id) => cartApi.removeCartItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  const cart = data?.data?.data;
  const items = cart?.items || [];
  const summary = cart?.summary || { totalItems: 0, totalAmount: 0 };

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><Loading /></div>;
  if (error) return <div className="max-w-4xl mx-auto px-4 py-8"><ErrorMessage message="Failed to load cart" onRetry={refetch} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState message="Your cart is empty" action="Browse Products" onAction={() => window.location.href = '/products'} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={(id, qty) => updateMutation.mutate({ id, quantity: qty })}
                onRemove={(id) => removeMutation.mutate(id)}
              />
            ))}
          </div>
          <div>
            <CartSummary summary={summary} onClear={() => clearMutation.mutate()} />
          </div>
        </div>
      )}
    </div>
  );
}
