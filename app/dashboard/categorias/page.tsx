'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import type { Categoria } from '@/types/categoria'
import { CategoriaModal } from '@/app/dashboard/categorias/_components/categoria-modal'
import { toast } from '@/hooks/use-toast'

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)

  const fetchCategorias = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.get<Categoria[]>('/api/categoria')
      setCategorias(data)
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al cargar categorías'}</>, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return
    try {
      await apiClient.delete(`/api/categoria/${id}`)
      toast({ title: 'Éxito', description: <>{'Categoría eliminada correctamente'}</> })
      fetchCategorias()
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al eliminar categoría'}</>, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
          <p className="text-muted-foreground mt-2">Gestiona las categorías de servicios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={fetchCategorias}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => { setEditing(null); setIsModalOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorías</CardTitle>
          <CardDescription>{categorias.length} categoría{categorias.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
              ) : categorias.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">No hay categorías</TableCell></TableRow>
              ) : (
                categorias.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.nombre}</TableCell>
                    <TableCell><code className="text-sm">{cat.slug}</code></TableCell>
                    <TableCell>{cat.orden}</TableCell>
                    <TableCell>
                      <Badge variant={cat.activo ? 'default' : 'secondary'}>
                        {cat.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => { setEditing(cat); setIsModalOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(cat.id)}>
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

      <CategoriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoria={editing}
        onSuccess={() => { setIsModalOpen(false); fetchCategorias() }}
      />
    </div>
  )
}
