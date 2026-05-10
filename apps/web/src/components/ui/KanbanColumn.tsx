import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface KanbanColumnProps {
  id: string;
  title: string;
  count: number;
  children: ReactNode;
}

export const KanbanColumn = ({ id, title, count, children }: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-gray-100 p-4 rounded-lg transition-colors ${isOver ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
    >
      <h3 className="font-medium mb-4 capitalize">
        {title} ({count})
      </h3>
      {children}
    </div>
  );
};
