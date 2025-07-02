'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Upload, 
  Paperclip,
  Mic,
  Plus,
  Building,
  DollarSign,
  Users,
  Wrench,
  Scale,
  Inbox,
  Sparkles,
  Brain,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield
} from 'lucide-react'

// Import Critical Thinking Logic Layer
import { ProofBadge, LogicPanel } from '@/components/logic-layer/LogicComponents'
import { LogicalAgentFactory, ValidatedInsight } from '../../logic-layer/agent-wrapper'

// Prismatic Clarity Color System
const prismColors = {
  financial: '#FFD700',     // Gold
  tenant: '#4A90E2',        // Blue  
  maintenance: '#7ED321',   // Green
  legal: '#D0021B',         // Red
  base: '#FAFAFA',          // White/neutral
  neutral: '#F5F5F5'        // Calm gray
}

// Cognitive Inbox Categories
const inboxCategories = [
  { id: 'all', label: 'All Items', icon: Inbox, count: 23 },
  { id: 'financial', label: 'Financial', icon: DollarSign, color: prismColors.financial, count: 8 },
  { id: 'tenant', label: 'Tenant', icon: Users, color: prismColors.tenant, count: 6 },
  { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: prismColors.maintenance, count: 5 },
  { id: 'legal', label: 'Legal', icon: Scale, color: prismColors.legal, count: 4 }
]

// Sample inbox items
const sampleInboxItems = [
  {
    id: 1,
    category: 'financial',
    title: 'Q4 Financial Report',
    preview: 'Variance analysis shows 15% increase in NOI...',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    priority: 'high',
    hasAttachment: true,
    agent: 'FinanceBot',
    status: 'analyzed'
  },
  {
    id: 2,
    category: 'tenant',
    title: 'Maria from 12C - Noise Complaint',
    preview: 'The thing in my kitchen is making that noise again...',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    priority: 'medium',
    hasAttachment: false,
    agent: 'TenantBot',
    status: 'processing'
  },
  {
    id: 3,
    category: 'maintenance',
    title: 'HVAC Service Report - Building A',
    preview: 'All units serviced. 3 units need filter replacement...',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    priority: 'low',
    hasAttachment: true,
    agent: 'MaintenanceBot',
    status: 'completed'
  }
]

