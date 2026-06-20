import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../api/products.action";

export const adminProductKeys = {
  all: ['admin-products'] as const,
  lists: () => [...adminProductKeys.all, 'list'] as const,
};

export function useAdminProducts(initialData?: Awaited<ReturnType<typeof getAllProducts>>) {
  return useQuery({
    queryKey: adminProductKeys.lists(),
    queryFn: () => getAllProducts(),
    initialData,
    staleTime: 5 * 60 * 1000, // 5 mins
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createProduct>[0]) => createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    }
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Parameters<typeof updateProduct>[1] }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    }
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminProductKeys.all });
    }
  });
}
