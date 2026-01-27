"use client";

import { useState, useEffect } from "react";
import {
  TicketFilters,
  EstadoTicket,
  ImportanciaTicket,
  UrgenciaTicket,
} from "@/types/ticket";
import { Servicio } from "@/types/servicio";
import { User } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface TicketsToolbarProps {
  onFilterChange: (filters: TicketFilters) => void;
  activeFilters: TicketFilters;
  estados: EstadoTicket[];
  importancias: ImportanciaTicket[];
  urgencias: UrgenciaTicket[];
  servicios: Servicio[];
  users: User[];
}

export function TicketsToolbar({
  onFilterChange,
  activeFilters,
  estados,
  importancias,
  urgencias,
  servicios,
  users,
}: TicketsToolbarProps) {
  const [searchInput, setSearchInput] = useState(activeFilters.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...activeFilters, search: searchInput || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleClearFilters = () => {
    setSearchInput("");
    onFilterChange({});
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.search) count++;
    if (activeFilters.status?.length) count++;
    if (activeFilters.importance?.length) count++;
    if (activeFilters.urgency?.length) count++;
    if (activeFilters.service?.length) count++;
    if (activeFilters.user?.length) count++;
    if (activeFilters.dateFrom) count++;
    if (activeFilters.dateTo) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tickets por nombre o descripción..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {/* Status Filter */}
          <Select
            value={activeFilters.status?.[0]?.toString() || ""}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                status: value ? [Number.parseInt(value)] : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos</SelectItem>
              {estados.map((estado) => (
                <SelectItem key={estado.id} value={estado.id.toString()}>
                  {estado.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Importance Filter */}
          <Select
            value={activeFilters.importance?.[0]?.toString() || ""}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                importance: value ? [Number.parseInt(value)] : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Importancia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas</SelectItem>
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

          {/* Urgency Filter */}
          <Select
            value={activeFilters.urgency?.[0]?.toString() || ""}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                urgency: value ? [Number.parseInt(value)] : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Urgencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todas</SelectItem>
              {urgencias.map((urgencia) => (
                <SelectItem key={urgencia.id} value={urgencia.id.toString()}>
                  {urgencia.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Service Filter */}
          <Select
            value={activeFilters.service?.[0]?.toString() || ""}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                service: value ? [Number.parseInt(value)] : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Servicio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos</SelectItem>
              {servicios.map((servicio) => (
                <SelectItem key={servicio.id} value={servicio.id.toString()}>
                  {servicio.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* User Filter */}
          <Select
            value={activeFilters.user?.[0] || ""}
            onValueChange={(value) =>
              onFilterChange({
                ...activeFilters,
                user: value ? [value] : undefined,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Usuario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Todos</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            </Button>
          )}
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Desde</label>
            <Input
              type="date"
              value={activeFilters.dateFrom || ""}
              onChange={(e) =>
                onFilterChange({
                  ...activeFilters,
                  dateFrom: e.target.value || undefined,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Hasta</label>
            <Input
              type="date"
              value={activeFilters.dateTo || ""}
              onChange={(e) =>
                onFilterChange({
                  ...activeFilters,
                  dateTo: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
