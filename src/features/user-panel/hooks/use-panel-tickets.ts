import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PANEL_TICKETS_QUERY_KEY } from "../constants/user-panel.constants";
import { userPanelService } from "../services/user-panel.service";
import type { PanelTicket } from "../types/panel-ticket.types";
export function usePanelTickets() {
  const client = useQueryClient();
  const query = useQuery({
    queryKey: PANEL_TICKETS_QUERY_KEY,
    queryFn: userPanelService.getTickets,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const create = useMutation({
    mutationFn: userPanelService.createTicket,
    retry: false,
    onSuccess: (ticket) => {
      client.setQueryData<PanelTicket[]>(PANEL_TICKETS_QUERY_KEY, (current) => [
        ticket,
        ...(current ?? []).filter((item) => item.id !== ticket.id),
      ]);
      client.setQueryData(["user-panel", "ticket-detail", ticket.code], ticket);
    },
  });
  const reply = useMutation({
    mutationFn: userPanelService.replyToTicket,
    retry: false,
    onSuccess: (updated, input) => {
      client.setQueryData<PanelTicket[]>(PANEL_TICKETS_QUERY_KEY, (current) =>
        current?.map((ticket) =>
          ticket.id === input.ticket.id ? updated : ticket,
        ),
      );
      if (updated.fromBackend)
        client.setQueryData(["user-panel", "ticket-detail", updated.code], updated);
    },
  });
  return { ...query, create, reply };
}
