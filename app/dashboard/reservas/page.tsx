"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, RefreshCw, Edit, Trash2, Clock, Layers } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import type { Reserva, Slot } from "@/types/reserva";
import { ReservaModal } from "@/app/dashboard/reservas/_components/reserva-modal";
import { SlotSingleModal } from "@/app/dashboard/reservas/_components/slot-single-modal";
import { SlotBatchModal } from "@/app/dashboard/reservas/_components/slot-batch-modal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(true);
  const [isSingleSlotModalOpen, setIsSingleSlotModalOpen] = useState(false);
  const [isBatchSlotModalOpen, setIsBatchSlotModalOpen] = useState(false);

  const fetchReservas = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Reserva[]>("/api/reserva");
      setReservas(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar reservas"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      setIsSlotsLoading(true);
      const data = await apiClient.get<Slot[]>("/api/slot");
      setSlots(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar slots"}</>,
        variant: "destructive",
      });
    } finally {
      setIsSlotsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
    fetchSlots();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta reserva?")) return;
    try {
      await apiClient.delete(`/api/reserva/${id}`);
      toast({
        title: "Éxito",
        description: <>{"Reserva eliminada correctamente"}</>,
      });
      fetchReservas();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al eliminar reserva"}</>,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este slot?")) return;
    try {
      await apiClient.delete(`/api/slot/${id}`);
      toast({
        title: "Éxito",
        description: <>{"Slot eliminado correctamente"}</>,
      });
      fetchSlots();
      fetchReservas(); // Refresh reservas in case any were using this slot
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al eliminar slot"}</>,
        variant: "destructive",
      });
    }
  };

  const formatSlotTime = (reserva: Reserva) => {
    if (!reserva.slot) {
      return { date: "N/A", timeRange: "N/A" };
    }
    const inicio = new Date(reserva.slot.inicio);
    const fin = new Date(reserva.slot.fin);
    return {
      date: format(inicio, "PP", { locale: es }),
      timeRange: `${format(inicio, "HH:mm")} - ${format(fin, "HH:mm")}`,
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reservas</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona las reservas de servicios
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchReservas}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Reserva
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Reservas</CardTitle>
          <CardDescription>
            {reservas.length} reserva{reservas.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Horario</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : reservas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No hay reservas
                  </TableCell>
                </TableRow>
              ) : (
                reservas.map((reserva) => {
                  const { date, timeRange } = formatSlotTime(reserva);
                  return (
                    <TableRow key={reserva.id}>
                      <TableCell className="font-medium">
                        {reserva.patenteVehiculo}
                      </TableCell>
                      <TableCell>{date}</TableCell>
                      <TableCell>{timeRange}</TableCell>
                      <TableCell>
                        {reserva.cliente?.nombre || `ID: ${reserva.idCliente}`}
                      </TableCell>
                      <TableCell>
                        {reserva.servicio?.nombre || `ID: ${reserva.idServicio}`}
                      </TableCell>
                      <TableCell>
                        {reserva.estado ? (
                          <Badge variant="outline">{reserva.estado.nombre}</Badge>
                        ) : (
                          `ID: ${reserva.idEstado}`
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditing(reserva);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(reserva.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Slots</CardTitle>
              <CardDescription>
                {slots.length} slot{slots.length !== 1 ? "s" : ""} en total (
                {slots.filter((s) => !s.ocupado).length} libre
                {slots.filter((s) => !s.ocupado).length !== 1 ? "s" : ""})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchSlots}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSingleSlotModalOpen(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Nuevo Slot
              </Button>
              <Button
                size="sm"
                onClick={() => setIsBatchSlotModalOpen(true)}
              >
                <Layers className="h-4 w-4 mr-2" />
                Crear en Lote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isSlotsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : slots.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No hay slots. Crea slots para permitir reservas.
                  </TableCell>
                </TableRow>
              ) : (
                slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell className="font-medium">
                      {format(new Date(slot.inicio), "PPP 'a las' HH:mm", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(slot.fin), "HH:mm", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {slot.ocupado ? (
                        <Badge variant="destructive">Ocupado</Badge>
                      ) : (
                        <Badge variant="outline">Libre</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteSlot(slot.id)}
                        disabled={slot.ocupado}
                        title={
                          slot.ocupado
                            ? "No se puede eliminar un slot ocupado"
                            : "Eliminar slot"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReservaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reserva={editing}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchReservas();
        }}
      />

      <SlotSingleModal
        isOpen={isSingleSlotModalOpen}
        onClose={() => setIsSingleSlotModalOpen(false)}
        onSuccess={() => {
          setIsSingleSlotModalOpen(false);
          fetchSlots();
        }}
      />

      <SlotBatchModal
        isOpen={isBatchSlotModalOpen}
        onClose={() => setIsBatchSlotModalOpen(false)}
        onSuccess={() => {
          setIsBatchSlotModalOpen(false);
          fetchSlots();
        }}
      />
    </div>
  );
}
