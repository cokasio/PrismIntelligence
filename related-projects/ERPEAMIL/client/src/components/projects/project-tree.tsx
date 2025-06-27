import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Folder, FolderOpen, FolderPlus, MoreVertical, Edit, Trash2, 
  Archive, ChevronRight, ChevronDown, Briefcase, BarChart3,
  FileText, Building2, Users, TrendingUp
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Project } from '@shared/schema';

interface ProjectTreeProps {
  onProjectSelect: (project: Project) => void;
  selectedProjectId?: number | null;
}

const PROJECT_ICONS = {
  folder: Folder,
  briefcase: Briefcase,
  chart: BarChart3,
  document: FileText,
  building: Building2,
  users: Users,
  trending: TrendingUp,
};

const PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
];

export function ProjectTree({ onProjectSelect, selectedProjectId }: ProjectTreeProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: '',
    parentId: null as number | null,
    icon: 'folder',
    color: '#6366f1',
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: typeof newProjectData) => {
      const response = await apiRequest('POST', '/api/projects', projectData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setIsCreateDialogOpen(false);
      setNewProjectData({
        name: '',
        description: '',
        parentId: null,
        icon: 'folder',
        color: '#6366f1',
      });
      toast({
        title: "Project Created",
        description: "New project has been created successfully",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Project> }) => {
      const response = await apiRequest('PUT', `/api/projects/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      setEditingProject(null);
      toast({
        title: "Project Updated",
        description: "Project has been updated successfully",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/projects/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project Deleted",
        description: "Project has been deleted successfully",
      });
    },
  });

  const toggleExpanded = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getProjectChildren = (parentId: number | null) => {
    return projects.filter(p => p.parentId === parentId && !p.isArchived);
  };

  const renderProject = (project: Project, level: number = 0) => {
    const hasChildren = getProjectChildren(project.id).length > 0;
    const isExpanded = expandedProjects.has(project.id);
    const isSelected = selectedProjectId === project.id;
    const Icon = PROJECT_ICONS[project.icon as keyof typeof PROJECT_ICONS] || Folder;

    return (
      <div key={project.id}>
        <div
          className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
            isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(project.id);
              }}
            >
              {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div
            className="flex-1 flex items-center gap-2"
            onClick={() => onProjectSelect(project)}
          >
            <div
              className="w-5 h-5 rounded flex items-center justify-center"
              style={{ backgroundColor: project.color + '20', color: project.color }}
            >
              <Icon className="h-3 w-3" />
            </div>
            <span className="text-sm font-medium truncate">{project.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 p-0 h-6 w-6"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setNewProjectData({ ...newProjectData, parentId: project.id });
                setIsCreateDialogOpen(true);
              }}>
                <FolderPlus className="h-3 w-3 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditingProject(project)}>
                <Edit className="h-3 w-3 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                updateProjectMutation.mutate({ 
                  id: project.id, 
                  updates: { isArchived: true } 
                });
              }}>
                <Archive className="h-3 w-3 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => deleteProjectMutation.mutate(project.id)}
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {getProjectChildren(project.id).map(child => renderProject(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="text-sm font-semibold">Projects</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <FolderPlus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newProjectData.name}
                  onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newProjectData.description}
                  onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Icon</label>
                <div className="grid grid-cols-7 gap-2 mt-2">
                  {Object.entries(PROJECT_ICONS).map(([key, Icon]) => (
                    <Button
                      key={key}
                      variant={newProjectData.icon === key ? 'default' : 'outline'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setNewProjectData({ ...newProjectData, icon: key })}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <div className="grid grid-cols-8 gap-2 mt-2">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      className={`h-8 w-8 rounded border-2 ${
                        newProjectData.color === color ? 'border-primary' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewProjectData({ ...newProjectData, color })}
                    />
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createProjectMutation.mutate(newProjectData)}
                disabled={!newProjectData.name}
              >
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {getProjectChildren(null).map(project => renderProject(project))}
        </div>
      </ScrollArea>

      {/* Edit Project Dialog */}
      {editingProject && (
        <Dialog open={!!editingProject} onOpenChange={() => setEditingProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="Project name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingProject.description || ''}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <Button
                className="w-full"
                onClick={() => updateProjectMutation.mutate({
                  id: editingProject.id,
                  updates: {
                    name: editingProject.name,
                    description: editingProject.description,
                  }
                })}
              >
                Update Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}