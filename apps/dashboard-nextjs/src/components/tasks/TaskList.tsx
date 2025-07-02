'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Clock, 
  DollarSign, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreHorizontal,
  Eye,
  Edit3,
  Mail,
  Trash2
} from 'lucide-react';
import { Task, TaskFilters, TasksResponse } from '@/types/tasks';
import { TaskDetail } from './TaskDetail';
import { cn } from '@/lib/utils';

interface TaskListProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  refreshTrigger?: number;
}

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  overdue: 'bg-red-100 text-red-800 border-red-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
};

const PRIORITY_COLORS = {
  1: 'bg-gray-100 text-gray-600',
  2: 'bg-blue-100 text-blue-600',
  3: 'bg-yellow-100 text-yellow-600',
  4: 'bg-orange-100 text-orange-600',
  5: 'bg-red-100 text-red-600',
};

const ROLE_COLORS = {
  CFO: 'bg-purple-100 text-purple-700',
  PropertyManager: 'bg-green-100 text-green-700',
  Maintenance: 'bg-orange-100 text-orange-700',
  Accounting: 'bg-blue-100 text-blue-700',
  Leasing: 'bg-pink-100 text-pink-700',
  Other: 'bg-gray-100 text-gray-700',
};

export function TaskList({ filters, onFiltersChange, refreshTrigger }: TaskListProps) {
  const [tasksData, setTasksData] = useState<TasksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== undefined && value !== 'all')
        ),
      });

      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data: TasksResponse = await response.json();
      setTasksData(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters, currentPage, refreshTrigger]);

  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(new Set(tasksData?.tasks.map(task => task.id) || []));
    } else {
      setSelectedTasks(new Set());
    }
  };

  const getStatusIcon = (task: Task) => {
    if (task.status === 'completed') {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    if (task.is_overdue) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (task.status === 'in_progress') {
      return <Clock className="h-4 w-4 text-blue-600" />;
    }
    return <Circle className="h-4 w-4 text-gray-400" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getDueDateColor = (task: Task) => {
    if (task.is_overdue) return 'text-red-600';
    if (task.days_until_due !== undefined && task.days_until_due <= 1) return 'text-orange-600';
    if (task.days_until_due !== undefined && task.days_until_due <= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tasksData?.tasks.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500">No tasks found</div>
            <p className="text-sm text-gray-400 mt-2">
              Try adjusting your filters or upload a document to generate tasks
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Tasks ({tasksData.total})</CardTitle>
            <div className="flex items-center gap-2">
              {selectedTasks.size > 0 && (
                <Badge variant="secondary">
                  {selectedTasks.size} selected
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTasks.size === tasksData.tasks.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasksData.tasks.map((task) => (
                  <TableRow 
                    key={task.id}
                    className={cn(
                      "cursor-pointer hover:bg-gray-50",
                      task.is_overdue && "bg-red-50"
                    )}
                    onClick={() => setSelectedTask(task)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={(checked) => 
                          handleSelectTask(task.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {getStatusIcon(task)}
                        <div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="font-medium truncate max-w-[200px]">
                                  {task.title}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-xs">
                                  <p className="font-semibold">{task.title}</p>
                                  <p className="text-sm mt-1">{task.description}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {task.properties?.name || 'No property'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={ROLE_COLORS[task.assigned_role]}
                      >
                        {task.assigned_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={cn("text-sm", getDueDateColor(task))}>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(task.due_date)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS]}
                      >
                        P{task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        {formatCurrency(task.potential_value)}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Email Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {tasksData.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, tasksData.total)} of {tasksData.total} tasks
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === tasksData.totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          open={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdate={fetchTasks}
        />
      )}
    </>
  );
}
