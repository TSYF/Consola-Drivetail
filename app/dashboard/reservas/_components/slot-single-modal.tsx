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
import type { CreateSlotDto } from "@/types/reserva";
import { toast } from "@/hooks/use-toast";

interface SlotSingleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SlotSingleModal({
  isOpen,
  onClose,
  onSuccess,
}: SlotSingleModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    inicioDate: "",
    inicioTime: "",
    finDate: "",
    finTime: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine date and time into ISO strings
      const inicio = `${formData.inicioDate}T${formData.inicioTime}:00`;
      const fin = `${formData.finDate}T${formData.finTime}:00`;

      const createData: CreateSlotDto = {
        inicio,
        fin,
      };

      await apiClient.post("/api/slot", createData);
      toast({
        title: "Éxito",
        description: <>{"Slot creado correctamente"}</>,
      });
      onSuccess();
      setFormData({
        inicioDate: "",
        inicioTime: "",
        finDate: "",
        finTime: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al crear slot"}</>,
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
          <DialogTitle>Crear Slot Individual</DialogTitle>
          <DialogDescription>
            Crea un slot especificando fecha y hora de inicio y fin
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Inicio *</Label>
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
              <Label>Fin *</Label>
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
                "Crear Slot"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
