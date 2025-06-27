import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu, Send, Plus, FileText, TrendingUp, BarChart, Brain, Upload, Mail, PanelRightClose, Folder, MessageSquare } from 'lucide-react';
import { Message } from './message';
import { FileUpload } from './file-upload';
import { useWebSocket } from '@/hooks/use-websocket';
import { ChatSession, ChatMessage as ChatMessageType, Project } from '@shared/schema';
import { Link } from 'wouter';

interface ModernChatInterfaceProps {
  session: ChatSession | null;
  onToggleSidebar: () => void;
  onNewSession: () => void;
  onToggleRightSidebar?: () => void;
  isRightSidebarVisible?: boolean;
  onToggleProjectSidebar?: () => void;
  currentProject?: Project | null;
  isCreatingSession?: boolean;
}

export function ModernChatInterface({ 
  session, 
  onToggleSidebar, 
  onNewSession, 
  onToggleRightSidebar, 
  isRightSidebarVisible,
  onToggleProjectSidebar,
  currentProject,
  isCreatingSession = false
}: ModernChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  
  console.log('ModernChatInterface - session:', session);

  // Access isCreatingSession from props
  const { data: messages = [], refetch: refetchMessages, isLoading: isMessagesLoading } = useQuery<ChatMessageType[]>({
    queryKey: ['/api/sessions', session?.id, 'messages'],
    enabled: !!session?.id,
    refetchInterval: 2000,
  });

  const { isConnected, joinSession, sendChatMessage } = useWebSocket({
    onMessage: (message) => {
      if (message.type === 'new_message') {
        refetchMessages();
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    },
    onConnect: () => {
      if (session?.id) {
        joinSession(session.id);
      }
    }
  });

  useEffect(() => {
    if (session?.id && isConnected) {
      joinSession(session.id);
    }
  }, [session?.id, isConnected, joinSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !session?.id) return;

    sendChatMessage(session.id, message);
    setMessage('');
  };

  if (!session) {
    // Show loading indicator if creating session
    if (isCreatingSession) {
      return (
        <div className="h-full flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/30">
          {/* Modern Header */}
          <header className="border-b border-border/20 bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-center h-16 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleSidebar}
                  className="hamburger-menu hover:bg-muted/50 transition-all duration-200 absolute left-0 rounded-lg p-2"
                >
                  <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
                </Button>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden sm:block text-center">
                    <h1 className="text-lg font-semibold text-foreground tracking-tight">Financial Analysis Platform</h1>
                    <p className="text-xs text-muted-foreground">Creating new session...</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Loading Indicator */}
          <div className="flex-1 overflow-auto">
            <div className="min-h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center py-16 px-8">
                <div className="w-full max-w-4xl mx-auto text-center space-y-12">
                  <div className="space-y-6">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full bg-primary/20"></div>
                      <h1 className="mt-8 text-2xl font-bold text-foreground tracking-tight">
                        Creating new analysis session...
                      </h1>
                      <p className="text-muted-foreground mt-4">
                        Please wait while we set up your analysis environment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="h-full flex flex-col bg-gradient-to-br from-background via-background/95 to-muted/30">
        {/* Modern Header */}
        <header className="border-b border-border/20 bg-background/80 backdrop-blur-md sticky top-0 z-40 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16 relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleSidebar}
                className="hamburger-menu hover:bg-muted/50 transition-all duration-200 absolute left-0 rounded-lg p-2"
              >
                <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
              </Button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <div className="hidden sm:block text-center">
                  <h1 className="text-lg font-semibold text-foreground tracking-tight">Financial Analysis Platform</h1>
                  <p className="text-xs text-muted-foreground">AI-powered multi-agent insights</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 absolute right-0">
                {onToggleRightSidebar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleRightSidebar}
                    className="hamburger-menu hover:bg-muted/50 transition-all duration-200 rounded-lg p-2"
                  >
                    <PanelRightClose className={`h-5 w-5 transition-transform duration-200 ${!isRightSidebarVisible ? 'rotate-180' : ''}`} />
                  </Button>
                )}
                <Button 
                  onClick={onNewSession} 
                  className="gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex flex-col">
            {/* Hero Section */}
            <div className="flex-1 flex items-center justify-center py-16 px-8">
              <div className="w-full max-w-4xl mx-auto text-center space-y-12">
                {/* Main Title */}
                <div className="space-y-6">
                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight">
                    Welcome to Financial Analysis
                  </h1>
                  <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Transform your financial data into actionable insights with our AI-powered multi-agent analysis platform.
                  </p>
                </div>

                {/* Features Grid - Centered */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-16">
                  <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 mx-auto">
                      <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Performance Analysis</h3>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">Advanced metrics and trend analysis for comprehensive financial performance evaluation.</p>
                  </div>
                  
                  <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 mx-auto">
                      <FileText className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Document Processing</h3>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">Intelligent parsing of financial statements, balance sheets, and cash flow reports.</p>
                  </div>
                  
                  <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 mx-auto">
                      <BarChart className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 text-center">Risk Assessment</h3>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">Multi-dimensional risk analysis with predictive modeling and scenario planning.</p>
                  </div>
                  
                  <div className="bg-background/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-6 mx-auto">
                      <Brain className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 text-center">AI Insights</h3>
                    <p className="text-base text-muted-foreground text-center leading-relaxed">Multi-agent AI system providing intelligent recommendations and strategic insights.</p>
                  </div>
                </div>

                {/* Get Started Section */}
                <div className="mt-20 space-y-8">
                  <div className="bg-background/80 backdrop-blur-sm rounded-3xl p-12 border border-border/50 shadow-lg max-w-3xl mx-auto">
                    <h3 className="text-2xl font-semibold text-foreground mb-8 text-center">Get Started</h3>
                    <div className="grid grid-cols-2 gap-6 text-lg">
                      <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/80"></div>
                        <span className="text-foreground font-medium">Income Statements</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/80"></div>
                        <span className="text-foreground font-medium">Balance Sheets</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/80"></div>
                        <span className="text-foreground font-medium">Cash Flow Reports</span>
                      </div>
                      <div className="flex items-center justify-center space-x-3 p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary to-primary/80"></div>
                        <span className="text-foreground font-medium">CSV/Excel Files</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      onClick={onNewSession} 
                      size="lg" 
                      className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 px-16 py-6 text-xl font-semibold rounded-2xl"
                    >
                      <Plus className="h-6 w-6 mr-4" />
                      Start New Analysis
                    </Button>
                    <Link href="/financial-chat">
                      <Button
                        variant="outline"
                        size="lg"
                        className="ml-4 shadow-lg hover:shadow-xl transition-all duration-300 px-10 py-6 text-xl font-semibold rounded-2xl"
                      >
                        <MessageSquare className="h-6 w-6 mr-4" />
                        AI Chat Assistant
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background via-background/98 to-muted/20">
      {/* Modern Session Header */}
      <header className="border-b border-border/20 bg-background/90 backdrop-blur-md sticky top-0 z-40 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-16 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleSidebar}
              className="hamburger-menu hover:bg-muted/50 transition-all duration-200 absolute left-0 rounded-lg p-2"
            >
              <Menu className="h-5 w-5 transition-transform duration-200 hover:scale-110" />
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-md ${
                session.source === 'email' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-primary to-primary/80'
              }`}>
                {session.source === 'email' ? (
                  <Mail className="h-4 w-4 text-white" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="flex flex-col text-center">
                <h1 className="text-lg font-semibold text-foreground tracking-tight truncate max-w-xs sm:max-w-md">
                  {session.title}
                </h1>
                <div className="flex items-center justify-center space-x-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {session.source}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 absolute right-0">
              {onToggleRightSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleRightSidebar}
                  className="hamburger-menu hover:bg-muted/50 transition-all duration-200 rounded-lg p-2"
                >
                  <PanelRightClose className={`h-5 w-5 transition-transform duration-200 ${!isRightSidebarVisible ? 'rotate-180' : ''}`} />
                </Button>
              )}
              <Button 
                onClick={onNewSession} 
                variant="outline" 
                size="sm"
                className="hidden sm:flex border-border/50 hover:bg-muted/50 transition-colors font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Session
              </Button>
              <Link href="/financial-chat">
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 hidden sm:flex items-center text-muted-foreground hover:text-foreground"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  AI Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="space-y-6 container mx-auto max-w-4xl">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-muted to-muted/80 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Ready for Analysis</h3>
              <p className="text-muted-foreground mb-6">Upload financial documents or start a conversation to begin your analysis.</p>
              <FileUpload sessionId={session.id} />
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} message={message} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Modern Chat Input */}
      <div className="border-t border-border/20 bg-background/80 backdrop-blur-md p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto max-w-4xl">
          {messages.length > 0 && (
            <div className="mb-4">
              <FileUpload sessionId={session.id} />
            </div>
          )}
          
          {/* Message Input */}
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about your financial data..."
                className="pr-12 bg-background/60 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200 rounded-xl h-12"
              />
            </div>
            <Button 
              type="submit" 
              size="sm" 
              className="gradient-primary text-white shadow-md hover:shadow-lg transition-all duration-200 px-6 rounded-xl h-12"
              disabled={!message.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}