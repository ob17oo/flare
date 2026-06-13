import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllBanners, createBanner, updateBanner, deleteBanner } from "../api/marketing.action";

export const adminBannerKeys = {
  all: ['admin-banners'] as const,
  lists: () => [...adminBannerKeys.all, 'list'] as const,
};

export function useAdminBanners(initialData?: any[]) {
  return useQuery({
    queryKey: adminBannerKeys.lists(),
    queryFn: () => getAllBanners(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    }
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    }
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminBannerKeys.all });
    }
  });
}
