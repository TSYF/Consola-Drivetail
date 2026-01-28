"use client";

import React from "react";

import { Ticket, EstadoTicket } from "@/types/ticket";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Edit, Trash2, Calendar, User, Package, Car, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface TicketDetailSheetProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (ticket: Ticket) => void;
  onDelete: (ticket: Ticket) => void;
  onUpdate: () => void;
  onViewReservation?: (reservaId: number) => void;
}

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  onUpdate,
  onViewReservation,
}: TicketDetailSheetProps) {
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (open) {
      fetchEstados();
    }
  }, [open]);

  const fetchEstados = async () => {
    try {
      const data = await apiClient.get<EstadoTicket[]>("/api/estado-ticket");
      setEstados(data);
    } catch (error) {
      // Silently fail - estados won't be available for quick status change
    }
  };

  const handleStatusChange = async (newStatusId: string) => {
    if (!ticket) return;

    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/api/ticket/${ticket.id}`, {
        id_estado: Number.parseInt(newStatusId),
      });

      toast({
        title: "Estado actualizado",
        description: <>El estado del ticket ha sido actualizado</>,
      });

      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudo actualizar el estado</>,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
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

  if (!ticket) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">#{ticket.id}</Badge>
                <Badge className={getImportanciaColor(ticket.estado.nombre)}>
                  {ticket.estado.nombre}
                </Badge>
              </div>
              <SheetTitle className="text-2xl">{ticket.nombre}</SheetTitle>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Status Change */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Cambiar Estado</label>
            <Select
              value={ticket.estado?.id.toString() || ""}
              onValueChange={handleStatusChange}
              disabled={isUpdatingStatus}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {estados.map((estado) => (
                  <SelectItem key={estado.id} value={estado.id.toString()}>
                    {estado.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Description */}
          {ticket.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Descripción</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {ticket.description}
              </p>
            </div>
          )}

          {/* Priority Badges */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Prioridad</h3>
            <div className="flex gap-2">
              {ticket.importancia && (
                <Badge
                  className={`${getImportanciaColor(ticket.importancia.nombre)} text-white`}
                >
                  Importancia: {ticket.importancia.nombre}
                </Badge>
              )}
              {ticket.urgencia && (
                <Badge
                  className={`${getUrgenciaColor(ticket.urgencia.nombre)} text-white`}
                >
                  Urgencia: {ticket.urgencia.nombre}
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Información</h3>

            <div className="space-y-3">
              {/* Assigned User */}
              {ticket.user && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Asignado a:</span>
                  <span className="font-medium">{ticket.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({ticket.user.email})
                  </span>
                </div>
              )}

              {/* Service */}
              {ticket.servicio && (
                <div className="flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Servicio:</span>
                  <span className="font-medium">{ticket.servicio.nombre}</span>
                </div>
              )}

              {/* Date Range */}
              {(ticket.desde || ticket.hasta) && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Período:</span>
                  <div className="flex gap-2">
                    {ticket.desde && (
                      <span>
                        Desde {new Date(ticket.desde).toLocaleDateString()}
                      </span>
                    )}
                    {ticket.hasta && (
                      <span>
                        Hasta {new Date(ticket.hasta).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Associated Reservation */}
              {ticket.reserva && (
                <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Reserva Asociada
                      </span>
                    </div>
                    <Badge variant="outline">#{ticket.reserva.id}</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    {ticket.reserva.fecha_inicio && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(
                            ticket.reserva.fecha_inicio,
                          ).toLocaleDateString()}{" "}
                          -{" "}
                          {new Date(
                            ticket.reserva.fecha_fin,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  {onViewReservation && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => onViewReservation(ticket.reserva!.id)}
                    >
                      <Eye className="mr-2 h-3 w-3" />
                      Ver Detalles de Reserva
                    </Button>
                  )}
                </div>
              )}

              {/* Created/Updated */}
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Creado: {new Date(ticket.created_at).toLocaleString()}
                </div>
                <div>
                  Actualizado: {new Date(ticket.updated_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => onEdit(ticket)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(ticket)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
