"use client";

import { useState } from "react";
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
import type { CreateSlotBatchDto } from "@/types/reserva";
import { toast } from "@/hooks/use-toast";

interface SlotBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotBatchModal({
  isOpen,
  onClose,
  onSuccess,
}: SlotBatchModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    inicioDate: "",
    inicioTime: "",
    finDate: "",
    finTime: "",
    minutes: "30",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine date and time into ISO strings
      const inicio = `${formData.inicioDate}T${formData.inicioTime}:00`;
      const fin = `${formData.finDate}T${formData.finTime}:00`;

      const createData: CreateSlotBatchDto = {
        inicio,
        fin,
        minutes: Number(formData.minutes),
      };

      await apiClient.post("/api/slot.batch", createData);
      toast({
        title: "Éxito",
        description: <>{"Slots creados correctamente en lote"}</>,
      });
      onSuccess();
      setFormData({
        inicioDate: "",
        inicioTime: "",
        finDate: "",
        finTime: "",
        minutes: "30",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al crear slots en lote"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Crear Slots en Lote</DialogTitle>
          <DialogDescription>
            Crea múltiples slots entre dos fechas con una duración específica
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Inicio del Período *</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={formData.inicioDate}
                    onChange={(e) =>
                      setFormData({ ...formData, inicioDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={formData.inicioTime}
                    onChange={(e) =>
                      setFormData({ ...formData, inicioTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fin del Período *</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="date"
                    value={formData.finDate}
                    onChange={(e) =>
                      setFormData({ ...formData, finDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="time"
                    value={formData.finTime}
                    onChange={(e) =>
                      setFormData({ ...formData, finTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">Duración de Cada Slot (minutos) *</Label>
              <Input
                id="minutes"
                type="number"
                min="1"
                value={formData.minutes}
                onChange={(e) =>
                  setFormData({ ...formData, minutes: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Los slots se crearán automáticamente dividiendo el período en
                intervalos de esta duración
              </p>
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
                  Creando...
                </>
              ) : (
                "Crear Slots"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
