import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllPromocodes, createPromocode, updatePromocode, deletePromocode } from "../api/promocodes.action";

export const adminPromocodeKeys = {
  all: ['admin-promocodes'] as const,
  lists: () => [...adminPromocodeKeys.all, 'list'] as const,
};

export function useAdminPromocodes(initialData?: Awaited<ReturnType<typeof getAllPromocodes>>) {
  return useQuery({
    queryKey: adminPromocodeKeys.lists(),
    queryFn: () => getAllPromocodes(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePromocode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createPromocode>[0]) => createPromocode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromocodeKeys.all });
    }
  });
}

export function useUpdatePromocode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Parameters<typeof updatePromocode>[1] }) => updatePromocode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromocodeKeys.all });
    }
  });
}

export function useDeletePromocode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePromocode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPromocodeKeys.all });
    }
  });
}
