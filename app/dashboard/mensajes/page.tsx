'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RefreshCw, Eye, Trash2, Mail } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import type { Mensaje } from '@/types/mensaje'
import { MensajeModal } from '@/app/dashboard/mensajes/_components/mensaje-modal'
import { toast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function MensajesPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null)

  const fetchMensajes = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Mensaje[]>('/api/mensaje')
      setMensajes(data)
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al cargar mensajes'}</>, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMensajes()
  }, [])

  const handleView = (mensaje: Mensaje) => {
    setSelectedMensaje(mensaje)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este mensaje?')) return
    try {
      await apiClient.delete(`/api/mensaje/${id}`)
      toast({ title: 'Éxito', description: <>{'Mensaje eliminado correctamente'}</> })
      fetchMensajes()
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al eliminar mensaje'}</>, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mensajes</h1>
          <p className="text-muted-foreground mt-2">Mensajes recibidos de los clientes</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchMensajes}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Mensajes</CardTitle>
          <CardDescription>{mensajes.length} mensaje{mensajes.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : mensajes.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No hay mensajes</TableCell></TableRow>
              ) : (
                mensajes.map((mensaje) => (
                  <TableRow key={mensaje.id}>
                    <TableCell className="font-medium">{mensaje.nombre}</TableCell>
                    <TableCell>{mensaje.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{mensaje.mensaje}</TableCell>
                    <TableCell>{mensaje.created_at ? format(new Date(mensaje.created_at), 'PP', { locale: es }) : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleView(mensaje)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(mensaje.id)}>
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

      <MensajeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mensaje={selectedMensaje}
      />
    </div>
  )
}
