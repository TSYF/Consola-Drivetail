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
import { Edit, Trash2 } from "lucide-react";

interface TicketsTableProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketsTable({
  tickets,
  onEdit,
  onDelete,
  onTicketClick,
}: TicketsTableProps) {
  const getImportanciaColor = (importancia?: string) => {
    switch (importancia?.toLowerCase()) {
      case "alta":
      case "high":
        return "bg-red-500";
      case "media":
      case "medium":
        return "bg-yellow-500";
      case "baja":
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUrgenciaColor = (urgencia?: string) => {
    switch (urgencia?.toLowerCase()) {
      case "urgente":
      case "urgent":
        return "bg-red-500";
      case "normal":
        return "bg-blue-500";
      case "baja":
      case "low":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importancia</TableHead>
            <TableHead>Urgencia</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Desde</TableHead>
            <TableHead>Hasta</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-muted-foreground"
              >
                No hay tickets disponibles
              </TableCell>
            </TableRow>
          ) : (
            tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => onTicketClick(ticket)}
              >
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>
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
                    <Badge
                      className={getImportanciaColor(ticket.importancia.nombre)}
                    >
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
                  {ticket.desde
                    ? new Date(ticket.desde).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell>
                  {ticket.hasta
                    ? new Date(ticket.hasta).toLocaleDateString()
                    : "-"}
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
