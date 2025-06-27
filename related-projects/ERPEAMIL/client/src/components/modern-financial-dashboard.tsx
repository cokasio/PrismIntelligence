import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Brain, 
  Plus,
  Search,
  Calendar,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Menu,
  X,
  Home,
  FolderOpen,
  MessageSquare,
  Settings,
  LogOut,
  Bot,
  Activity
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { MagicCard } from '@/components/ui/magic-card'

// Sample data
const metrics = [
  { 
    label: 'Total Revenue', 
    value: '$2.4M', 
    change: 8.2, 
    icon: TrendingUp,
    color: 'from-blue-500 to-cyan-500'
  },
  { 
    label: 'Net Operating Income', 
    value: '$1.8M', 
    change: 12.5, 
    icon: Zap,
    color: 'from-purple-500 to-pink-500'
  },
  { 
    label: 'Cash Flow', 
    value: '$1.2M', 
    change: -2.1, 
    icon: Activity,
    color: 'from-green-500 to-emerald-500'
  },
  { 
    label: 'Occupancy Rate', 
    value: '94.2%', 
    change: 2.1, 
    icon: Users,
    color: 'from-orange-500 to-red-500'
  },
]

const agents = [
  {
    id: 1,
    name: 'Income Analyst',
    status: 'active',
    progress: 75,
    model: 'GPT-4',
    avatar: 'IA',
    color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    description: 'Analyzing revenue patterns and profitability trends'
  },
  {
    id: 2,
    name: 'Balance Analyst',
    status: 'active',
    progress: 60,
    model: 'Claude 3',
    avatar: 'BA',
    color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    description: 'Evaluating asset structure and capital allocation'
  },
  {
    id: 3,
    name: 'Cash Flow Analyst',
    status: 'idle',
    progress: 100,
    model: 'Gemini Pro',
    avatar: 'CA',
    color: 'bg-gradient-to-br from-green-500 to-green-600',
    description: 'Analyzing cash generation and investment patterns'
  },
  {
    id: 4,
    name: 'Strategic Advisor',
    status: 'waiting',
    progress: 0,
    model: 'DeepSeek',
    avatar: 'SA',
    color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    description: 'Synthesizing insights and recommendations'
  }
]

const sessions = [
  { id: 1, name: 'Q4 2024 Analysis', status: 'completed', date: '2 hours ago' },
  { id: 2, name: 'Cash Flow Review', status: 'active', date: 'Running now' },
  { id: 3, name: 'Balance Sheet Audit', status: 'completed', date: 'Yesterday' },
  { id: 4, name: 'Revenue Forecast', status: 'pending', date: 'Scheduled' },
]

const navItems = [
  { icon: Home, label: 'Dashboard', active: true },
  { icon: FolderOpen, label: 'Sessions' },
  { icon: MessageSquare, label: 'Chat' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
]

export default function ModernFinancialDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-[240px] p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">FinanceAI</span>
            </SheetTitle>
          </SheetHeader>
          <nav className="px-3">
            {navItems.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start mb-1"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-20 lg:overflow-y-auto lg:bg-white lg:border-r lg:border-gray-200 dark:lg:bg-gray-900 dark:lg:border-gray-800">
        <div className="flex h-full flex-col">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <nav className="flex-1 flex flex-col items-center gap-4 px-2 py-4">
            {navItems.map((item, i) => (
              <Button
                key={i}
                variant={item.active ? "secondary" : "ghost"}
                size="icon"
                className="h-12 w-12 rounded-xl"
              >
                <item.icon className="h-5 w-5" />
              </Button>
            ))}
          </nav>
          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-20">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 px-6 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 flex items-center gap-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:from-gray-100 dark:to-gray-400">
              Financial Analysis Platform
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Calendar className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700">
              <Plus className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <MagicCard className="relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.label}
                    </CardTitle>
                    <div className={cn(
                      "h-8 w-8 rounded-lg bg-gradient-to-br flex items-center justify-center",
                      metric.color
                    )}>
                      <metric.icon className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center mt-1">
                      {metric.change > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={cn(
                        "text-xs font-medium",
                        metric.change > 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {Math.abs(metric.change)}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-full animate-shimmer" />
                </MagicCard>
              </motion.div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="grid gap-6 lg:grid-cols-7">
            {/* Left Content */}
            <div className="lg:col-span-5 space-y-6">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 dark:bg-gray-800/50">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  {/* Feature Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <Sparkles className="h-5 w-5 text-yellow-500" />
                          </div>
                          <CardTitle>Document Processing</CardTitle>
                          <CardDescription>
                            AI-powered parsing of financial statements with 99.9% accuracy
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">24 documents</Badge>
                            <Badge variant="outline">3 types</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-800">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                              <Brain className="h-6 w-6 text-white" />
                            </div>
                            <Zap className="h-5 w-5 text-yellow-500" />
                          </div>
                          <CardTitle>AI Insights</CardTitle>
                          <CardDescription>
                            Multi-agent system providing strategic recommendations
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">4 agents</Badge>
                            <Badge variant="outline">Real-time</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Recent Activity */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest updates from your analysis sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">Revenue analysis completed</p>
                                <p className="text-xs text-muted-foreground">
                                  Identified 12.5% growth opportunity in Q1 2025
                                </p>
                                <p className="text-xs text-muted-foreground">{i} hours ago</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analysis" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Sessions</CardTitle>
                      <CardDescription>Manage and review your financial analysis sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {sessions.map((session) => (
                            <div
                              key={session.id}
                              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "h-2 w-2 rounded-full",
                                  session.status === 'completed' && "bg-green-500",
                                  session.status === 'active' && "bg-blue-500 animate-pulse",
                                  session.status === 'pending' && "bg-gray-300"
                                )} />
                                <div>
                                  <p className="font-medium">{session.name}</p>
                                  <p className="text-sm text-muted-foreground">{session.date}</p>
                                </div>
                              </div>
                              <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                                {session.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Key Insights</CardTitle>
                      <CardDescription>AI-generated insights from your financial data</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100">Revenue Growth Opportunity</p>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                              Analysis indicates potential for 15-20% revenue increase through optimized pricing strategy
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-900 dark:text-green-100">Strong Financial Position</p>
                            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                              Debt-to-equity ratio at 0.3, well below industry average of 0.8
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Sidebar - Agent Status */}
            <div className="lg:col-span-2">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    AI Agents
                  </CardTitle>
                  <CardDescription>Real-time agent status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm",
                            agent.color
                          )}>
                            {agent.avatar}
                          </div>
                          <div>
                            <p className="font-medium">{agent.name}</p>
                            <p className="text-xs text-muted-foreground">{agent.model}</p>
                          </div>
                        </div>
                        <Badge 
                          variant={agent.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                      <Progress value={agent.progress} className="h-1.5" />
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-medium">58%</span>
                    </div>
                    <Progress value={58} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}