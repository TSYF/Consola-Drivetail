"use client";

import React from "react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { Reserva, CreateReservaDto, Slot, EstadoReserva } from "@/types/reserva";
import type { Cliente } from "@/types/cliente";
import type { Servicio } from "@/types/servicio";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Combobox } from "@/components/ui/combobox";

interface ReservaModalProps {
  isOpen: boolean;
  onClose: () => void;
  reserva: Reserva | null;
  onSuccess: () => void;
}

export function ReservaModal({
  isOpen,
  onClose,
  reserva,
  onSuccess,
}: ReservaModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estados, setEstados] = useState<EstadoReserva[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [formData, setFormData] = useState<CreateReservaDto>({
    patenteVehiculo: "",
    notasCliente: "",
    recordatorio: true,
    idEstado: 1,
    idServicio: 1,
    idCliente: 1,
    idSlot: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchSlots();
      fetchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (reserva) {
      setFormData({
        patenteVehiculo: reserva.patenteVehiculo,
        notasCliente: reserva.notasCliente,
        recordatorio: reserva.recordatorio,
        idEstado: reserva.idEstado,
        idServicio: reserva.idServicio,
        idCliente: reserva.idCliente,
        idSlot: reserva.idSlot,
      });
    } else {
      setFormData({
        patenteVehiculo: "",
        notasCliente: "",
        recordatorio: true,
        idEstado: 1,
        idServicio: 1,
        idCliente: 1,
        idSlot: 0,
      });
    }
  }, [reserva, isOpen]);

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      // Fetch free slots
      const data = await apiClient.get<Slot[]>("/api/slot.free");
      setSlots(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar slots disponibles"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [clientesData, serviciosData, estadosData] = await Promise.all([
        apiClient.get<Cliente[]>("/api/cliente"),
        apiClient.get<Servicio[]>("/api/servicio"),
        apiClient.get<EstadoReserva[]>("/api/estado-reserva"),
      ]);
      setClientes(clientesData);
      setServicios(serviciosData);
      setEstados(estadosData);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar opciones"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (reserva) {
        await apiClient.patch(`/api/reserva/${reserva.id}`, formData);
        toast({
          title: "Éxito",
          description: <>{"Reserva actualizada correctamente"}</>,
        });
      } else {
        await apiClient.post("/api/reserva", formData);
        toast({
          title: "Éxito",
          description: <>{"Reserva creada correctamente"}</>,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al guardar reserva"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{reserva ? "Editar" : "Nueva"} Reserva</DialogTitle>
          <DialogDescription>
            {reserva
              ? "Actualiza los datos de la reserva"
              : "Completa el formulario para crear una nueva reserva"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patenteVehiculo">Patente Vehículo *</Label>
            <Input
              id="patenteVehiculo"
              value={formData.patenteVehiculo}
              onChange={(e) =>
                setFormData({ ...formData, patenteVehiculo: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idSlot">Horario *</Label>
            <Select
              value={(+formData.idSlot).toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, idSlot: Number(value) })
              }
              disabled={isLoadingSlots}
            >
              <SelectTrigger id="idSlot">
                <SelectValue
                  placeholder={
                    isLoadingSlots ? "Cargando..." : "Selecciona un horario"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {slots.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id.toString()}>
                    {format(new Date(slot.inicio), "PPP 'a las' HH:mm", {
                      locale: es,
                    })}{" "}
                    - {format(new Date(slot.fin), "HH:mm", { locale: es })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idCliente">Cliente *</Label>
              <Combobox
                options={clientes.map((cliente) => ({
                  value: cliente.id.toString(),
                  label: `${cliente.nombre} (${cliente.email})`,
                }))}
                value={formData.idCliente.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, idCliente: Number(value) })
                }
                placeholder="Selecciona un cliente"
                searchPlaceholder="Buscar cliente..."
                emptyText="No se encontró ningún cliente."
                disabled={isLoadingOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idServicio">Servicio *</Label>
              <Combobox
                options={servicios.map((servicio) => ({
                  value: servicio.id.toString(),
                  label: servicio.nombre,
                }))}
                value={formData.idServicio.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, idServicio: Number(value) })
                }
                placeholder="Selecciona un servicio"
                searchPlaceholder="Buscar servicio..."
                emptyText="No se encontró ningún servicio."
                disabled={isLoadingOptions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idEstado">Estado *</Label>
              <Combobox
                options={estados.map((estado) => ({
                  value: estado.id.toString(),
                  label: estado.nombre,
                }))}
                value={formData.idEstado.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, idEstado: Number(value) })
                }
                placeholder="Selecciona un estado"
                searchPlaceholder="Buscar estado..."
                emptyText="No se encontró ningún estado."
                disabled={isLoadingOptions}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notasCliente">Notas del Cliente</Label>
            <Textarea
              id="notasCliente"
              value={formData.notasCliente}
              onChange={(e) =>
                setFormData({ ...formData, notasCliente: e.target.value })
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="recordatorio"
              checked={formData.recordatorio}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, recordatorio: checked })
              }
            />
            <Label htmlFor="recordatorio">Enviar recordatorio</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingSlots || isLoadingOptions}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
