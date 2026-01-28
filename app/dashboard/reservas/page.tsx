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
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Clock,
  Layers,
  Filter,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { apiClient } from "@/lib/api-client";
import type { Reserva, Slot } from "@/types/reserva";
import { ReservaModal } from "@/app/dashboard/reservas/_components/reserva-modal";
import { SlotSingleModal } from "@/app/dashboard/reservas/_components/slot-single-modal";
import { SlotBatchModal } from "@/app/dashboard/reservas/_components/slot-batch-modal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";

export default function ReservasPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [totalReservas, setTotalReservas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reserva | null>(null);

  // Reservas filters and pagination
  const [reservasPage, setReservasPage] = useState(1);
  const [reservasLimit] = useState(10);
  const [reservasDateRange, setReservasDateRange] = useState<
    DateRange | undefined
  >();
  const [reservasStatusFilter, setReservasStatusFilter] =
    useState<string>("all");
  const [reservasSearchPatente, setReservasSearchPatente] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [totalSlots, setTotalSlots] = useState(0);
  const [isSlotsLoading, setIsSlotsLoading] = useState(true);
  const [isSingleSlotModalOpen, setIsSingleSlotModalOpen] = useState(false);
  const [isBatchSlotModalOpen, setIsBatchSlotModalOpen] = useState(false);

  // Slots filters and pagination
  const [slotsPage, setSlotsPage] = useState(1);
  const [slotsLimit] = useState(10);
  const [slotsDateRange, setSlotsDateRange] = useState<DateRange | undefined>();
  const [slotsStatusFilter, setSlotsStatusFilter] = useState<string>("all");

  const fetchReservas = async () => {
    try {
      setIsLoading(true);
      const offset = (reservasPage - 1) * reservasLimit;
      const params = new URLSearchParams({
        limit: reservasLimit.toString(),
        offset: offset.toString(),
      });

      if (reservasDateRange?.from) {
        params.append("dateFrom", format(reservasDateRange.from, "yyyy-MM-dd"));
      }
      if (reservasDateRange?.to) {
        params.append("dateTo", format(reservasDateRange.to, "yyyy-MM-dd"));
      }
      if (reservasStatusFilter !== "all") {
        params.append("status", reservasStatusFilter);
      }
      if (reservasSearchPatente) {
        params.append("patente", reservasSearchPatente);
      }

      const { data, headers } = await apiClient.getWithHeaders<Reserva[]>(
        `/api/reserva?${params.toString()}`,
      );

      setReservas(data);
      const totalCount = headers.get("X-Total-Count");
      setTotalReservas(totalCount ? parseInt(totalCount, 10) : 0);
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
      const offset = (slotsPage - 1) * slotsLimit;
      const params = new URLSearchParams({
        limit: slotsLimit.toString(),
        offset: offset.toString(),
      });

      if (slotsDateRange?.from) {
        params.append("dateFrom", format(slotsDateRange.from, "yyyy-MM-dd"));
      }
      if (slotsDateRange?.to) {
        params.append("dateTo", format(slotsDateRange.to, "yyyy-MM-dd"));
      }
      if (slotsStatusFilter !== "all") {
        params.append(
          "ocupado",
          slotsStatusFilter === "ocupado" ? "true" : "false",
        );
      }

      const { data, headers } = await apiClient.getWithHeaders<Slot[]>(
        `/api/slot?${params.toString()}`,
      );

      setSlots(data);
      const totalCount = headers.get("X-Total-Count");
      setTotalSlots(totalCount ? parseInt(totalCount, 10) : 0);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reservasPage,
    reservasDateRange,
    reservasStatusFilter,
    reservasSearchPatente,
  ]);

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slotsPage, slotsDateRange, slotsStatusFilter]);

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
            Total: {totalReservas} reserva{totalReservas !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reservas Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="patente-search">Buscar por Patente</Label>
              <Input
                id="patente-search"
                placeholder="Buscar patente..."
                value={reservasSearchPatente}
                onChange={(e) => {
                  setReservasSearchPatente(e.target.value);
                  setReservasPage(1);
                }}
              />
            </div>

            <div className="min-w-[180px]">
              <Label>Filtrar por Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reservasDateRange?.from ? (
                      reservasDateRange.to ? (
                        <>
                          {format(reservasDateRange.from, "dd/MM", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(reservasDateRange.to, "dd/MM", {
                            locale: es,
                          })}
                        </>
                      ) : (
                        format(reservasDateRange.from, "dd/MM/yyyy", {
                          locale: es,
                        })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={reservasDateRange}
                    onSelect={(range) => {
                      setReservasDateRange(range);
                      setReservasPage(1);
                    }}
                    numberOfMonths={2}
                  />
                  {reservasDateRange && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setReservasDateRange(undefined);
                          setReservasPage(1);
                        }}
                      >
                        Limpiar filtro
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-[150px]">
              <Label>Estado</Label>
              <Select
                value={reservasStatusFilter}
                onValueChange={(value) => {
                  setReservasStatusFilter(value);
                  setReservasPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Pendiente</SelectItem>
                  <SelectItem value="2">Confirmada</SelectItem>
                  <SelectItem value="3">Completada</SelectItem>
                  <SelectItem value="4">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setReservasDateRange(undefined);
                setReservasStatusFilter("all");
                setReservasSearchPatente("");
                setReservasPage(1);
              }}
              title="Limpiar filtros"
              className="ms-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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
                        {reserva.servicio?.nombre ||
                          `ID: ${reserva.idServicio}`}
                      </TableCell>
                      <TableCell>
                        {reserva.estado ? (
                          <Badge variant="outline">
                            {reserva.estado.nombre}
                          </Badge>
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

          {/* Reservas Pagination */}
          {totalReservas > reservasLimit && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setReservasPage((p) => Math.max(1, p - 1))}
                      className={
                        reservasPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({
                    length: Math.ceil(totalReservas / reservasLimit),
                  }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setReservasPage(i + 1)}
                        isActive={reservasPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setReservasPage((p) =>
                          Math.min(
                            Math.ceil(totalReservas / reservasLimit),
                            p + 1,
                          ),
                        )
                      }
                      className={
                        reservasPage ===
                        Math.ceil(totalReservas / reservasLimit)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestión de Slots</CardTitle>
              <CardDescription>
                Total: {totalSlots} slot{totalSlots !== 1 ? "s" : ""} (
                {slots.filter((s) => !s.ocupado).length} libre
                {slots.filter((s) => !s.ocupado).length !== 1 ? "s" : ""})
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchSlots}>
                <RefreshCw className="h-4 w-4 mr-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSingleSlotModalOpen(true)}
              >
                <Clock className="h-4 w-4 mr-2" />
                Nuevo Slot
              </Button>
              <Button size="sm" onClick={() => setIsBatchSlotModalOpen(true)}>
                <Layers className="h-4 w-4 mr-2" />
                Crear en Lote
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Slots Filters */}
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[180px]">
              <Label>Filtrar por Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {slotsDateRange?.from ? (
                      slotsDateRange.to ? (
                        <>
                          {format(slotsDateRange.from, "dd/MM", { locale: es })}{" "}
                          - {format(slotsDateRange.to, "dd/MM", { locale: es })}
                        </>
                      ) : (
                        format(slotsDateRange.from, "dd/MM/yyyy", {
                          locale: es,
                        })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={slotsDateRange}
                    onSelect={(range) => {
                      setSlotsDateRange(range);
                      setSlotsPage(1);
                    }}
                    numberOfMonths={2}
                  />
                  {slotsDateRange && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setSlotsDateRange(undefined);
                          setSlotsPage(1);
                        }}
                      >
                        Limpiar filtro
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-[150px]">
              <Label>Estado</Label>
              <Select
                value={slotsStatusFilter}
                onValueChange={(value) => {
                  setSlotsStatusFilter(value);
                  setSlotsPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="libre">Libre</SelectItem>
                  <SelectItem value="ocupado">Ocupado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSlotsDateRange(undefined);
                setSlotsStatusFilter("all");
                setSlotsPage(1);
              }}
              title="Limpiar filtros"
              className="ms-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

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

          {/* Slots Pagination */}
          {totalSlots > slotsLimit && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setSlotsPage((p) => Math.max(1, p - 1))}
                      className={
                        slotsPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({
                    length: Math.ceil(totalSlots / slotsLimit),
                  }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setSlotsPage(i + 1)}
                        isActive={slotsPage === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setSlotsPage((p) =>
                          Math.min(Math.ceil(totalSlots / slotsLimit), p + 1),
                        )
                      }
                      className={
                        slotsPage === Math.ceil(totalSlots / slotsLimit)
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
