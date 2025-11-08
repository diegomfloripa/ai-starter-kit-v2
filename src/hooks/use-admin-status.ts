import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';

interface AdminStatus {
  isAdmin: boolean;
  email?: string;
  userId?: string;
}

export const useAdminStatus = () => {
  const { data, isLoading, error } = useQuery<AdminStatus>({
    queryKey: ['adminStatus'],
    queryFn: async () => {
      try {
        // The api.get function returns the JSON data directly
        return await api.get<AdminStatus>('/api/admin/verify');
      } catch (err) {
        // The API returns 401 for non-logged-in users and 200 OK with isAdmin: false for non-admins.
        // We treat 401/403 as a definitive "not admin" state for the UI.
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          return { isAdmin: false };
        }
        // Re-throw other errors to let react-query handle them
        throw err;
      }
    },
    retry: false, // Don't retry on auth errors
  });

  return {
    isAdmin: data?.isAdmin || false,
    isLoading,
    error,
  };
};
