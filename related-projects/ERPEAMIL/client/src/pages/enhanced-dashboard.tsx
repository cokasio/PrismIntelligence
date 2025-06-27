import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatSession, Project } from '@shared/schema';
import { ProjectTree } from '@/components/projects/project-tree';
import { SessionList } from '@/components/chat/session-list';
import { ChatInterface } from '@/components/chat/chat-interface';
import { AgentPanel } from '@/components/chat/agent-panel';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Menu, PanelRightClose, Folder } from 'lucide-react';
import '@/styles/enhanced-layout.css';

export default function EnhancedDashboard() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isSessionSidebarVisible, setIsSessionSidebarVisible] = useState(true);
  const [isAgentPanelVisible, setIsAgentPanelVisible] = useState(false);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: any) => {
      const response = await apiRequest('POST', '/api/sessions', sessionData);
      return response.json();
    },
    onSuccess: (newSession: ChatSession) => {
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
      setCurrentSession(newSession);
      toast({
        title: "Session Created",
        description: "New analysis session is ready",
      });
    },
  });

  const handleNewSession = async () => {
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
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar Container */}
      <div className="sidebar-container">
        {/* Projects Navigation */}
        <div className="nav-sidebar">
          <div className="nav-sidebar-header">
            <span className="nav-sidebar-title">Projects</span>
          </div>
          <ProjectTree
            onProjectSelect={setCurrentProject}
            selectedProjectId={currentProject?.id}
          />
        </div>

        {/* Session List */}
        <div className={`session-sidebar ${!isSessionSidebarVisible ? 'collapsed' : ''}`}>
          <SessionList
            sessions={[]}
            currentSessionId={currentSession?.id}
            onSessionSelect={setCurrentSession}
            onNewSession={handleNewSession}
            projectId={currentProject?.id}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="main-container">
        {/* Header */}
        <header className="app-header">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentProject && (
              <>
                <div className="project-icon" style={{ backgroundColor: currentProject.color + '20', color: currentProject.color }}>
                  <Folder size={16} />
                </div>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{currentProject.name}</span>
                <span style={{ color: '#e5e7eb' }}>/</span>
              </>
            )}
            {currentSession ? (
              <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#1B2951' }}>
                {currentSession.title}
              </h1>
            ) : (
              <h1 style={{ fontSize: '16px', fontWeight: '600', color: '#6b7280' }}>
                Select or create a session
              </h1>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn-ghost"
              onClick={() => setIsSessionSidebarVisible(!isSessionSidebarVisible)}
            >
              <Menu size={20} />
            </button>
            <button
              className="btn-ghost"
              onClick={() => setIsAgentPanelVisible(!isAgentPanelVisible)}
            >
              <PanelRightClose size={20} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          <main className="main-content">
            <ChatInterface
              session={currentSession}
              onNewSession={handleNewSession}
            />
          </main>

          {/* Agent Panel */}
          {isAgentPanelVisible && (
            <aside className="right-panel">
              <AgentPanel sessionId={currentSession?.id} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}