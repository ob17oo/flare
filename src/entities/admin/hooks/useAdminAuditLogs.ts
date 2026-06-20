import { useQuery } from "@tanstack/react-query";
import { getAllAuditLogs } from "../api/audit.action";

export const adminAuditKeys = {
  all: ['admin-audit'] as const,
  lists: () => [...adminAuditKeys.all, 'list'] as const,
};

export function useAdminAuditLogs(initialData?: Awaited<ReturnType<typeof getAllAuditLogs>>) {
  return useQuery({
    queryKey: adminAuditKeys.lists(),
    queryFn: () => getAllAuditLogs(),
    initialData,
    staleTime: 60 * 1000,
  });
}
