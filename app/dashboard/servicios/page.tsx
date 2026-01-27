'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, RefreshCw } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Servicio } from '@/types/servicio'
import { ServiciosTable } from '@/app/dashboard/servicios/_components/servicios-table'
import { ServicioModal } from '@/app/dashboard/servicios/_components/servicio-modal'
import { toast } from '@/hooks/use-toast'

export default function ServiciosPage() {
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null)

  const fetchServicios = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Servicio[]>('/api/servicio')
      setServicios(data)
    } catch (error) {
      toast({
        title: 'Error',
        description: <>{'Error al cargar servicios'}</>,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServicios()
  }, [])

  const handleCreate = () => {
    setEditingServicio(null)
    setIsModalOpen(true)
  }

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      await apiClient.delete(`/api/servicio/${id}`)
      toast({
        title: 'Éxito',
        description: <>{'Servicio eliminado correctamente'}</>,
      })
      fetchServicios()
    } catch (error) {
      toast({
        title: 'Error',
        description: <>{'Error al eliminar servicio'}</>,
        variant: 'destructive',
      })
    }
  }

  const handleSuccess = () => {
    setIsModalOpen(false)
    fetchServicios()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Servicios</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los servicios disponibles en tu negocio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchServicios}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Servicio
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Servicios</CardTitle>
          <CardDescription>
            {servicios.length} servicio{servicios.length !== 1 ? 's' : ''} registrado{servicios.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ServiciosTable
            servicios={servicios}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <ServicioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        servicio={editingServicio}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
