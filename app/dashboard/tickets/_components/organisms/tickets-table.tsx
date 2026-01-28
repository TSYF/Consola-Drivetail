"use client";

import { Ticket } from "@/types/ticket";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface TicketsTableProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onTicketClick: (ticket: Ticket) => void;
  onReorder?: (tickets: Ticket[]) => void;
}

function SortableRow({
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
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "opacity-50" : ""} hover:bg-muted/50`}
    >
      <TableCell>
        <button
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{ticket.id}</TableCell>
      <TableCell
        className="cursor-pointer"
        onClick={() => onTicketClick(ticket)}
      >
        <div className="max-w-50">
          <div className="font-medium truncate">{ticket.nombre}</div>
          {ticket.description && (
            <div className="text-sm text-muted-foreground truncate">
              {ticket.description}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{ticket.estado.nombre}</Badge>
      </TableCell>
      <TableCell>
        {ticket.importancia && (
          <Badge className={getImportanciaColor(ticket.importancia.nombre)}>
            {ticket.importancia.nombre}
          </Badge>
        )}
      </TableCell>
      <TableCell>
        {ticket.urgencia && (
          <Badge className={getUrgenciaColor(ticket.urgencia.nombre)}>
            {ticket.urgencia.nombre}
          </Badge>
        )}
      </TableCell>
      <TableCell>{ticket.servicio?.nombre || "-"}</TableCell>
      <TableCell>{ticket.user?.name || "Sin asignar"}</TableCell>
      <TableCell>
        {ticket.reserva ? (
          <div className="text-sm">
            <div className="font-medium">#{ticket.reserva.id}</div>
            <div className="text-muted-foreground text-xs">
              {new Date(ticket.reserva.fecha_inicio).toLocaleDateString()}
            </div>
          </div>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>
        {ticket.desde ? new Date(ticket.desde).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell>
        {ticket.hasta ? new Date(ticket.hasta).toLocaleDateString() : "-"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(ticket);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(ticket);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function TicketsTable({
  tickets: initialTickets,
  onEdit,
  onDelete,
  onTicketClick,
  onReorder,
}: TicketsTableProps) {
  const [tickets, setTickets] = useState(initialTickets);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTickets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        onReorder?.(newOrder);
        return newOrder;
      });
    }
  }

  // Update local state when prop changes
  if (initialTickets !== tickets) {
    setTickets(initialTickets);
  }

  return (
    <div className="rounded-md border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Importancia</TableHead>
              <TableHead>Urgencia</TableHead>
              <TableHead>Servicio</TableHead>
              <TableHead>Asignado a</TableHead>
              <TableHead>Reserva</TableHead>
              <TableHead>Desde</TableHead>
              <TableHead>Hasta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={12}
                  className="text-center text-muted-foreground"
                >
                  No hay tickets disponibles
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={tickets}
                strategy={verticalListSortingStrategy}
              >
                {tickets.map((ticket) => (
                  <SortableRow
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTicketClick={onTicketClick}
                  />
                ))}
              </SortableContext>
            )}
          </TableBody>
        </Table>
      </DndContext>
    </div>
  );
}