export default function PrismaticDashboard() {
  const [message, setMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [agentActivities, setAgentActivities] = useState([])
  const [showSuccess, setShowSuccess] = useState(false)
  const [validatedInsights, setValidatedInsights] = useState<ValidatedInsight[]>([])

  // Simulate agent activities with logic validation
  useEffect(() => {
    const runAgentSimulation = async () => {
      // Create logically-wrapped agents
      const insightAgent = LogicalAgentFactory.createAgent('InsightGeneratorAgent')
      const complianceAgent = LogicalAgentFactory.createAgent('ComplianceAgent')
      const riskAgent = LogicalAgentFactory.createAgent('RiskFlaggerAgent')

      // Simulate property data from selected item
      const propertyData = {
        expenseIncrease: selectedItem?.id === '1' ? 15000 : 5000,
        revenueGrowth: selectedItem?.id === '2' ? 0 : 2,
        dscr: selectedItem?.id === '3' ? 1.1 : 1.5,
        liquidityDays: selectedItem?.id === '3' ? 45 : 90,
        latePayments: selectedItem?.id === '4' ? 3 : 1,
        complaints: selectedItem?.id === '4' ? 4 : 0
      }

      const insights: ValidatedInsight[] = []
      
      // Generate insights based on selected item
      if (selectedItem?.category === 'financial') {
        const insight = await (insightAgent as any).generateInsight(propertyData)
        insights.push(insight)
        const compliance = await (complianceAgent as any).checkCompliance(propertyData)
        insights.push(compliance)
      } else if (selectedItem?.category === 'tenant') {
        const risk = await (riskAgent as any).assessRisk(propertyData)
        insights.push(risk)
      }

      setValidatedInsights(insights)

      // Update agent activities
      const activities = [
        { agent: 'FinanceBot', action: 'Analyzing rent roll', status: 'active' },
        { agent: 'TenantBot', action: 'Processing inquiry', status: 'active' },
        { agent: 'MaintenanceBot', action: 'Scheduling inspection', status: 'completed' }
      ]
      setAgentActivities(activities[Math.floor(Math.random() * activities.length)])
    }

    runAgentSimulation()
    const interval = setInterval(runAgentSimulation, 5000)
    return () => clearInterval(interval)
  }, [selectedItem])

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* 1. Cognitive Inbox - Left Panel (20%) */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {inboxCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon 
                  className="w-4 h-4 mr-2" 
                  style={{ color: category.color }}
                />
                <span className="flex-1 text-left">{category.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3">Recent Items</h3>
            <div className="space-y-2">
              {sampleInboxItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  className="p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-start gap-2">
                    <div 
                      className="w-2 h-2 rounded-full mt-1.5"
                      style={{ 
                        backgroundColor: prismColors[item.category],
                        boxShadow: item.status === 'processing' ? `0 0 8px ${prismColors[item.category]}` : 'none'
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        {/* Add proof badge for validated items */}
                        {validatedInsights.find(i => i.agentName.includes(item.category)) && (
                          <ProofBadge 
                            validation={validatedInsights.find(i => i.agentName.includes(item.category))?.validation || { valid: false, confidence: 0, explanation: '' }} 
                            size="sm" 
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{item.preview}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.hasAttachment && <Paperclip className="w-3 h-3 text-gray-400" />}
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 2. Conversational Control - Center Panel (50%) */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Prism Intelligence</h1>
                <p className="text-xs text-gray-500">Living Knowledge Base Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                All Systems Online
              </Badge>
            </div>
          </div>
        </div>

        {/* Chat/Analysis Area */}
        <ScrollArea className="flex-1 p-6">
          {selectedItem ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="p-6 border-0 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">{selectedItem.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">Analyzed by {selectedItem.agent}</p>
                    </div>
                    {/* Show logic validation status */}
                    {validatedInsights.length > 0 && (
                      <ProofBadge 
                        validation={validatedInsights[0]?.validation || { valid: false, confidence: 0, explanation: '' }} 
                        size="md" 
                      />
                    )}
                  </div>
                  <Badge 
                    style={{ backgroundColor: prismColors[selectedItem.category] + '20', color: prismColors[selectedItem.category] }}
                  >
                    {selectedItem.category}
                  </Badge>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-600">{selectedItem.preview}</p>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      AI Analysis with Logic Validation
                    </h3>
                    <ul className="space-y-2 text-sm text-blue-800">
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>Identified 3 action items requiring immediate attention (Logically Proven)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>Potential cost savings of $2,300 if addressed this week (Confidence: 92%)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Shield className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>Recommended vendor: ABC Maintenance (98% satisfaction)</span>
                      </li>
                    </ul>
                    
                    {/* Show logical proof if available */}
                    {validatedInsights[0]?.validation.valid && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-700 font-mono">
                          Proof: {validatedInsights[0].validation.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      onClick={() => setShowSuccess(true)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Tasks
                    </Button>
                    <Button variant="outline">
                      View Full Report
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select an item from your inbox to view analysis</p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Voice-First Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center gap-2">
              <div className="flex-1 relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything or say 'Hey Prism'..."
                  className="pr-24 bg-gray-50 border-gray-200"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setIsListening(!isListening)}
                  >
                    <Mic className={`w-4 h-4 ${isListening ? 'text-red-500' : 'text-gray-400'}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Paperclip className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Voice command hints */}
            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
              <span>Try:</span>
              <button className="hover:text-blue-600">"Show delinquent rent"</button>
              <button className="hover:text-blue-600">"What's new today?"</button>
              <button className="hover:text-blue-600">"Schedule maintenance"</button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Agent Activity & Tasks - Right Panel (30%) */}
      <div className="w-96 bg-gray-50 border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Agent Activity</h2>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Critical Thinking Logic Layer */}
            {validatedInsights.length > 0 && (
              <LogicPanel insights={validatedInsights} />
            )}
            
            {/* Active Agents with Logic Validation */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Active Agents
              </h3>
              <div className="space-y-3">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium flex items-center gap-2">
                      FinanceBot
                      {validatedInsights.find(i => i.agentName === 'InsightGeneratorAgent') && (
                        <ProofBadge 
                          validation={validatedInsights.find(i => i.agentName === 'InsightGeneratorAgent')?.validation || { valid: false, confidence: 0, explanation: '' }} 
                          size="sm" 
                        />
                      )}
                    </p>
                    <p className="text-xs text-gray-500">Analyzing Q4 variance report...</p>
                  </div>
                  <Badge variant="outline" className="text-xs">92%</Badge>
                </motion.div>
              </div>
            </Card>

            {/* Recent Tasks */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Recent Tasks
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Review maintenance budget variance</p>
                    <p className="text-xs text-gray-500">Completed 5m ago • Saved $2,300</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4 border-0 shadow-sm">
              <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Doc
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  View Alerts
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Building className="w-4 h-4 mr-2" />
                  Properties
                </Button>
              </div>
            </Card>
          </div>
        </ScrollArea>
      </div>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-8 shadow-2xl"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-center mb-2">Tasks Created!</h3>
              <p className="text-gray-600 text-center">3 tasks added to your workflow</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
