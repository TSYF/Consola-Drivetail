"use client";

import React from "react";

import { useEffect, useState } from "react";
import {
  Ticket,
  EstadoTicket,
  ImportanciaTicket,
  UrgenciaTicket,
} from "@/types/ticket";
import { Servicio } from "@/types/servicio";
import { User } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";

interface TicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticket?: Ticket;
  onSave: (data: {
    nombre: string;
    description?: string;
    desde?: string;
    hasta?: string;
    id_servicio: number;
    id_user?: string;
    id_estado: number;
    id_importancia?: number;
    id_urgencia?: number;
  }) => Promise<void>;
}

export function TicketModal({
  open,
  onOpenChange,
  ticket,
  onSave,
}: TicketModalProps) {
  const [nombre, setNombre] = useState("");
  const [description, setDescription] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [idServicio, setIdServicio] = useState("");
  const [idUser, setIdUser] = useState("");
  const [idEstado, setIdEstado] = useState("");
  const [idImportancia, setIdImportancia] = useState("");
  const [idUrgencia, setIdUrgencia] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dropdown options state
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [importancias, setImportancias] = useState<ImportanciaTicket[]>([]);
  const [urgencias, setUrgencias] = useState<UrgenciaTicket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Fetch dropdown options when modal opens
  useEffect(() => {
    if (open) {
      fetchDropdownOptions();
    }
  }, [open]);

  const fetchDropdownOptions = async () => {
    setIsLoadingOptions(true);
    try {
      const [
        serviciosData,
        estadosData,
        importanciasData,
        urgenciasData,
        usersData,
      ] = await Promise.all([
        apiClient.get<Servicio[]>("/api/servicio"),
        apiClient.get<EstadoTicket[]>("/api/estado-ticket"),
        apiClient.get<ImportanciaTicket[]>("/api/importancia-ticket"),
        apiClient.get<UrgenciaTicket[]>("/api/urgencia-ticket"),
        apiClient.get<{ users: User[] } | User[]>(
          "/api/auth/admin/list-users?filterField=role&filterValue=operator",
        ),
      ]);

      setServicios(serviciosData);
      setEstados(estadosData);
      setImportancias(importanciasData);
      setUrgencias(urgenciasData);
      // Handle both response structures
      setUsers(Array.isArray(usersData) ? usersData : usersData.users);
    } catch (error) {
      toast({
        title: "Error",
        description: <>No se pudieron cargar las opciones del formulario</>,
        variant: "destructive",
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (ticket) {
      setNombre(ticket.nombre);
      setDescription(ticket.description || "");
      setDesde(ticket.desde ? ticket.desde.split("T")[0] : "");
      setHasta(ticket.hasta ? ticket.hasta.split("T")[0] : "");
      setIdServicio(ticket.id_servicio.toString());
      setIdUser(ticket.id_user || "");
      setIdEstado(ticket.estado?.id.toString() || "");
      setIdImportancia(ticket.importancia?.id.toString() || "");
      setIdUrgencia(ticket.urgencia?.id.toString() || "");
    } else {
      setNombre("");
      setDescription("");
      setDesde("");
      setHasta("");
      setIdServicio("");
      setIdUser("");
      setIdEstado("");
      setIdImportancia("");
      setIdUrgencia("");
    }
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSave({
        nombre,
        description: description || undefined,
        desde: desde || undefined,
        hasta: hasta || undefined,
        id_servicio: Number.parseInt(idServicio),
        id_user: idUser || undefined,
        id_estado: Number.parseInt(idEstado),
        id_importancia: idImportancia
          ? Number.parseInt(idImportancia)
          : undefined,
        id_urgencia: idUrgencia ? Number.parseInt(idUrgencia) : undefined,
      });
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket ? "Editar Ticket" : "Crear Ticket"}</DialogTitle>
          <DialogDescription>
            {ticket
              ? "Actualiza la información del ticket"
              : "Completa el formulario para crear un nuevo ticket"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desde">Desde</Label>
              <Input
                id="desde"
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasta">Hasta</Label>
              <Input
                id="hasta"
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idServicio">Servicio *</Label>
              <Select
                value={idServicio}
                onValueChange={setIdServicio}
                disabled={isLoading || isLoadingOptions}
              >
                <SelectTrigger id="idServicio">
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((servicio) => (
                    <SelectItem
                      key={servicio.id}
                      value={servicio.id.toString()}
                    >
                      {servicio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idEstado">Estado *</Label>
              <Select
                value={idEstado}
                onValueChange={setIdEstado}
                disabled={isLoading || isLoadingOptions}
              >
                <SelectTrigger id="idEstado">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  {estados.map((estado) => (
                    <SelectItem key={estado.id} value={estado.id.toString()}>
                      {estado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="idImportancia">Importancia</Label>
              <Select
                value={idImportancia}
                onValueChange={setIdImportancia}
                disabled={isLoading || isLoadingOptions}
              >
                <SelectTrigger id="idImportancia">
                  <SelectValue placeholder="Selecciona importancia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ninguna</SelectItem>
                  {importancias.map((importancia) => (
                    <SelectItem
                      key={importancia.id}
                      value={importancia.id.toString()}
                    >
                      {importancia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idUrgencia">Urgencia</Label>
              <Select
                value={idUrgencia}
                onValueChange={setIdUrgencia}
                disabled={isLoading || isLoadingOptions}
              >
                <SelectTrigger id="idUrgencia">
                  <SelectValue placeholder="Selecciona urgencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ninguna</SelectItem>
                  {urgencias.map((urgencia) => (
                    <SelectItem
                      key={urgencia.id}
                      value={urgencia.id.toString()}
                    >
                      {urgencia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="idUser">Asignar a</Label>
            <Select
              value={idUser}
              onValueChange={setIdUser}
              disabled={isLoading || isLoadingOptions}
            >
              <SelectTrigger id="idUser">
                <SelectValue placeholder="Selecciona un usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Sin asignar</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || isLoadingOptions}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
