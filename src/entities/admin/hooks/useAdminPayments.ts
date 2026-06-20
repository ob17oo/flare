import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPayments, updatePaymentStatus } from "../api/payments.action";

export const adminPaymentKeys = {
  all: ['admin-payments'] as const,
  lists: () => [...adminPaymentKeys.all, 'list'] as const,
};

export function useAdminPayments(initialData?: Awaited<ReturnType<typeof getAllPayments>>) {
  return useQuery({
    queryKey: adminPaymentKeys.lists(),
    queryFn: () => getAllPayments(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: Parameters<typeof updatePaymentStatus>[1] }) => updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPaymentKeys.all });
    }
  });
}
