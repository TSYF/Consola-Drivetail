"use client";

import { useState, useEffect } from "react";
import { Ticket } from "@/types/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTicketsReferenceData } from "../context/tickets-reference-data-context";

interface TicketsKanbanProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onUpdate: () => void;
  onTicketClick: (ticket: Ticket) => void;
}

function SortableTicketCard({
  ticket,
  onEdit,
  onDelete,
  onTicketClick,
}: {
  ticket: Ticket;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onTicketClick: (ticket: Ticket) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getImportanciaColor = (importancia?: string) => {
    switch (importancia?.toLowerCase()) {
      case "alta":
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "media":
      case "medium":
        return "bg-[#F59E0B] text-white"; // Orange from mobile app
      case "baja":
      case "low":
        return "bg-[#22C55E] text-white"; // Green from mobile app
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getUrgenciaColor = (urgencia?: string) => {
    switch (urgencia?.toLowerCase()) {
      case "urgente":
      case "urgent":
        return "bg-destructive text-destructive-foreground";
      case "normal":
        return "bg-primary text-primary-foreground"; // Blue from mobile app
      case "baja":
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${
        isDragging ? "opacity-50 z-50" : ""
      } hover:shadow-md transition-shadow cursor-pointer`}
      {...attributes}
      {...listeners}
      onClick={() => onTicketClick(ticket)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <CardTitle className="text-sm font-medium line-clamp-2 flex-1">
              {ticket.nombre}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(ticket);
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(ticket);
              }}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {ticket.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {ticket.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ticket.importancia && (
            <Badge
              className={`${getImportanciaColor(ticket.importancia.nombre)} text-xs`}
            >
              {ticket.importancia.nombre}
            </Badge>
          )}
          {ticket.urgencia && (
            <Badge
              className={`${getUrgenciaColor(ticket.urgencia.nombre)} text-xs`}
            >
              {ticket.urgencia.nombre}
            </Badge>
          )}
        </div>
        {ticket.servicio && (
          <p className="text-xs text-muted-foreground mt-2">
            {ticket.servicio.nombre}
          </p>
        )}
        {ticket.user && (
          <p className="text-xs text-muted-foreground mt-2">
            Asignado: {ticket.user.name}
          </p>
        )}
        {ticket.reserva && (
          <p className="text-xs text-muted-foreground mt-2">
            Reserva: #{ticket.reserva.id} -{" "}
            {new Date(ticket.reserva.fecha_inicio).toLocaleDateString()}
          </p>
        )}
        {(ticket.desde || ticket.hasta) && (
          <div className="text-xs text-muted-foreground mt-2 space-y-1">
            {ticket.desde && (
              <div>Desde: {new Date(ticket.desde).toLocaleDateString()}</div>
            )}
            {ticket.hasta && (
              <div>Hasta: {new Date(ticket.hasta).toLocaleDateString()}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DroppableColumn({
  id,
  title,
  tickets,
  onEdit,
  onDelete,
  onTicketClick,
}: {
  id: number;
  title: string;
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onTicketClick: (ticket: Ticket) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${id}`,
  });

  return (
    <div className="shrink-0 w-80">
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm uppercase text-muted-foreground">
            {title}
          </h3>
          <Badge variant="secondary">{tickets.length}</Badge>
        </div>
        <div
          ref={setNodeRef}
          className={`space-y-3 min-h-[200px] ${isOver ? "bg-primary/10 rounded-lg" : ""}`}
        >
          {tickets.map((ticket) => (
            <SortableTicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={onEdit}
              onDelete={onDelete}
              onTicketClick={onTicketClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TicketsKanban({
  tickets: initialTickets,
  onEdit,
  onDelete,
  onUpdate,
  onTicketClick,
}: TicketsKanbanProps) {
  const [tickets, setTickets] = useState(initialTickets);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [originalStatusId, setOriginalStatusId] = useState<number | null>(null);
  const { estados } = useTicketsReferenceData();

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Group tickets by estado
  const ticketsByStatus = tickets.reduce(
    (acc, ticket) => {
      const statusId = ticket.estado?.id;
      if (!statusId) return acc;
      if (!acc[statusId]) {
        acc[statusId] = [];
      }
      acc[statusId].push(ticket);
      return acc;
    },
    {} as Record<number, Ticket[]>,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const ticket = tickets.find((t) => t.id === active.id);
    setActiveTicket(ticket || null);
    // Store the original status ID before any updates
    setOriginalStatusId(ticket?.estado?.id || ticket?.id_estado || null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find which column we're over
    const overColumnId = String(overId).startsWith("column-")
      ? parseInt(String(overId).replace("column-", ""))
      : tickets.find((t) => t.id === overId)?.estado?.id;

    if (!overColumnId) return;

    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) return;

    // If moving to a different column
    if (activeTicket.estado?.id !== overColumnId) {
      setTickets((items) => {
        return items.map((ticket) =>
          ticket.id === activeId
            ? {
                ...ticket,
                id_estado: overColumnId,
                estado: estados.find((e) => e.id === overColumnId)!,
              }
            : ticket,
        );
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over) {
      setOriginalStatusId(null);
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    const activeTicket = tickets.find((t) => t.id === activeId);
    if (!activeTicket) {
      setOriginalStatusId(null);
      return;
    }

    // Determine target column
    const targetColumnId = String(overId).startsWith("column-")
      ? parseInt(String(overId).replace("column-", ""))
      : tickets.find((t) => t.id === overId)?.estado?.id;

    if (!targetColumnId) {
      setOriginalStatusId(null);
      return;
    }

    // Update backend if status changed (compare with original status, not current)
    if (originalStatusId !== null && originalStatusId !== targetColumnId) {
      const targetStatus = estados.find(
        (estado) => estado.id === targetColumnId,
      );

      apiClient
        .patch(`/api/ticket/${activeTicket.id}`, {
          id_estado: targetColumnId,
        })
        .then(() => {
          toast({
            title: "Ticket actualizado",
            description: (
              <>Estado cambiado a {targetStatus?.nombre || "nuevo estado"}</>
            ),
          });
          onUpdate();
          setOriginalStatusId(null);
        })
        .catch(() => {
          toast({
            title: "Error",
            description: <>No se pudo actualizar el ticket</>,
            variant: "destructive",
          });
          // Revert on error
          setTickets(initialTickets);
          setOriginalStatusId(null);
        });
    } else {
      setOriginalStatusId(null);
    }
  }

  // If estados haven't loaded yet, show nothing or a loading state
  if (estados.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Cargando estados...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tickets} strategy={verticalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {estados.map((estado) => (
            <DroppableColumn
              key={estado.id}
              id={estado.id}
              title={estado.nombre}
              tickets={ticketsByStatus[estado.id] || []}
              onEdit={onEdit}
              onDelete={onDelete}
              onTicketClick={onTicketClick}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeTicket && (
          <Card className="w-80 opacity-90 rotate-3 cursor-grabbing">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                {activeTicket.nombre}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
      </DragOverlay>
    </DndContext>
  );
}
