import { useEffect } from 'react';
import useAuthStore from '../store/auth.store';
import authApi from '../services/auth.api';

export default function useAuth() {
  const { user, isAuthenticated, isLoading, setLoading, setUser, logout } = useAuthStore();

  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data.data);
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    restoreAuth();
  }, [setLoading, setUser, logout]);

  return { user, isAuthenticated, isLoading };
}
