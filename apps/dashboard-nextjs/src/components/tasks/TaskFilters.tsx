'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  Filter, 
  X, 
  Search,
  Calendar as CalendarIcon,
  Save,
  Trash2
} from 'lucide-react';
import { TaskFilters } from '@/types/tasks';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  className?: string;
}

const ROLES = [
  { value: 'all', label: 'All Roles' },
  { value: 'CFO', label: 'CFO' },
  { value: 'PropertyManager', label: 'Property Manager' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Leasing', label: 'Leasing' },
];

const STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'potentialValue', label: 'Value' },
  { value: 'createdAt', label: 'Created' },
];

const PRIORITIES = [1, 2, 3, 4, 5];

export function TaskFilters({ filters, onFiltersChange, className }: TaskFiltersProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedPriorities, setSelectedPriorities] = React.useState<number[]>([]);
  const [dateRange, setDateRange] = React.useState<{
    from?: Date;
    to?: Date;
  }>({});

  // Update filters when local state changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== filters.searchTerm) {
        onFiltersChange({
          ...filters,
          searchTerm: searchTerm || undefined,
        });
      }
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value,
    });
  };

  const handlePriorityToggle = (priority: number) => {
    const newPriorities = selectedPriorities.includes(priority)
      ? selectedPriorities.filter(p => p !== priority)
      : [...selectedPriorities, priority];
    
    setSelectedPriorities(newPriorities);
    onFiltersChange({
      ...filters,
      priorities: newPriorities.length > 0 ? newPriorities : undefined,
    });
  };

  const handleDateRangeChange = (range: { from?: Date; to?: Date }) => {
    setDateRange(range);
    onFiltersChange({
      ...filters,
      dateFrom: range.from?.toISOString(),
      dateTo: range.to?.toISOString(),
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedPriorities([]);
    setDateRange({});
    onFiltersChange({
      status: 'all',
      assignedRole: 'all',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status !== 'all') count++;
    if (filters.assignedRole && filters.assignedRole !== 'all') count++;
    if (filters.propertyId) count++;
    if (filters.dateFrom || filters.dateTo) count++;
    if (selectedPriorities.length > 0) count++;
    if (searchTerm) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Tasks</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <Label>Assigned Role</Label>
          <Select
            value={filters.assignedRole || 'all'}
            onValueChange={(value) => handleFilterChange('assignedRole', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((priority) => (
              <div key={priority} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority}`}
                  checked={selectedPriorities.includes(priority)}
                  onCheckedChange={() => handlePriorityToggle(priority)}
                />
                <Label
                  htmlFor={`priority-${priority}`}
                  className={cn(
                    "text-sm font-medium cursor-pointer px-2 py-1 rounded",
                    priority === 5 && "text-red-600",
                    priority === 4 && "text-orange-600",
                    priority === 3 && "text-yellow-600",
                    priority === 2 && "text-blue-600",
                    priority === 1 && "text-gray-600"
                  )}
                >
                  P{priority}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Due Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
                  ) : (
                    dateRange.from.toLocaleDateString()
                  )
                ) : (
                  "Pick a date range"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => handleDateRangeChange(range || {})}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Sorting */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="flex gap-2">
            <Select
              value={filters.sortBy || 'dueDate'}
              onValueChange={(value) => handleFilterChange('sortBy', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sortOrder || 'asc'}
              onValueChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">↑</SelectItem>
                <SelectItem value="desc">↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Save/Load Presets */}
        <div className="pt-2 border-t">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Save className="h-4 w-4 mr-1" />
              Save Preset
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Load Preset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
