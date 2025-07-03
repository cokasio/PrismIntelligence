import React, { useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Save } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ScenarioParameter {
  id: string
  name: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  impact?: 'positive' | 'negative' | 'neutral'
}

interface ScenarioResult {
  metric: string
  baseline: number
  projected: number
  change: number
  changePercent: number
}

interface WhatIfScenarioProps {
  title: string
  parameters: ScenarioParameter[]
  onCalculate: (params: Record<string, number>) => ScenarioResult[]
  className?: string
}

export function WhatIfScenario({ 
  title, 
  parameters: initialParams, 
  onCalculate,
  className 
}: WhatIfScenarioProps) {
  const [parameters, setParameters] = useState(initialParams)
  const [results, setResults] = useState<ScenarioResult[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<Array<{
    name: string
    params: ScenarioParameter[]
    results: ScenarioResult[]
  }>>([])

  const handleParameterChange = useCallback((id: string, value: number) => {
    setParameters(prev => prev.map(p => 
      p.id === id ? { ...p, value } : p
    ))
  }, [])

  const calculateScenario = useCallback(async () => {
    setIsCalculating(true)
    
    const params = parameters.reduce((acc, p) => ({
      ...acc,
      [p.id]: p.value
    }), {})

    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const newResults = onCalculate(params)
    setResults(newResults)
    setIsCalculating(false)
  }, [parameters, onCalculate])

  const resetScenario = useCallback(() => {
    setParameters(initialParams)
    setResults([])
  }, [initialParams])

  const saveScenario = useCallback(() => {
    const name = `Scenario ${savedScenarios.length + 1}`
    setSavedScenarios(prev => [...prev, {
      name,
      params: [...parameters],
      results: [...results]
    }])
  }, [parameters, results, savedScenarios.length])

  const getImpactIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-400" />
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetScenario}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            {results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveScenario}
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
            )}
          </div>
        </div>

        {/* Parameters */}
        <div className="space-y-4">
          {parameters.map(param => (
            <div key={param.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{param.name}</Label>
                <span className="text-sm font-medium">
                  {param.value}{param.unit}
                </span>
              </div>
              <Slider
                value={[param.value]}
                onValueChange={([value]) => handleParameterChange(param.id, value)}
                min={param.min}
                max={param.max}
                step={param.step}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{param.min}{param.unit}</span>
                <span>{param.max}{param.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Calculate Button */}
        <Button 
          onClick={calculateScenario}
          className="w-full"
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate Impact'}
        </Button>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              <h4 className="font-medium text-sm">Projected Impact</h4>
              {results.map((result, index) => (
                <motion.div
                  key={result.metric}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">{result.metric}</div>
                    <div className="text-xs text-gray-500">
                      {result.baseline} → {result.projected}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getImpactIcon(result.change)}
                    <div className="text-right">
                      <div className="font-medium text-sm">
                        {result.change > 0 ? '+' : ''}{result.change}
                      </div>
                      <div className="text-xs text-gray-500">
                        {result.changePercent > 0 ? '+' : ''}{result.changePercent}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Saved Scenarios */}
        {savedScenarios.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Saved Scenarios</h4>
            {savedScenarios.map((scenario, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  setParameters(scenario.params)
                  setResults(scenario.results)
                }}
              >
                {scenario.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}