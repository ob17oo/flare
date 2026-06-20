import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, updateUser } from "../api/users.action";

export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
};

export function useAdminUsers(initialData?: Awaited<ReturnType<typeof getAllUsers>>) {
  return useQuery({
    queryKey: adminUserKeys.lists(),
    queryFn: () => getAllUsers(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string, data: Parameters<typeof updateUser>[1] }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
    }
  });
}
