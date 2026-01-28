"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ActivitySummarySection() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas operaciones en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for recent activity */}
            <p className="text-sm text-muted-foreground">
              Las actividades recientes aparecerán aquí
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Vista general del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder for summary */}
            <p className="text-sm text-muted-foreground">
              El resumen del sistema aparecerá aquí
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
