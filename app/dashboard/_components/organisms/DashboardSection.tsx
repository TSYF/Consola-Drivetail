"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import StatCardsSection from "./sections/StatCardsSection";
import ActivitySummarySection from "./sections/ActivitySummarySection";

type SectionType = "stat-cards" | "activity-summary";

interface DashboardSectionProps {
  id: string;
  type: SectionType;
}

export default function DashboardSection({ id, type }: DashboardSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Render the appropriate section based on type
  const renderSection = () => {
    switch (type) {
      case "stat-cards":
        return <StatCardsSection />;
      case "activity-summary":
        return <ActivitySummarySection />;
      default:
        return null;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${
        isDragging ? "opacity-50 z-50" : ""
      } cursor-grab active:cursor-grabbing`}
    >
      {renderSection()}
    </div>
  );
}