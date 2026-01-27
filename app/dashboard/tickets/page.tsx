"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Ticket,
  TicketFilters,
  EstadoTicket,
  ImportanciaTicket,
  UrgenciaTicket,
} from "@/types/ticket";
import { Servicio } from "@/types/servicio";
import { User } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { TicketsTable } from "@/app/dashboard/tickets/_components/organisms/tickets-table";
import { TicketsKanban } from "@/app/dashboard/tickets/_components/organisms/tickets-kanban";
import { TicketModal } from "@/app/dashboard/tickets/_components/organisms/ticket-modal";
import { TicketDetailSheet } from "@/app/dashboard/tickets/_components/organisms/ticket-detail-sheet";
import { DeleteTicketDialog } from "@/app/dashboard/tickets/_components/organisms/delete-ticket-dialog";
import { TicketsToolbar } from "@/app/dashboard/tickets/_components/organisms/tickets-toolbar";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/hooks/use-toast";
import { LayoutGrid, Plus, Table } from "lucide-react";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | undefined>();
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filtering state
  const [filters, setFilters] = useState<TicketFilters>({});

  // Detail sheet state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  // Filter options state
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [importancias, setImportancias] = useState<ImportanciaTicket[]>([]);
  const [urgencias, setUrgencias] = useState<UrgenciaTicket[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchTickets = async () => {
    try {
      const data = await apiClient.get<Ticket[]>("/api/ticket");
      setTickets(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudieron cargar los tickets</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [
        estadosData,
        importanciasData,
        urgenciasData,
        serviciosData,
        usersData,
      ] = await Promise.all([
        apiClient.get<EstadoTicket[]>("/api/estado-ticket"),
        apiClient.get<ImportanciaTicket[]>("/api/importancia-ticket"),
        apiClient.get<UrgenciaTicket[]>("/api/urgencia-ticket"),
        apiClient.get<Servicio[]>("/api/servicio"),
        apiClient.get<{ users: User[] } | User[]>("/api/auth/admin/list-users"),
      ]);

      setEstados(estadosData);
      setImportancias(importanciasData);
      setUrgencias(urgenciasData);
      setServicios(serviciosData);
      // Handle both response structures
      setUsers(Array.isArray(usersData) ? usersData : usersData.users);
    } catch (error) {
      // Silently fail - filters will just be empty
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchFilterOptions();
  }, []);

  // Apply filters to tickets
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (ticket) =>
          ticket.nombre.toLowerCase().includes(searchLower) ||
          ticket.description?.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (filters.status?.length) {
      result = result.filter(
        (ticket) =>
          ticket.estado?.id && filters.status!.includes(ticket.estado.id),
      );
    }

    // Importance filter
    if (filters.importance?.length) {
      result = result.filter(
        (ticket) =>
          ticket.importancia?.id &&
          filters.importance!.includes(ticket.importancia.id),
      );
    }

    // Urgency filter
    if (filters.urgency?.length) {
      result = result.filter(
        (ticket) =>
          ticket.urgencia?.id && filters.urgency!.includes(ticket.urgencia.id),
      );
    }

    // Service filter
    if (filters.service?.length) {
      result = result.filter((ticket) =>
        filters.service!.includes(ticket.id_servicio),
      );
    }

    // User filter
    if (filters.user?.length) {
      result = result.filter(
        (ticket) => ticket.id_user && filters.user!.includes(ticket.id_user),
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      result = result.filter(
        (ticket) =>
          ticket.desde && new Date(ticket.desde) >= new Date(filters.dateFrom!),
      );
    }

    if (filters.dateTo) {
      result = result.filter(
        (ticket) =>
          ticket.hasta && new Date(ticket.hasta) <= new Date(filters.dateTo!),
      );
    }

    return result;
  }, [tickets, filters]);

  const handleCreate = () => {
    setEditingTicket(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setIsModalOpen(true);
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDetailSheetOpen(true);
  };

  const handleDeleteClick = (ticket: Ticket) => {
    setTicketToDelete(ticket);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!ticketToDelete) return;

    try {
      await apiClient.delete(`/api/ticket/${ticketToDelete.id}`);
      toast({
        title: "Ticket eliminado",
        description: <>El ticket ha sido eliminado exitosamente</>,
      });
      fetchTickets();
      setIsDeleteDialogOpen(false);
      setIsDetailSheetOpen(false);
      setTicketToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudo eliminar el ticket</>,
        variant: "destructive",
      });
    }
  };

  const handleSave = async (data: {
    nombre: string;
    description?: string;
    desde?: string;
    hasta?: string;
    id_servicio: number;
    id_user?: string;
    id_estado: number;
    id_importancia?: number;
    id_urgencia?: number;
  }) => {
    try {
      if (editingTicket) {
        await apiClient.patch(`/api/ticket/${editingTicket.id}`, data);
        toast({
          title: "Ticket actualizado",
          description: <>El ticket ha sido actualizado exitosamente</>,
        });
      } else {
        await apiClient.post("/api/ticket", data);
        toast({
          title: "Ticket creado",
          description: <>El ticket ha sido creado exitosamente</>,
        });
      }
      fetchTickets();
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudo guardar el ticket</>,
        variant: "destructive",
      });
      throw error;
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.status?.length ||
    filters.importance?.length ||
    filters.urgency?.length ||
    filters.service?.length ||
    filters.user?.length ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los tickets del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "kanban" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("kanban")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Ticket
          </Button>
        </div>
      </div>

      <TicketsToolbar
        onFilterChange={setFilters}
        activeFilters={filters}
        estados={estados}
        importancias={importancias}
        urgencias={urgencias}
        servicios={servicios}
        users={users}
      />

      {hasActiveFilters && (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredTickets.length} de {tickets.length} tickets
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : filteredTickets.length === 0 && tickets.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-muted-foreground">
            No se encontraron tickets con los filtros aplicados
          </p>
          <Button variant="outline" onClick={() => setFilters({})}>
            Limpiar filtros
          </Button>
        </div>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <p className="text-muted-foreground">No hay tickets creados</p>
          <Button onClick={handleCreate}>Crear primer ticket</Button>
        </div>
      ) : viewMode === "table" ? (
        <TicketsTable
          tickets={filteredTickets}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onTicketClick={handleTicketClick}
        />
      ) : (
        <TicketsKanban
          tickets={filteredTickets}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onUpdate={fetchTickets}
          onTicketClick={handleTicketClick}
        />
      )}

      <TicketModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        ticket={editingTicket}
        onSave={handleSave}
      />

      <TicketDetailSheet
        ticket={selectedTicket}
        open={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        onEdit={(ticket) => {
          setEditingTicket(ticket);
          setIsModalOpen(true);
        }}
        onDelete={handleDeleteClick}
        onUpdate={fetchTickets}
      />

      <DeleteTicketDialog
        ticket={ticketToDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
