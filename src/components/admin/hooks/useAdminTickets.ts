import { supabase } from "../../../lib/supabase";

export const useAdminTickets = (
  tickets: any[],
  setTickets: (tickets: any[]) => void
) => {
  const handleTicketStatus = async (
    ticketId: string,
    newStatus: "open" | "closed"
  ) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) throw error;
      setTickets(
        tickets.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error("Error updating ticket status:", err);
      alert("Error al actualizar el estado del ticket.");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase
        .from("support_tickets")
        .delete()
        .eq("id", ticketId);

      if (error) throw error;
      setTickets(tickets.filter((t) => t.id !== ticketId));
    } catch (err) {
      console.error("Error deleting ticket:", err);
      alert("Error al eliminar el ticket.");
    }
  };

  return { handleTicketStatus, handleDeleteTicket };
};
