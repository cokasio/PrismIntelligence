import { useState, useEffect, useCallback } from 'react'

interface ExpertiseMetrics {
  totalInteractions: number
  correctActions: number
  timeToComplete: number[]
  helpRequests: number
  advancedFeaturesUsed: string[]
  errorRate: number
  domainKnowledge: Record<string, number>
}

interface UserExpertiseProfile {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  score: number // 0-100
  metrics: ExpertiseMetrics
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export function useUserExpertiseLearning() {
  const [profile, setProfile] = useState<UserExpertiseProfile>({
    level: 'beginner',
    score: 0,
    metrics: {
      totalInteractions: 0,
      correctActions: 0,
      timeToComplete: [],
      helpRequests: 0,
      advancedFeaturesUsed: [],
      errorRate: 0,
      domainKnowledge: {
        financial: 0,
        tenant: 0,
        maintenance: 0,
        legal: 0
      }
    },
    strengths: [],
    weaknesses: [],
    recommendations: []
  })

  // Load profile from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('prism-user-expertise')
    if (stored) {
      setProfile(JSON.parse(stored))
    }
  }, [])

  // Save profile to localStorage
  useEffect(() => {
    localStorage.setItem('prism-user-expertise', JSON.stringify(profile))
  }, [profile])

  // Track successful action
  const trackSuccess = useCallback((domain?: string, timeSpent?: number) => {
    setProfile(prev => {
      const newMetrics = {
        ...prev.metrics,
        totalInteractions: prev.metrics.totalInteractions + 1,
        correctActions: prev.metrics.correctActions + 1,
        timeToComplete: timeSpent 
          ? [...prev.metrics.timeToComplete, timeSpent].slice(-20)
          : prev.metrics.timeToComplete
      }

      if (domain && prev.metrics.domainKnowledge[domain] !== undefined) {
        newMetrics.domainKnowledge[domain] = Math.min(
          prev.metrics.domainKnowledge[domain] + 5, 
          100
        )
      }

      return {
        ...prev,
        metrics: newMetrics
      }
    })
  }, [])

  // Track error
  const trackError = useCallback((domain?: string) => {
    setProfile(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        totalInteractions: prev.metrics.totalInteractions + 1,
        errorRate: (prev.metrics.totalInteractions - prev.metrics.correctActions + 1) / 
                   (prev.metrics.totalInteractions + 1)
      }
    }))
  }, [])

  // Track help request
  const trackHelpRequest = useCallback(() => {
    setProfile(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        helpRequests: prev.metrics.helpRequests + 1
      }
    }))
  }, [])

  // Track advanced feature usage
  const trackFeatureUsage = useCallback((featureName: string) => {
    setProfile(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        advancedFeaturesUsed: prev.metrics.advancedFeaturesUsed.includes(featureName)
          ? prev.metrics.advancedFeaturesUsed
          : [...prev.metrics.advancedFeaturesUsed, featureName]
      }
    }))
  }, [])

  // Calculate expertise level
  const calculateExpertise = useCallback(() => {
    const { metrics } = profile
    
    // Calculate score based on various factors
    let score = 0
    
    // Success rate (max 40 points)
    const successRate = metrics.totalInteractions > 0 
      ? (metrics.correctActions / metrics.totalInteractions) * 40
      : 0
    score += successRate

    // Speed (max 20 points)
    if (metrics.timeToComplete.length > 0) {
      const avgTime = metrics.timeToComplete.reduce((a, b) => a + b, 0) / metrics.timeToComplete.length
      const speedScore = Math.max(0, 20 - (avgTime / 1000)) // Faster is better
      score += speedScore
    }

    // Advanced features (max 20 points)
    const featureScore = Math.min(metrics.advancedFeaturesUsed.length * 2, 20)
    score += featureScore

    // Domain knowledge (max 20 points)
    const domainScores = Object.values(metrics.domainKnowledge)
    const avgDomainScore = domainScores.reduce((a, b) => a + b, 0) / domainScores.length
    score += (avgDomainScore / 100) * 20

    // Determine level
    const level = 
      score >= 80 ? 'expert' :
      score >= 60 ? 'advanced' :
      score >= 30 ? 'intermediate' : 'beginner'

    // Identify strengths and weaknesses
    const strengths: string[] = []
    const weaknesses: string[] = []

    if (successRate > 35) strengths.push('High accuracy')
    else weaknesses.push('Improve accuracy')

    if (metrics.helpRequests < metrics.totalInteractions * 0.1) {
      strengths.push('Independent problem solving')
    }

    Object.entries(metrics.domainKnowledge).forEach(([domain, knowledge]) => {
      if (knowledge > 70) strengths.push(`Strong ${domain} knowledge`)
      else if (knowledge < 30) weaknesses.push(`Learn more about ${domain}`)
    })

    // Generate recommendations
    const recommendations: string[] = []
    
    if (level === 'beginner') {
      recommendations.push('Try using keyboard shortcuts')
      recommendations.push('Explore the help documentation')
    } else if (level === 'intermediate') {
      recommendations.push('Try advanced features like What-If scenarios')
      recommendations.push('Use voice commands for faster navigation')
    }

    setProfile(prev => ({
      ...prev,
      level,
      score: Math.round(score),
      strengths,
      weaknesses,
      recommendations
    }))
  }, [profile])

  // Auto-calculate on metrics change
  useEffect(() => {
    calculateExpertise()
  }, [profile.metrics]) // eslint-disable-line

  return {
    profile,
    trackSuccess,
    trackError,
    trackHelpRequest,
    trackFeatureUsage,
    resetProfile: () => {
      localStorage.removeItem('prism-user-expertise')
      window.location.reload()
    }
  }
}