import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../../types';
import { Avatar } from './Avatar';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  isDragging?: boolean;
}

const PRIORITY_STYLES: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const isOverdue = (dueDate?: string) => !!dueDate && new Date(dueDate) < new Date();
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const TaskCard = ({ task, onClick, isDragging }: TaskCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition-shadow ${
        isOverdue(task.dueDate) && task.status !== 'done' ? 'border-l-4 border-red-500' : ''
      }`}
    >
      <h4 className="font-medium">{task.title}</h4>

      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`text-xs ${isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
            {isOverdue(task.dueDate) && task.status !== 'done' ? '⚠ ' : ''}Due {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {task.assignee && (
        <div className="mt-2 flex items-center gap-2">
          <Avatar name={task.assignee.name} avatarUrl={task.assignee.avatarUrl} size="sm" />
          <span className="text-sm text-gray-600">{task.assignee.name}</span>
        </div>
      )}
    </div>
  );
};
