import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatSession, Project } from '@shared/schema';
import { ChatHistory } from '@/components/chat/chat-history-clean';
import { ModernChatInterface } from '@/components/chat/modern-chat-interface';
import { AgentStatus } from '@/components/chat/agent-status';
import { ProjectTree } from '@/components/projects/project-tree';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Folder, FolderOpen, X, MessageSquare } from 'lucide-react';
import { ErrorBoundary } from '@/components/error/error-boundary';
import { Link } from 'wouter';

export default function Dashboard() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(false);
  const [isProjectSidebarVisible, setIsProjectSidebarVisible] = useState(true);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: { title: string; source: string; status: string }) => {
      const response = await apiRequest('POST', '/api/sessions', sessionData);
      return response.json();
    },
    onSuccess: (newSession: ChatSession) => {
      console.log('New session created:', newSession);
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setCurrentSession(newSession);
      // Force refetch messages
      queryClient.invalidateQueries({ queryKey: ['/api/sessions', newSession.id, 'messages'] });
      toast({
        title: "Session Created",
        description: "New analysis session is ready",
      });
    },
    onError: (error: any) => {
      console.error('Session creation error:', error);
      toast({
        title: "Error",
        description: "Failed to create new session. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
  };

  const handleNewSession = async () => {
    setIsCreatingSession(true);
    try {
      const sessionData = {
        title: `Analysis Session - ${new Date().toLocaleString()}`,
        source: 'manual',
        status: 'active',
        projectId: currentProject?.id || null
      };
      
      await createSessionMutation.mutateAsync(sessionData);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setIsSidebarLocked(!isSidebarVisible); // Lock when opening, unlock when closing
  };

  const handleSidebarHover = (isHovering: boolean) => {
    if (!isSidebarLocked) {
      setIsSidebarVisible(isHovering);
    }
  };

  const handleToggleRightSidebar = () => {
    setIsRightSidebarVisible(!isRightSidebarVisible);
  };

  return (
    <div className="min-h-screen bg-muted/30 relative">
      <div className="flex h-screen">
        {/* Project Sidebar */}
        {isProjectSidebarVisible && (
          <div className="w-64 border-r border-border bg-background/50 flex flex-col">
            <div className="border-b p-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Projects & Folders</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsProjectSidebarVisible(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ProjectTree
              onProjectSelect={(project) => {
                setCurrentProject(project);
                // Filter sessions by project when project is selected
                queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
              }}
              selectedProjectId={currentProject?.id}
            />
          </div>
        )}

        {/* Chat History Sidebar */}
        <ChatHistory
          onSessionSelect={handleSessionSelect}
          currentSessionId={currentSession?.id}
          isVisible={isSidebarVisible}
          isLocked={isSidebarLocked}
          onNewSession={handleNewSession}
          onClose={handleToggleSidebar}
          onHover={handleSidebarHover}
          projectId={currentProject?.id}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1">
            <ErrorBoundary>
              <ModernChatInterface
                key={currentSession?.id || 'no-session'}
                session={currentSession}
                onToggleSidebar={handleToggleSidebar}
                onNewSession={handleNewSession}
                onToggleRightSidebar={handleToggleRightSidebar}
                isRightSidebarVisible={isRightSidebarVisible}
                onToggleProjectSidebar={() => setIsProjectSidebarVisible(!isProjectSidebarVisible)}
                currentProject={currentProject}
                isCreatingSession={isCreatingSession}
              />
            </ErrorBoundary>
          </div>
          
          {/* Agent Status Panel - Desktop Only */}
          {isRightSidebarVisible && (
            <div className="w-80 border-l border-border bg-background/50 relative">
              <AgentStatus sessionId={currentSession?.id} onClose={handleToggleRightSidebar} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
