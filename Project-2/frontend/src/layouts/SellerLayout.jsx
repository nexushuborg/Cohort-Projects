import { Outlet } from 'react-router-dom';
import SellerSidebar from '../components/seller/SellerSidebar';

export default function SellerLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      <SellerSidebar />
      <div className="flex-1 flex flex-col ml-0 md:ml-56">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
