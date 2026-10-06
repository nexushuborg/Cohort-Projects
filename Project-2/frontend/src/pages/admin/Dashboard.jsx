import { useQuery } from '@tanstack/react-query';
import userApi from '../../services/user.api';
import sellerApi from '../../services/seller.api';
import categoryApi from '../../services/category.api';
import productApi from '../../services/product.api';
import Loading from '../../components/common/Loading';

function StatCard({ label, value, loading }) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-sm text-gray-500">{label}</h3>
      <p className="text-3xl font-bold mt-1">
        {loading ? <span className="text-gray-300">...</span> : value}
      </p>
    </div>
  );
}

export default function Dashboard() {
  const { data: usersRes, isLoading: usersLoading } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => userApi.getUsers(),
  });

  const { data: storesRes, isLoading: storesLoading } = useQuery({
    queryKey: ['adminStores'],
    queryFn: () => sellerApi.getStores(),
  });

  const { data: catsRes, isLoading: catsLoading } = useQuery({
    queryKey: ['adminCategories'],
    queryFn: () => categoryApi.getCategories(),
  });

  const { data: prodsRes, isLoading: prodsLoading } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => productApi.getProducts({ limit: 1 }),
  });

  const userCount = usersRes?.data?.data?.items?.length ?? usersRes?.data?.data?.pagination?.total ?? '?';
  const storeCount = storesRes?.data?.data?.items?.length ?? storesRes?.data?.data?.pagination?.total ?? '?';
  const catCount = catsRes?.data?.data?.items?.length ?? '?';
  const prodCount = prodsRes?.data?.data?.pagination?.total ?? prodsRes?.data?.data?.items?.length ?? '?';

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Users" value={userCount} loading={usersLoading} />
        <StatCard label="Stores" value={storeCount} loading={storesLoading} />
        <StatCard label="Categories" value={catCount} loading={catsLoading} />
        <StatCard label="Products" value={prodCount} loading={prodsLoading} />
      </div>
    </div>
  );
}
