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
import type { Servicio, CreateServicioDto } from '@/types/servicio'
import { toast } from '@/hooks/use-toast'

interface ServicioModalProps {
  isOpen: boolean
  onClose: () => void
  servicio: Servicio | null
  onSuccess: () => void
}

export function ServicioModal({ isOpen, onClose, servicio, onSuccess }: ServicioModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<CreateServicioDto>({
    nombre: '',
    descripcion: '',
    precio_min: 0,
    precio_max: 0,
    duracion_minutos: 60,
    requiere_reserva: true,
    activo: true,
    imagen: '',
    id_categoria: 1,
  })

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre: servicio.nombre,
        descripcion: servicio.descripcion,
        precio_min: servicio.precio_min,
        precio_max: servicio.precio_max,
        duracion_minutos: servicio.duracion_minutos,
        requiere_reserva: servicio.requiere_reserva,
        activo: servicio.activo,
        imagen: servicio.imagen || '',
        id_categoria: servicio.id_categoria,
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        precio_min: 0,
        precio_max: 0,
        duracion_minutos: 60,
        requiere_reserva: true,
        activo: true,
        imagen: '',
        id_categoria: 1,
      })
    }
  }, [servicio, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (servicio) {
        await apiClient.patch(`/api/servicio/${servicio.id}`, formData)
        toast({ title: 'Éxito', description: <>{'Servicio actualizado correctamente'}</> })
      } else {
        await apiClient.post('/api/servicio', formData)
        toast({ title: 'Éxito', description: <>{'Servicio creado correctamente'}</> })
      }
      onSuccess()
    } catch (error) {
      toast({ title: 'Error', description: <>{'Error al guardar servicio'}</>, variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{servicio ? 'Editar' : 'Nuevo'} Servicio</DialogTitle>
          <DialogDescription>
            {servicio ? 'Actualiza los datos del servicio' : 'Completa el formulario para crear un nuevo servicio'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input id="nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea id="descripcion" value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio_min">Precio Mínimo *</Label>
              <Input id="precio_min" type="number" value={formData.precio_min} onChange={(e) => setFormData({ ...formData, precio_min: Number(e.target.value) })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_max">Precio Máximo</Label>
              <Input id="precio_max" type="number" value={formData.precio_max} onChange={(e) => setFormData({ ...formData, precio_max: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duracion_minutos">Duración (minutos)</Label>
              <Input id="duracion_minutos" type="number" value={formData.duracion_minutos} onChange={(e) => setFormData({ ...formData, duracion_minutos: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_categoria">ID Categoría *</Label>
              <Input id="id_categoria" type="number" value={formData.id_categoria} onChange={(e) => setFormData({ ...formData, id_categoria: Number(e.target.value) })} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imagen">Imagen (Base64)</Label>
            <Textarea id="imagen" value={formData.imagen} onChange={(e) => setFormData({ ...formData, imagen: e.target.value })} placeholder="data:image/png;base64,..." rows={2} />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center space-x-2">
              <Switch id="requiere_reserva" checked={formData.requiere_reserva} onCheckedChange={(checked) => setFormData({ ...formData, requiere_reserva: checked })} />
              <Label htmlFor="requiere_reserva">Requiere reserva</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="activo" checked={formData.activo} onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })} />
              <Label htmlFor="activo">Servicio activo</Label>
            </div>
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
