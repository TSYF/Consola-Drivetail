"use client";

import { useState } from "react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DashboardSection from "./_components/organisms/DashboardSection";
import { Calendar, CreditCard, Package, Users } from "lucide-react";

// Define section types
type SectionType = "stat-cards" | "activity-summary";

interface DashboardSectionData {
  id: string;
  type: SectionType;
}

const initialSections: DashboardSectionData[] = [
  { id: "stat-cards-section", type: "stat-cards" },
  { id: "activity-summary-section", type: "activity-summary" },
];

export default function DashboardPage() {
  const [sections, setSections] = useState<DashboardSectionData[]>(initialSections);

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
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  return (
    <main className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido al panel de administración de DriveTail
        </p>
      </section>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sections} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">
            {sections.map((section) => (
              <DashboardSection
                key={section.id}
                id={section.id}
                type={section.type}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </main>
  );
}
