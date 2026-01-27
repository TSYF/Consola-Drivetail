"use client";

import { useState } from "react";
import { StatCard } from "@/components/atoms/stat-card";
import { Calendar, CreditCard, Package, Users, type LucideIcon } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

interface StatCardData {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const initialCards: StatCardData[] = [
  {
    id: "total-reservas-card",
    title: "Total Reservas",
    value: 124,
    description: "+12% desde el mes pasado",
    icon: Calendar,
    trend: { value: 12, isPositive: true },
  },
  {
    id: "servicios-activos-card",
    title: "Servicios Activos",
    value: 28,
    description: "+2 nuevos esta semana",
    icon: Package,
  },
  {
    id: "clientes-card",
    title: "Clientes",
    value: 543,
    description: "+48 nuevos este mes",
    icon: Users,
    trend: { value: 9.6, isPositive: true },
  },
  {
    id: "ingresos-card",
    title: "Ingresos",
    value: "$12,456",
    description: "+8% desde el mes pasado",
    icon: CreditCard,
    trend: { value: 8, isPositive: true },
  },
];

export default function DashboardSectionOne() {
  const [cards, setCards] = useState<StatCardData[]>(initialCards);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={cards} strategy={rectSortingStrategy}>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <StatCard
              key={card.id}
              id={card.id}
              title={card.title}
              value={card.value}
              description={card.description}
              icon={card.icon}
              trend={card.trend}
            />
          ))}
        </section>
      </SortableContext>
    </DndContext>
  );
}
