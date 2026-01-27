"use client";

import React from "react";

import { useState, useEffect } from "react";
import { Ticket, EstadoTicket } from "@/types/ticket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface TicketsKanbanProps {
  tickets: Ticket[];
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onUpdate: () => void;
  onTicketClick: (ticket: Ticket) => void;
}

export function TicketsKanban({
  tickets,
  onEdit,
  onDelete,
  onUpdate,
  onTicketClick,
}: TicketsKanbanProps) {
  const [draggedTicket, setDraggedTicket] = useState<Ticket | null>(null);
  const [estados, setEstados] = useState<EstadoTicket[]>([]);

  useEffect(() => {
    fetchEstados();
  }, []);

  const fetchEstados = async () => {
    try {
      const data = await apiClient.get<EstadoTicket[]>("/api/estado-ticket");
      setEstados(data);
    } catch (error) {
      // Silently fail - will fall back to statuses from tickets
    }
  };

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

  const handleDragStart = (ticket: Ticket) => {
    setDraggedTicket(ticket);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatusId: number) => {
    e.preventDefault();
    if (!draggedTicket) return;

    if (draggedTicket.estado?.id === targetStatusId) {
      setDraggedTicket(null);
      return;
    }

    const targetStatus = estados.find((estado) => estado.id === targetStatusId);

    try {
      await apiClient.patch(`/api/ticket/${draggedTicket.id}`, {
        id_estado: targetStatusId,
      });

      toast({
        title: "Ticket actualizado",
        description: <>Estado cambiado a {targetStatus?.nombre || "nuevo estado"}</>,
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudo actualizar el ticket</>,
        variant: "destructive",
      });
    }

    setDraggedTicket(null);
  };

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

  // If estados haven't loaded yet, show nothing or a loading state
  if (estados.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-muted-foreground">Cargando estados...</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {estados.map((estado) => (
        <div
          key={estado.id}
          className="shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, estado.id)}
        >
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground">
                {estado.nombre}
              </h3>
              <Badge variant="secondary">
                {ticketsByStatus[estado.id]?.length || 0}
              </Badge>
            </div>
            <div className="space-y-3">
              {(ticketsByStatus[estado.id] || []).map((ticket) => (
                <Card
                  key={ticket.id}
                  draggable
                  onDragStart={() => handleDragStart(ticket)}
                  className="cursor-move hover:shadow-md transition-shadow"
                  onClick={() => onTicketClick(ticket)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium line-clamp-2">
                        {ticket.nombre}
                      </CardTitle>
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
                    {(ticket.desde || ticket.hasta) && (
                      <div className="text-xs text-muted-foreground mt-2 space-y-1">
                        {ticket.desde && (
                          <div>
                            Desde: {new Date(ticket.desde).toLocaleDateString()}
                          </div>
                        )}
                        {ticket.hasta && (
                          <div>
                            Hasta: {new Date(ticket.hasta).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
