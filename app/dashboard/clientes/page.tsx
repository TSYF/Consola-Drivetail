'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientsTable } from '@/app/dashboard/clientes/_components/clients-table'
import { ClientModal } from '@/app/dashboard/clientes/_components/client-modal'
import { toast } from '@/hooks/use-toast'
import { Plus, RefreshCw, Users } from 'lucide-react'
import type { Cliente } from '@/types/cliente'
import { apiClient } from '@/lib/api-client'
import { Spinner } from '@/components/ui/spinner'

export default function ClientesPage() {
  const [clients, setClients] = useState<Cliente[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Cliente | undefined>()

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const data = await apiClient.get<Cliente[]>('/api/cliente')
      setClients(data)
    } catch (error) {
      console.error('[v0] Error fetching clients:', error)
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los clientes',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleCreateNew = () => {
    setSelectedClient(undefined)
    setIsModalOpen(true)
  }

  const handleEdit = (client: Cliente) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await apiClient.delete(`/api/cliente/${id}`)
      toast({
        title: 'Cliente eliminado',
        description: 'El cliente ha sido eliminado exitosamente',
      })
      fetchClients()
    } catch (error) {
      console.error('[v0] Error deleting client:', error)
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el cliente',
        variant: 'destructive',
      })
    }
  }

  const handleSuccess = () => {
    toast({
      title: selectedClient ? 'Cliente actualizado' : 'Cliente creado',
      description: selectedClient
        ? 'El cliente ha sido actualizado exitosamente'
        : 'El nuevo cliente ha sido agregado exitosamente',
    })
    fetchClients()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los clientes de tu negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchClients}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="sr-only">Recargar</span>
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>
                {clients.length} {clients.length === 1 ? 'cliente registrado' : 'clientes registrados'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8" />
            </div>
          ) : (
            <ClientsTable
              clients={clients}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <ClientModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        client={selectedClient}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
