'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2 } from 'lucide-react'
import type { Servicio } from '@/types/servicio'

interface ServiciosTableProps {
  servicios: Servicio[]
  isLoading: boolean
  onEdit: (servicio: Servicio) => void
  onDelete: (id: number) => void
}

export function ServiciosTable({ servicios, isLoading, onEdit, onDelete }: ServiciosTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría ID</TableHead>
          <TableHead>Precio Min</TableHead>
          <TableHead>Precio Max</TableHead>
          <TableHead>Duración</TableHead>
          <TableHead>Estado</TableHead>
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
        ) : servicios.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8">
              No hay servicios registrados
            </TableCell>
          </TableRow>
        ) : (
          servicios.map((servicio) => (
            <TableRow key={servicio.id}>
              <TableCell className="font-medium">{servicio.nombre}</TableCell>
              <TableCell>{servicio.id_categoria}</TableCell>
              <TableCell>${servicio.precio_min}</TableCell>
              <TableCell>{servicio.precio_max ? `$${servicio.precio_max}` : '-'}</TableCell>
              <TableCell>{servicio.duracion_minutos} min</TableCell>
              <TableCell>
                <Badge variant={servicio.activo ? 'default' : 'secondary'}>
                  {servicio.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="icon" onClick={() => onEdit(servicio)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(servicio.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
