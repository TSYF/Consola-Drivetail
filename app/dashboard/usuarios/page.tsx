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
import { Plus, RefreshCw, Shield, ShieldOff, Trash2, Edit } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import type { User, ListUsersResponse } from "@/types/user";
import { UserModal } from "@/app/dashboard/usuarios/_components/user-modal";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function UsuariosPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<ListUsersResponse>("/api/auth/admin/list-users");
      setUsers(data.users);
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cargar usuarios"}</>,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user: User) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el usuario ${user.name} (${user.email})? Esta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await apiClient.post("/api/auth/admin/remove-user", {
        userId: user.id,
      });
      toast({
        title: "Éxito",
        description: <>{"Usuario eliminado correctamente"}</>,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al eliminar usuario"}</>,
        variant: "destructive",
      });
    }
  };

  const handleBanToggle = async (user: User) => {
    try {
      if (user.banned) {
        await apiClient.post("/api/auth/admin/unban-user", {
          userId: user.id,
        });
        toast({
          title: "Éxito",
          description: <>{"Usuario desbloqueado correctamente"}</>,
        });
      } else {
        await apiClient.post("/api/auth/admin/ban-user", {
          userId: user.id,
          banReason: "Bloqueado por administrador",
        });
        toast({
          title: "Éxito",
          description: <>{"Usuario bloqueado correctamente"}</>,
        });
      }
      fetchUsers();
    } catch (error) {
      toast({
        title: "Error",
        description: <>{"Error al cambiar estado del usuario"}</>,
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeVariant = (role: string | null) => {
    if (!role) return "secondary";
    if (role === "admin") return "default";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Usuario
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
          <CardDescription>
            {users.length} usuario{users.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Verificado</TableHead>
                <TableHead>Registrado</TableHead>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No hay usuarios
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role || "Sin rol"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Bloqueado</Badge>
                      ) : (
                        <Badge variant="outline">Activo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge variant="outline">Sí</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.createdAt), "PP", { locale: es })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditing(user);
                            setIsModalOpen(true);
                          }}
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleBanToggle(user)}
                          title={user.banned ? "Desbloquear" : "Bloquear"}
                        >
                          {user.banned ? (
                            <Shield className="h-4 w-4" />
                          ) : (
                            <ShieldOff className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(user)}
                          title="Eliminar usuario"
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

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={editing}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchUsers();
        }}
      />
    </div>
  );
}
