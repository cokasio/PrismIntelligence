import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Plus,
  Search,
  Calendar,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  TrendingUp,
  BarChart3,
  DollarSign,
  Filter,
  MoreVertical,
  Trash2,
  Archive,
  Download,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ChatSession {
  id: number
  title: string
  source: string
  status: string
  createdAt: string
  updatedAt: string
  metadata?: any
  projectId?: number
}

interface SessionManagerProps {
  onSessionSelect: (session: ChatSession) => void
  selectedSessionId?: number
}

const analysisTypes = [
  { value: "comprehensive", label: "Comprehensive Analysis", icon: BarChart3, description: "Full financial analysis across all dimensions" },
  { value: "income", label: "Income Focus", icon: TrendingUp, description: "Revenue and profitability analysis" },
  { value: "balance-sheet", label: "Balance Sheet Focus", icon: FileText, description: "Asset and liability analysis" },
  { value: "cash-flow", label: "Cash Flow Focus", icon: DollarSign, description: "Cash generation and liquidity analysis" },
  { value: "risk", label: "Risk Assessment", icon: AlertCircle, description: "Risk evaluation and scenario analysis" },
]

export function SessionManager({ onSessionSelect, selectedSessionId }: SessionManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newSessionTitle, setNewSessionTitle] = useState("")
  const [newSessionDescription, setNewSessionDescription] = useState("")
  const [newSessionType, setNewSessionType] = useState("comprehensive")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  useEffect(() => {
    filterSessions()
  }, [sessions, searchQuery, statusFilter])

  const loadSessions = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setSessions(data)
      }
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterSessions = () => {
    let filtered = sessions

    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(session => session.status === statusFilter)
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    setFilteredSessions(filtered)
  }

  const createSession = async () => {
    try {
      const sessionData = {
        title: newSessionTitle || `${analysisTypes.find(t => t.value === newSessionType)?.label} - ${new Date().toLocaleDateString()}`,
        source: 'upload',
        status: 'active',
        metadata: {
          analysisType: newSessionType,
          description: newSessionDescription,
          createdBy: 'user'
        }
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      })

      if (response.ok) {
        const newSession = await response.json()
        setSessions(prev => [newSession, ...prev])
        setIsCreateDialogOpen(false)
        setNewSessionTitle("")
        setNewSessionDescription("")
        setNewSessionType("comprehensive")
        onSessionSelect(newSession)
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
  }

  const deleteSession = async (sessionId: number) => {
    if (confirm('Are you sure you want to delete this session?')) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          setSessions(prev => prev.filter(s => s.id !== sessionId))
        }
      } catch (error) {
        console.error('Error deleting session:', error)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing': return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'active': return <Play className="w-4 h-4 text-blue-500" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'error': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAnalysisTypeIcon = (type: string) => {
    const analysisType = analysisTypes.find(t => t.value === type)
    if (analysisType) {
      const Icon = analysisType.icon
      return <Icon className="w-4 h-4" />
    }
    return <BarChart3 className="w-4 h-4" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analysis Sessions</h2>
            <p className="text-sm text-gray-600">Manage your financial analysis sessions</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">
                <Plus className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Analysis Session</DialogTitle>
                <DialogDescription>
                  Start a new financial analysis session with our multi-agent system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={newSessionTitle}
                    onChange={(e) => setNewSessionTitle(e.target.value)}
                    placeholder="Enter a descriptive title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Analysis Type</Label>
                  <Select value={newSessionType} onValueChange={setNewSessionType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {analysisTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="w-4 h-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-gray-500">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newSessionDescription}
                    onChange={(e) => setNewSessionDescription(e.target.value)}
                    placeholder="Describe the focus of this analysis..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createSession}>
                  Create Session
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria"
                : "Create your first analysis session to get started"
              }
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Session
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session) => (
              <Card 
                key={session.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedSessionId === session.id ? 'ring-2 ring-pink-500 shadow-md' : ''
                }`}
                onClick={() => onSessionSelect(session)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{session.title}</h3>
                        <Badge variant="outline" className={getStatusColor(session.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(session.status)}
                            <span className="capitalize">{session.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(session.createdAt).toLocaleDateString()}</span>
                        </div>
                        {session.metadata?.analysisType && (
                          <div className="flex items-center gap-1">
                            {getAnalysisTypeIcon(session.metadata.analysisType)}
                            <span className="capitalize">{session.metadata.analysisType.replace('-', ' ')}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <span className="capitalize">{session.source}</span>
                        </div>
                      </div>
                      
                      {session.metadata?.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{session.metadata.description}</p>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation()
                          onSessionSelect(session)
                        }}>
                          <Play className="w-4 h-4 mr-2" />
                          Open Session
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Export Results
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteSession(session.id)
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}