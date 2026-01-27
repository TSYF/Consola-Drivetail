'use client'

import React from "react"

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Spinner } from '@/components/ui/spinner'
import { apiClient } from '@/lib/api-client'
import type { Categoria, CreateCategoriaDto } from '@/types/categoria'
import { toast } from '@/hooks/use-toast'

interface CategoriaModalProps {
  isOpen: boolean
  onClose: () => void
  categoria: Categoria | null
  onSuccess: () => void
}

export function CategoriaModal({ isOpen, onClose, categoria, onSuccess }: CategoriaModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateCategoriaDto>({
    nombre: '',
    description: '',
    slug: '',
    orden: 0,
    activo: true,
    icono: '',
  })

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre,
        description: categoria.description || '',
        slug: categoria.slug,
        orden: categoria.orden,
        activo: categoria.activo,
        icono: categoria.icono || '',
      })
    } else {
      setFormData({
        nombre: '',
        description: '',
        slug: '',
        orden: 0,
        activo: true,
        icono: '',
      })
    }
  }, [categoria, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (categoria) {
        await apiClient.patch(`/api/categoria/${categoria.id}`, formData)
        toast({ title: 'Éxito', description: <>{'Categoría actualizada correctamente'}</> })
      } else {
        await apiClient.post('/api/categoria', formData)
        toast({ title: 'Éxito', description: <>{'Categoría creada correctamente'}</> })
      }
      onSuccess()
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al guardar categoría'}</>, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{categoria ? 'Editar' : 'Nueva'} Categoría</DialogTitle>
          <DialogDescription>
            {categoria ? 'Actualiza los datos de la categoría' : 'Completa el formulario para crear una nueva categoría'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="orden">Orden *</Label>
              <Input id="orden" type="number" value={formData.orden} onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icono">Icono</Label>
              <Input id="icono" value={formData.icono} onChange={(e) => setFormData({ ...formData, icono: e.target.value })} placeholder="lucide-icon-name" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="activo" checked={formData.activo} onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })} />
            <Label htmlFor="activo">Categoría activa</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <><Spinner className="mr-2 h-4 w-4" />Guardando...</> : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
