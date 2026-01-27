'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import type { Mensaje } from '@/types/mensaje'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface MensajeModalProps {
  isOpen: boolean
  onClose: () => void
  mensaje: Mensaje | null
}

export function MensajeModal({ isOpen, onClose, mensaje }: MensajeModalProps) {
  if (!mensaje) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle del Mensaje</DialogTitle>
          <DialogDescription>
            Mensaje recibido el {mensaje.created_at ? format(new Date(mensaje.created_at), 'PPP', { locale: es }) : 'Fecha desconocida'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Nombre</Label>
              <p className="font-medium">{mensaje.nombre}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{mensaje.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Mensaje</Label>
            <div className="rounded-md bg-muted p-4">
              <p className="whitespace-pre-wrap text-sm">{mensaje.mensaje}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
