import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTickets, getTicketDetails, updateTicketStatus, assignModerator, replyToTicket } from "../api/support.action";

export const adminSupportKeys = {
  all: ['admin-support'] as const,
  lists: () => [...adminSupportKeys.all, 'list'] as const,
  detail: (id: string) => [...adminSupportKeys.all, 'detail', id] as const,
};

export function useAdminTickets(initialData?: any[]) {
  return useQuery({
    queryKey: adminSupportKeys.lists(),
    queryFn: () => getAllTickets(),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTicketDetails(id: string, initialData?: any) {
  return useQuery({
    queryKey: adminSupportKeys.detail(id),
    queryFn: () => getTicketDetails(id),
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string, status: any }) => updateTicketStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.all });
    }
  });
}

export function useAssignModerator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moderatorId }: { id: string, moderatorId: string }) => assignModerator(id, moderatorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.all });
    }
  });
}

export function useReplyToTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, content }: { ticketId: string, content: string }) => replyToTicket(ticketId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminSupportKeys.all });
    }
  });
}
