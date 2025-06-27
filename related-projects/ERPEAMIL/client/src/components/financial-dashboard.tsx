import { useState, useEffect, useRef } from "react"
import { useLocation } from "wouter"
import {
  TrendingUp,
  FileText,
  BarChart3,
  Brain,
  Plus,
  Search,
  Calendar,
  Activity,
  Users,
  Settings,
  ChevronRight,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Bot,
  MessageSquare,
  Zap,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const analysisHistory = [
  {
    id: 1,
    name: "Q4 2024 Property Analysis",
    status: "completed",
    date: "2 hours ago",
    type: "comprehensive",
  },
  {
    id: 2,
    name: "Monthly Cash Flow Review",
    status: "active",
    date: "Running now",
    type: "cash-flow",
  },
  {
    id: 3,
    name: "Balance Sheet Deep Dive",
    status: "completed",
    date: "1 day ago",
    type: "balance-sheet",
  },
  {
    id: 4,
    name: "Revenue Trend Analysis",
    status: "completed",
    date: "3 days ago",
    type: "income",
  },
  {
    id: 5,
    name: "Risk Assessment Report",
    status: "pending",
    date: "Scheduled",
    type: "risk",
  },
]

const agents = [
  {
    id: "income",
    name: "Income Analyst",
    model: "GPT-4o • OpenAI",
    status: "ready",
    task: "Analyzing revenue patterns",
    progress: 100,
    avatar: "IA",
    color: "bg-blue-500",
  },
  {
    id: "balance",
    name: "Balance Analyst",
    model: "Claude • Anthropic",
    status: "analyzing",
    task: "Evaluating asset structure",
    progress: 75,
    avatar: "BA",
    color: "bg-pink-500",
  },
  {
    id: "cashflow",
    name: "Cash Flow Analyst",
    model: "Gemini • Google",
    status: "ready",
    task: "Analyzing cash generation",
    progress: 100,
    avatar: "CA",
    color: "bg-orange-500",
  },
  {
    id: "strategic",
    name: "Strategic Advisor",
    model: "DeepSeek • DeepSeek",
    status: "waiting",
    task: "Synthesizing insights",
    progress: 0,
    avatar: "SA",
    color: "bg-blue-600",
  },
]

const features = [
  {
    title: "Performance Analysis",
    description: "Advanced metrics and trend analysis for comprehensive financial performance evaluation.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-blue-600",
    metrics: ["NOI Growth: +12.5%", "ROI: 8.3%", "Cap Rate: 6.2%"],
  },
  {
    title: "Document Processing",
    description: "Intelligent parsing of financial statements, balance sheets, and cash flow reports.",
    icon: FileText,
    gradient: "from-green-500 to-green-600",
    metrics: ["24 Months Data", "3 Statement Types", "Auto-Validated"],
  },
  {
    title: "Risk Assessment",
    description: "Multi-dimensional risk analysis with predictive modeling and scenario planning.",
    icon: BarChart3,
    gradient: "from-purple-500 to-purple-600",
    metrics: ["Risk Score: Low", "Liquidity: Strong", "Leverage: Optimal"],
  },
  {
    title: "AI Insights",
    description: "Multi-agent AI system providing strategic recommendations and actionable insights.",
    icon: Brain,
    gradient: "from-pink-500 to-pink-600",
    metrics: ["4 AI Agents", "Real-time Analysis", "Strategic Focus"],
  },
]

const keyMetrics = [
  { label: "Total Revenue", value: "$2.4M", change: "+8.2%", trend: "up" },
  { label: "Net Operating Income", value: "$1.8M", change: "+12.5%", trend: "up" },
  { label: "Cash Flow", value: "$1.2M", change: "+5.1%", trend: "up" },
  { label: "Occupancy Rate", value: "94.2%", change: "+2.1%", trend: "up" },
]

function LeftSidebar() {
  return (
    <Sidebar className="border-r border-gray-200 w-[300px]">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">FinanceAI</h2>
            <p className="text-sm text-gray-500">Multi-Agent Platform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Analysis Sessions
          </SidebarGroupLabel>
          <div className="mb-4">
            <Button className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
          <div className="mb-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search sessions..." className="pl-10 bg-gray-50 border-gray-200 focus:bg-white" />
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisHistory.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton className="w-full p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          session.status === "completed"
                            ? "bg-green-500"
                            : session.status === "active"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{session.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{session.date}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {session.status}
                        </Badge>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Property Manager</p>
          </div>
          <Settings className="w-4 h-4 text-gray-400" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

function RightSidebar() {
  return (
    <Sidebar className="border-l border-gray-200 w-[300px]">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Agent Status</h2>
            <p className="text-sm text-gray-500">Multi-Agent System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Active Agents
          </SidebarGroupLabel>
          <div className="mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-bold text-gray-900">68%</span>
              </div>
              <Progress value={68} className="h-2" />
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {agents.map((agent) => (
                <SidebarMenuItem key={agent.id}>
                  <SidebarMenuButton className="w-full p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`w-10 h-10 ${agent.color} rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}
                      >
                        {agent.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{agent.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{agent.task}</p>
                        <Badge variant="secondary" className="mt-2 text-xs">
                          {agent.status}
                        </Badge>
                        <Progress value={agent.progress} className="h-1 mt-2" />
                      </div>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-blue-300 rounded-full flex items-center justify-center">
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-gray-900">System Status</p>
            <p className="text-xs text-gray-500">All agents operational</p>
          </div>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export function FinancialDashboard() {
  const [activeAnalysis, setActiveAnalysis] = useState(false)
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true)
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false)
  const [, setLocation] = useLocation()

  return (
    <SidebarProvider defaultOpen={isLeftSidebarOpen}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Left Sidebar */}
        {isLeftSidebarOpen && <LeftSidebar />}

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                  className="p-2"
                >
                  {isLeftSidebarOpen ? (
                    <PanelLeftClose className="h-4 w-4" />
                  ) : (
                    <PanelLeftOpen className="h-4 w-4" />
                  )}
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Financial Analysis Platform</h1>
                  <p className="text-gray-600">AI-powered multi-agent insights for property management</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  Last 24 Months
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/demo')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Try Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation('/analysis')}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Analysis Platform
                </Button>
                <Button
                  className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white"
                  onClick={() => setActiveAnalysis(!activeAnalysis)}
                >
                  {activeAnalysis ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {activeAnalysis ? "Pause Analysis" : "Start Analysis"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
                  className="p-2"
                >
                  {isRightSidebarOpen ? (
                    <PanelRightClose className="h-4 w-4" />
                  ) : (
                    <PanelRightOpen className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {keyMetrics.map((metric, index) => (
                <Card key={index} className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`flex items-center gap-1 ${
                            metric.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">{metric.change}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Cards Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Capabilities</h2>
                  <p className="text-gray-600">
                    Transform your financial data into actionable insights with our AI-powered analysis platform.
                  </p>
                </div>
                <Button
                  onClick={() => setLocation('/demo')}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  See Demo
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-white border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
                    onClick={() => setLocation('/analysis')}
                  >
                    <CardContent className="p-6">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                      >
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">{feature.description}</p>
                      <div className="space-y-2">
                        {feature.metrics.map((metric, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                            <span className="text-xs text-gray-500">{metric}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-900">Start Analysis</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <Card className="mt-8 bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Recent Analysis Activity</CardTitle>
                <CardDescription className="text-gray-600">
                  Latest insights and recommendations from your AI agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Revenue Growth Acceleration Detected</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Income Analyst identified a 12.5% increase in NOI driven by improved occupancy rates and rental
                        increases.
                      </p>
                      <p className="text-xs text-gray-500">2 hours ago • Income Analyst</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Optimal Capital Structure Maintained</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Balance Analyst confirms debt-to-equity ratio remains within target range with strong liquidity
                        position.
                      </p>
                      <p className="text-xs text-gray-500">1 day ago • Balance Analyst</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">Cash Flow Optimization Opportunity</h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Cash Flow Analyst suggests refinancing opportunities to improve debt service coverage ratio.
                      </p>
                      <p className="text-xs text-gray-500">2 days ago • Cash Flow Analyst</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>

        {/* Right Sidebar */}
        {isRightSidebarOpen && <RightSidebar />}
      </div>
    </SidebarProvider>
  )
}