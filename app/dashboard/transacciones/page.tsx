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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { apiClient } from "@/lib/api-client";
import type { Transaccion } from "@/types/transaccion";
import { TransaccionModal } from "@/app/dashboard/transacciones/_components/transaccion-modal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type DateRange } from "react-day-picker";
import { Factura } from "@/types/factura";

export default function TransaccionesPage() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [totalTransacciones, setTotalTransacciones] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransaccionModalOpen, setIsTransaccionModalOpen] = useState(false);
  const [editingTransaccion, setEditingTransaccion] =
    useState<Transaccion | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchMonto, setSearchMonto] = useState("");

  const fetchTransacciones = async () => {
    try {
      setIsLoading(true);
      const offset = (page - 1) * limit;
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (dateRange?.from) {
        params.append("dateFrom", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange?.to) {
        params.append("dateTo", format(dateRange.to, "yyyy-MM-dd"));
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchMonto) {
        params.append("monto", searchMonto);
      }

      const { data, headers } = await apiClient.getWithHeaders<Transaccion[]>(
        `/api/transaccion?${params.toString()}`,
      );

      setTransacciones(data);
      const totalCount = headers.get("X-Total-Count");
      setTotalTransacciones(totalCount ? parseInt(totalCount, 10) : 0);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar transacciones"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, [page, dateRange, statusFilter, searchMonto]);

  const handleDeleteTransaccion = async (id: number) => {
    try {
      await apiClient.delete(`/api/transaccion/${id}`);
      toast({
        title: "Éxito",
        description: <>{"Transacción eliminada correctamente"}</>,
      });
      fetchTransacciones();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al eliminar transacción"}</>,
        variant: "destructive",
      });
    }
  };

  const handleSelectTransaccion = (transaccion: Transaccion) => {
    // Fetch factura using /api/factura.transaccion/:id and open the pdf file in a new tab
    apiClient
      .get<Factura>(`/api/factura.transaccion/${transaccion.id}`)
      .then(({ pdf }) => {
        if (pdf) {
          window.open(pdf, "_blank");
        }
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-muted-foreground mt-2">Gestiona transacciones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchTransacciones}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditingTransaccion(null);
              setIsTransaccionModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transacción
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transacciones</CardTitle>
          <CardDescription>
            Total: {totalTransacciones} transacción
            {totalTransacciones !== 1 ? "es" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-50">
              <Label htmlFor="monto-search">Buscar por Monto</Label>
              <Input
                id="monto-search"
                placeholder="Buscar monto..."
                value={searchMonto}
                onChange={(e) => {
                  setSearchMonto(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="min-w-45">
              <Label>Filtrar por Fechas</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(dateRange.to, "dd/MM", {
                            locale: es,
                          })}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy", {
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
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range);
                      setPage(1);
                    }}
                    numberOfMonths={2}
                  />
                  {dateRange && (
                    <div className="p-3 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          setDateRange(undefined);
                          setPage(1);
                        }}
                      >
                        Limpiar filtro
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>

            <div className="min-w-37.5">
              <Label>Estado</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="1">Pendiente</SelectItem>
                  <SelectItem value="2">Completado</SelectItem>
                  <SelectItem value="3">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setDateRange(undefined);
                setStatusFilter("all");
                setSearchMonto("");
                setPage(1);
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
                <TableHead>Monto</TableHead>
                <TableHead>Moneda</TableHead>
                <TableHead>Fecha de Pago</TableHead>
                <TableHead>Medio de Pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : transacciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay transacciones
                  </TableCell>
                </TableRow>
              ) : (
                transacciones.map((transaccion) => (
                  <TableRow
                    key={transaccion.id}
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleSelectTransaccion(transaccion)}
                  >
                    <TableCell className="font-medium">
                      ${transaccion.monto.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaccion.moneda?.nombre ||
                        `ID: ${transaccion.idMoneda}`}
                    </TableCell>
                    <TableCell>
                      {format(new Date(transaccion.fechaPago), "PP", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      {transaccion.medioPago?.nombre ||
                        `ID: ${transaccion.idMedioPago}`}
                    </TableCell>
                    <TableCell>
                      {transaccion.estadoPago ? (
                        <Badge variant="outline">
                          {transaccion.estadoPago.nombre}
                        </Badge>
                      ) : (
                        `ID: ${transaccion.idEstadoPago}`
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTransaccion(transaccion);
                            setIsTransaccionModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Eliminar transacción
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que deseas eliminar esta
                                transacción? Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteTransaccion(transaccion.id)
                                }
                              >
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalTransacciones > limit && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                  {Array.from({
                    length: Math.ceil(totalTransacciones / limit),
                  }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setPage((p) =>
                          Math.min(
                            Math.ceil(totalTransacciones / limit),
                            p + 1,
                          ),
                        )
                      }
                      className={
                        page === Math.ceil(totalTransacciones / limit)
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
      <TransaccionModal
        isOpen={isTransaccionModalOpen}
        onClose={() => setIsTransaccionModalOpen(false)}
        transaccion={editingTransaccion}
        onSuccess={() => {
          setIsTransaccionModalOpen(false);
          fetchTransacciones();
        }}
      />
    </div>
  );
}
