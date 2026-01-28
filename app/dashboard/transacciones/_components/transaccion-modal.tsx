"use client";

import React, { useEffect, useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { Transaccion, CreateTransaccionDto, MedioPago, Moneda, EstadoPago } from "@/types/transaccion";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TransaccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaccion: Transaccion | null;
  onSuccess: () => void;
}

export function TransaccionModal({
  isOpen,
  onClose,
  transaccion,
  onSuccess,
}: TransaccionModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mediosPago, setMediosPago] = useState<MedioPago[]>([]);
  const [monedas, setMonedas] = useState<Moneda[]>([]);
  const [estadosPago, setEstadosPago] = useState<EstadoPago[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [formData, setFormData] = useState<CreateTransaccionDto>({
    monto: 0,
    idMoneda: 1,
    webpayToken: "",
    fechaPago: new Date().toISOString().split('T')[0],
    idMedioPago: 1,
    idEstadoPago: 1,
  });

  useEffect(() => {
    if (isOpen) {
      fetchOptions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaccion) {
      setFormData({
        monto: transaccion.monto,
        idMoneda: transaccion.idMoneda,
        webpayToken: transaccion.webpayToken,
        fechaPago: format(new Date(transaccion.fechaPago), "yyyy-MM-dd"),
        idMedioPago: transaccion.idMedioPago,
        idEstadoPago: transaccion.idEstadoPago,
      });
    } else {
      setFormData({
        monto: 0,
        idMoneda: 1,
        webpayToken: "",
        fechaPago: new Date().toISOString().split('T')[0],
        idMedioPago: 1,
        idEstadoPago: 1,
      });
    }
  }, [transaccion, isOpen]);

  const fetchOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [mediosData, monedasData, estadosData] = await Promise.all([
        apiClient.get<MedioPago[]>("/api/medio-pago").catch(() => []),
        apiClient.get<Moneda[]>("/api/moneda").catch(() => []),
        apiClient.get<EstadoPago[]>("/api/estado-pago").catch(() => []),
      ]);
      setMediosPago(mediosData);
      setMonedas(monedasData);
      setEstadosPago(estadosData);
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
      if (transaccion) {
        await apiClient.patch(`/api/transaccion/${transaccion.id}`, formData);
        toast({
          title: "Éxito",
          description: <>{"Transacción actualizada correctamente"}</>,
        });
      } else {
        await apiClient.post("/api/transaccion", formData);
        toast({
          title: "Éxito",
          description: <>{"Transacción creada correctamente"}</>,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al guardar transacción"}</>,
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
          <DialogTitle>{transaccion ? "Editar" : "Nueva"} Transacción</DialogTitle>
          <DialogDescription>
            {transaccion
              ? "Actualiza los datos de la transacción"
              : "Completa el formulario para crear una nueva transacción"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idMoneda">Moneda *</Label>
            <Select
              value={formData.idMoneda.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, idMoneda: Number(value) })
              }
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="idMoneda">
                <SelectValue
                  placeholder={isLoadingOptions ? "Cargando..." : "Selecciona moneda"}
                />
              </SelectTrigger>
              <SelectContent>
                {monedas.map((moneda) => (
                  <SelectItem key={moneda.id} value={moneda.id.toString()}>
                    {moneda.nombre} ({moneda.codigo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idMedioPago">Medio de Pago *</Label>
            <Select
              value={formData.idMedioPago.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, idMedioPago: Number(value) })
              }
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="idMedioPago">
                <SelectValue
                  placeholder={isLoadingOptions ? "Cargando..." : "Selecciona medio de pago"}
                />
              </SelectTrigger>
              <SelectContent>
                {mediosPago.map((medio) => (
                  <SelectItem key={medio.id} value={medio.id.toString()}>
                    {medio.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaPago">Fecha de Pago *</Label>
            <Input
              id="fechaPago"
              type="date"
              value={formData.fechaPago}
              onChange={(e) =>
                setFormData({ ...formData, fechaPago: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idEstadoPago">Estado de Pago *</Label>
            <Select
              value={formData.idEstadoPago.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, idEstadoPago: Number(value) })
              }
              disabled={isLoadingOptions}
            >
              <SelectTrigger id="idEstadoPago">
                <SelectValue
                  placeholder={isLoadingOptions ? "Cargando..." : "Selecciona estado"}
                />
              </SelectTrigger>
              <SelectContent>
                {estadosPago.map((estado) => (
                  <SelectItem key={estado.id} value={estado.id.toString()}>
                    {estado.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webpayToken">Webpay Token</Label>
            <Input
              id="webpayToken"
              value={formData.webpayToken}
              onChange={(e) =>
                setFormData({ ...formData, webpayToken: e.target.value })
              }
              placeholder="Opcional"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {transaccion ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
