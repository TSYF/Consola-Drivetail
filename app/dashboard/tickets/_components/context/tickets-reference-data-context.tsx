"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  EstadoTicket,
  ImportanciaTicket,
  UrgenciaTicket,
} from "@/types/ticket";
import { Servicio } from "@/types/servicio";
import { User } from "@/lib/auth";
import { apiClient } from "@/lib/api-client";

interface TicketsReferenceData {
  estados: EstadoTicket[];
  importancias: ImportanciaTicket[];
  urgencias: UrgenciaTicket[];
  servicios: Servicio[];
  users: User[];
  isLoading: boolean;
}

const TicketsReferenceDataContext = createContext<
  TicketsReferenceData | undefined
>(undefined);

export function TicketsReferenceDataProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [estados, setEstados] = useState<EstadoTicket[]>([]);
  const [importancias, setImportancias] = useState<ImportanciaTicket[]>([]);
  const [urgencias, setUrgencias] = useState<UrgenciaTicket[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReferenceData();
  }, []);

  const fetchReferenceData = async () => {
    try {
      const [
        estadosData,
        importanciasData,
        urgenciasData,
        serviciosData,
        usersData,
      ] = await Promise.all([
        apiClient.get<EstadoTicket[]>("/api/estado-ticket"),
        apiClient.get<ImportanciaTicket[]>("/api/importancia-ticket"),
        apiClient.get<UrgenciaTicket[]>("/api/urgencia-ticket"),
        apiClient.get<Servicio[]>("/api/servicio"),
        apiClient.get<{ users: User[] } | User[]>("/api/auth/admin/list-users"),
      ]);

      setEstados(estadosData);
      setImportancias(importanciasData);
      setUrgencias(urgenciasData);
      setServicios(serviciosData);
      setUsers(Array.isArray(usersData) ? usersData : usersData.users);
    } catch (error) {
      // Silently fail - components will handle empty arrays
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TicketsReferenceDataContext.Provider
      value={{
        estados,
        importancias,
        urgencias,
        servicios,
        users,
        isLoading,
      }}
    >
      {children}
    </TicketsReferenceDataContext.Provider>
  );
}

export function useTicketsReferenceData() {
  const context = useContext(TicketsReferenceDataContext);
  if (context === undefined) {
    throw new Error(
      "useTicketsReferenceData must be used within TicketsReferenceDataProvider",
    );
  }
  return context;
}
