import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import metricsService from '@services/metricsService';

export const ADMIN_KEYS = {
  dashboard: () => ['admin', 'dashboard'],
  users: (params) => ['admin', 'users', params],
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ADMIN_KEYS.dashboard(),
    queryFn: metricsService.getAdminDashboard,
    refetchInterval: 45000,
    staleTime: 30000,
  });
};

export const useAdminUsers = (params) => {
  return useQuery({
    queryKey: ADMIN_KEYS.users(params),
    queryFn: () => metricsService.getUsers(params),
    keepPreviousData: true,
    staleTime: 20000,
  });
};

export const useToggleUserStatus = (params) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, active }) => metricsService.updateUserStatus(userId, active),
    onMutate: async ({ userId, active }) => {
      await queryClient.cancelQueries({ queryKey: ADMIN_KEYS.users(params) });
      const previous = queryClient.getQueryData(ADMIN_KEYS.users(params));

      queryClient.setQueryData(ADMIN_KEYS.users(params), (current) => {
        if (!current?.items) return current;
        return {
          ...current,
          items: current.items.map((user) =>
            user.id === userId ? { ...user, active } : user
          ),
        };
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ADMIN_KEYS.users(params), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.users(params) });
      queryClient.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });
    },
  });
};
