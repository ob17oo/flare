import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllOrders, updateOrderStatus, deleteOrder } from "../api/orders.action";

export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  lists: () => [...adminOrderKeys.all, 'list'] as const,
};

export function useAdminOrders(initialData?: any[]) {
  return useQuery({
    queryKey: adminOrderKeys.lists(),
    queryFn: () => getAllOrders(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: any }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
    }
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrderKeys.all });
    }
  });
}
