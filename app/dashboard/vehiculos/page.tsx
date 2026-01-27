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
import { Plus, RefreshCw, Edit, Trash2, Car } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type { Vehiculo } from "@/types/vehiculo";
import { VehiculoModal } from "@/app/dashboard/vehiculos/_components/vehiculo-modal";
import { toast } from "@/hooks/use-toast";

export default function VehiculosPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vehiculo | null>(null);

  const fetchVehiculos = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Vehiculo[]>("/api/vehiculo");
      setVehiculos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar vehículos"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este vehículo?")) return;
    try {
      await apiClient.delete(`/api/vehiculo/${id}`);
      toast({
        title: "Éxito",
        description: <>{"Vehículo eliminado correctamente"}</>,
      });
      fetchVehiculos();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al eliminar vehículo"}</>,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehículos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los vehículos de los clientes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchVehiculos}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Vehículo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>
            {vehiculos.length} vehículo{vehiculos.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marca</TableHead>
                <TableHead>Modelo</TableHead>
                <TableHead>Año</TableHead>
                <TableHead>Trim</TableHead>
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
              ) : vehiculos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No hay vehículos
                  </TableCell>
                </TableRow>
              ) : (
                vehiculos.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell>{vehiculo.marca}</TableCell>
                    <TableCell>{vehiculo.modelo}</TableCell>
                    <TableCell>{vehiculo.anio}</TableCell>
                    <TableCell>{vehiculo.trim || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(vehiculo);
                            setIsModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(vehiculo.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <VehiculoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vehiculo={editing}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchVehiculos();
        }}
      />
    </div>
  );
}
