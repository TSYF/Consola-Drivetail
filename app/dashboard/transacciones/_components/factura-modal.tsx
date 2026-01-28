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
import { apiClient } from "@/lib/api-client";
import type { Factura, CreateFacturaDto } from "@/types/factura";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface FacturaModalProps {
  isOpen: boolean;
  onClose: () => void;
  factura: Factura | null;
  idTransaccion: number;
  onSuccess: () => void;
}

export function FacturaModal({
  isOpen,
  onClose,
  factura,
  idTransaccion,
  onSuccess,
}: FacturaModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateFacturaDto>({
    numero: "",
    total: 0,
    fechaEmision: new Date().toISOString().split("T")[0],
    idTransaccion: idTransaccion,
  });

  useEffect(() => {
    if (factura) {
      setFormData({
        numero: factura.numero,
        total: factura.total,
        fechaEmision: format(new Date(factura.fechaEmision), "yyyy-MM-dd"),
        idTransaccion: factura.idTransaccion,
      });
    } else {
      setFormData({
        numero: "",
        total: 0,
        fechaEmision: new Date().toISOString().split("T")[0],
        idTransaccion: idTransaccion,
      });
    }
  }, [factura, isOpen, idTransaccion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (factura) {
        await apiClient.patch(`/api/factura/${factura.id}`, formData);
        toast({
          title: "Éxito",
          description: <>{"Factura actualizada correctamente"}</>,
        });
      } else {
        await apiClient.post("/api/factura", formData);
        toast({
          title: "Éxito",
          description: <>{"Factura creada correctamente"}</>,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al guardar factura"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{factura ? "Editar" : "Nueva"} Factura</DialogTitle>
          <DialogDescription>
            {factura
              ? "Actualiza los datos de la factura"
              : "Completa el formulario para crear una nueva factura"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="numero">Número de Factura *</Label>
            <Input
              id="numero"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              required
              placeholder="Ej: FAC-001"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total">Total *</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              min="0"
              value={formData.total}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  total: parseFloat(e.target.value) || 0,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
            <Input
              id="fechaEmision"
              type="date"
              value={formData.fechaEmision}
              onChange={(e) =>
                setFormData({ ...formData, fechaEmision: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {factura ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
