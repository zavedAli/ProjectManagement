import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { Task } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove: (taskId: string, newStatus: string, newPosition: number) => void;
  onTaskClick?: (task: Task) => void;
}

export const KanbanBoard = ({ tasks, onTaskMove, onTaskClick }: KanbanBoardProps) => {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = ['todo', 'in_progress', 'done'] as const;
  
  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done'),
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === taskId);
    if (!activeTask) return;

    let newStatus = activeTask.status;
    let newPosition = activeTask.position;

    if (columns.includes(overId as any)) {
      newStatus = overId as typeof columns[number];
      newPosition = tasksByStatus[overId as keyof typeof tasksByStatus].length;
    } else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
        newPosition = overTask.position;
      }
    }

    if (newStatus !== activeTask.status || newPosition !== activeTask.position) {
      onTaskMove(taskId, newStatus, newPosition);
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {columns.map(status => (
          <KanbanColumn
            key={status}
            id={status}
            title={status.replace('_', ' ')}
            count={tasksByStatus[status].length}
          >
            <SortableContext items={tasksByStatus[status].map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasksByStatus[status].map(task => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
                ))}
              </div>
            </SortableContext>
          </KanbanColumn>
        ))}
      </div>
      
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} isDragging />}
      </DragOverlay>
    </DndContext>
  );
};
