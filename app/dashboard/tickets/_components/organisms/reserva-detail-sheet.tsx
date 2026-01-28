"use client";

import React, { useState, useEffect } from "react";
import { Reserva } from "@/types/reserva";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  User,
  Package,
  Car,
  Clock,
  Bell,
  BellOff,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface ReservaDetailSheetProps {
  reservaId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReservaDetailSheet({
  reservaId,
  open,
  onOpenChange,
}: ReservaDetailSheetProps) {
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && reservaId) {
      fetchReserva();
    }
  }, [open, reservaId]);

  const fetchReserva = async () => {
    if (!reservaId) return;

    setIsLoading(true);
    try {
      const data = await apiClient.get<Reserva>(`/api/reserva/${reservaId}`);
      setReserva(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudo cargar la información de la reserva</>,
        variant: "destructive",
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!reserva && !isLoading) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto p-6">
        <SheetHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Reserva #{reserva?.id}</Badge>
                {reserva?.estado && (
                  <Badge variant="secondary">{reserva.estado.nombre}</Badge>
                )}
              </div>
              <SheetTitle className="text-2xl flex items-center gap-2">
                <Car className="h-6 w-6" />
                {reserva?.patenteVehiculo || "Cargando..."}
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-muted-foreground">Cargando detalles...</p>
          </div>
        ) : reserva ? (
          <div className="mt-6 space-y-6">
            {/* Client Notes */}
            {reserva.notasCliente && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Notas del Cliente</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {reserva.notasCliente}
                </p>
              </div>
            )}

            <Separator />

            {/* Reservation Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Detalles de la Reserva</h3>

              <div className="space-y-3">
                {/* Slot Date/Time */}
                {reserva.slot && (
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Fecha y Hora</span>
                    </div>
                    <div className="text-sm space-y-1 pl-6">
                      <div>
                        <span className="text-muted-foreground">Inicio: </span>
                        <span className="font-medium">
                          {new Date(reserva.slot.inicio).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fin: </span>
                        <span className="font-medium">
                          {new Date(reserva.slot.fin).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Client Information */}
                {reserva.cliente && (
                  <div className="flex items-start gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <span className="text-muted-foreground">Cliente:</span>
                      <div className="font-medium">{reserva.cliente.nombre}</div>
                      {reserva.cliente.email && (
                        <div className="text-xs text-muted-foreground">
                          {reserva.cliente.email}
                        </div>
                      )}
                      {reserva.cliente.telefono && (
                        <div className="text-xs text-muted-foreground">
                          {reserva.cliente.telefono}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Service */}
                {reserva.servicio && (
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Servicio:</span>
                    <span className="font-medium">{reserva.servicio.nombre}</span>
                  </div>
                )}

                {/* Reminder Status */}
                <div className="flex items-center gap-2 text-sm">
                  {reserva.recordatorio ? (
                    <>
                      <Bell className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Recordatorio:
                      </span>
                      <Badge variant="default" className="bg-green-500">
                        Activo
                      </Badge>
                    </>
                  ) : (
                    <>
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Recordatorio:
                      </span>
                      <Badge variant="outline">Inactivo</Badge>
                    </>
                  )}
                </div>

                {/* Created/Updated */}
                {reserva.created_at && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Creado: {new Date(reserva.created_at).toLocaleString()}
                    </div>
                    {reserva.updated_at && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Actualizado:{" "}
                        {new Date(reserva.updated_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                <X className="mr-2 h-4 w-4" />
                Cerrar
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
