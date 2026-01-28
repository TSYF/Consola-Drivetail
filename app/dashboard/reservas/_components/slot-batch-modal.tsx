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
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { apiClient } from "@/lib/api-client";
import type { CreateSlotBatchDto } from "@/types/reserva";
import { toast } from "@/hooks/use-toast";
import { type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [minutes, setMinutes] = useState("30");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: "Error",
        description: <>{"Por favor selecciona un rango de fechas"}</>,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time into ISO strings
      const inicioDate = format(dateRange.from, "yyyy-MM-dd");
      const finDate = format(dateRange.to, "yyyy-MM-dd");
      const inicio = `${inicioDate}T${startTime}:00`;
      const fin = `${finDate}T${endTime}:00`;

      const createData: CreateSlotBatchDto = {
        inicio,
        fin,
        minutes: Number(minutes),
      };

      await apiClient.post("/api/slot.batch", createData);
      toast({
        title: "Éxito",
        description: <>{"Slots creados correctamente en lote"}</>,
      });
      onSuccess();
      setDateRange(undefined);
      setStartTime("09:00");
      setEndTime("18:00");
      setMinutes("30");
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
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Crear Slots en Lote</DialogTitle>
          <DialogDescription>
            Selecciona un rango de fechas y horarios para crear múltiples slots
            automáticamente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selecciona Rango de Fechas *</Label>
              <Card className="w-fit">
                <CardContent className="p-3">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    captionLayout="dropdown"
                    className="[--cell-size:--spacing(10)]"
                    formatters={{
                      formatMonthDropdown: (date) => {
                        return date.toLocaleString("default", { month: "long" });
                      },
                    }}
                  />
                </CardContent>
              </Card>
              {dateRange?.from && dateRange?.to && (
                <p className="text-sm text-muted-foreground">
                  Desde:{" "}
                  <span className="font-medium">
                    {format(dateRange.from, "PP", { locale: es })}
                  </span>{" "}
                  hasta{" "}
                  <span className="font-medium">
                    {format(dateRange.to, "PP", { locale: es })}
                  </span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Inicio *</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Fin *</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minutes">Duración de Cada Slot (minutos) *</Label>
              <Input
                id="minutes"
                type="number"
                min="1"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Los slots se crearán automáticamente cada día del rango
                seleccionado, dividiendo cada día en intervalos de esta duración
                entre la hora de inicio y fin
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
