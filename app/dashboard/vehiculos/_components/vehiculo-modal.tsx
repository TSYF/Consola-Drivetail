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
import { Spinner } from "@/components/ui/spinner";
import { apiClient } from "@/lib/api-client";
import type { Vehiculo, CreateVehiculoDto } from "@/types/vehiculo";
import { toast } from "@/hooks/use-toast";

interface VehiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: Vehiculo | null;
  onSuccess: () => void;
}

export function VehiculoModal({
  isOpen,
  onClose,
  vehiculo,
  onSuccess,
}: VehiculoModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateVehiculoDto>({
    marca: "",
    modelo: "",
    anio: new Date().getFullYear().toString(),
    trim: "",
  });

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        trim: vehiculo.trim || "",
      });
    } else {
      setFormData({
        marca: "",
        modelo: "",
        anio: new Date().getFullYear().toString(),
        trim: "",
      });
    }
  }, [vehiculo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (vehiculo) {
        await apiClient.patch(`/api/vehiculo/${vehiculo.id}`, formData);
        toast({
          title: "Éxito",
          description: <>{"Vehículo actualizado correctamente"}</>,
        });
      } else {
        await apiClient.post("/api/vehiculo", formData);
        toast({
          title: "Éxito",
          description: <>{"Vehículo creado correctamente"}</>,
        });
      }
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al guardar vehículo"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>{vehiculo ? "Editar" : "Nuevo"} Vehículo</DialogTitle>
          <DialogDescription>
            {vehiculo
              ? "Actualiza los datos del vehículo"
              : "Completa el formulario para registrar un nuevo vehículo"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="marca">Marca *</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) =>
                  setFormData({ ...formData, marca: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo *</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) =>
                  setFormData({ ...formData, modelo: e.target.value })
                }
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="anio">Año *</Label>
              <Input
                id="anio"
                value={formData.anio}
                onChange={(e) =>
                  setFormData({ ...formData, anio: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trim">Trim</Label>
              <Input
                id="trim"
                value={formData.trim}
                onChange={(e) =>
                  setFormData({ ...formData, trim: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
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
