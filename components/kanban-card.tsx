'use client';

import { Task } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
}

export function KanbanCard({ task, onEdit, onDelete, isDragging }: KanbanCardProps) {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = task.dueDate && task.dueDate < new Date() && task.status !== 'completed';

  return (
    <Card 
      className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm ${
        isDragging ? 'opacity-50 rotate-2' : ''
      } ${isOverdue ? 'border-red-300' : 'border-gray-200 dark:border-gray-700'}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`font-medium text-sm text-balance leading-tight ${
              task.status === 'completed' ? 'line-through text-muted-foreground' : ''
            }`}>
              {task.title}
            </h4>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 h-auto">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit className="h-3 w-3 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {task.description && (
            <p className="text-xs text-muted-foreground text-pretty line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {task.dueDate && (
                <div className={`flex items-center gap-1 ${isOverdue ? 'text-destructive' : ''}`}>
                  <Calendar className="h-3 w-3" />
                  {format(task.dueDate, 'MMM d')}
                </div>
              )}
              
              {task.estimatedTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.estimatedTime}m
                </div>
              )}
            </div>
          </div>
          
          {task.category && (
            <Badge variant="outline" className="text-xs w-fit">
              {task.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}