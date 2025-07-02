export interface Task {
  id: string;
  company_id: string;
  property_id?: string;
  report_id?: string;
  insight_id?: string;
  title: string;
  description: string;
  priority: number; // 1-5 scale
  assigned_role: 'CFO' | 'PropertyManager' | 'Maintenance' | 'Accounting' | 'Leasing' | 'Other';
  assigned_to?: string;
  due_date: string;
  estimated_hours: number;
  actual_hours?: number;
  potential_value: number;
  source_insight: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  completed_at?: string;
  completed_by?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Relations
  properties?: Property;
  reports?: Report;
  insights?: Insight;
  task_outcomes?: TaskOutcome[];
  
  // Computed fields
  is_overdue?: boolean;
  days_until_due?: number;
}

export interface Property {
  id: string;
  name: string;
  address?: string;
  property_type?: 'residential' | 'commercial' | 'industrial' | 'mixed_use';
  square_footage?: number;
  units_count?: number;
  metadata?: Record<string, any>;
}

export interface Report {
  id: string;
  title: string;
  document_name?: string;
  report_type?: 'financial' | 'operational' | 'maintenance' | 'compliance' | 'lease';
  period_start?: string;
  period_end?: string;
  summary?: string;
}

export interface Insight {
  id: string;
  title: string;
  description?: string;
  confidence_score?: number;
  category?: string;
  insight_data?: Record<string, any>;
}

export interface TaskOutcome {
  id: string;
  task_id: string;
  outcome_description: string;
  success_rating?: number;
  actual_value_realized?: number;
  time_saved_hours?: number;
  metrics_before?: Record<string, any>;
  metrics_after?: Record<string, any>;
  lessons_learned?: string;
  should_repeat?: boolean;
  follow_up_required?: boolean;
  created_at: string;
  created_by?: string;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  totalPages: number;
  filters: {
    status: string;
    assignedRole: string;
    propertyId?: string;
    dateRange?: {
      from?: string;
      to?: string;
    } | null;
  };
  sort: {
    by: string;
    order: 'asc' | 'desc';
  };
}

export interface TaskFilters {
  status?: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'all';
  assignedRole?: 'CFO' | 'PropertyManager' | 'Maintenance' | 'Accounting' | 'Leasing' | 'all';
  propertyId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'dueDate' | 'priority' | 'potentialValue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  priorities?: number[];
}

export interface CompleteTaskRequest {
  completion_notes: string;
  actual_hours: number;
  actual_value?: number;
  success_rating?: number;
}

export interface UpdateTaskRequest {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  actual_hours?: number;
  assigned_to?: string;
  due_date?: string;
}