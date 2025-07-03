import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type DetailLevel = 'summary' | 'business' | 'technical'
export type ExpertiseLevel = 'beginner' | 'intermediate' | 'expert'

interface DetailLevelContextType {
  detailLevel: DetailLevel
  setDetailLevel: (level: DetailLevel) => void
  expertiseLevel: ExpertiseLevel
  setExpertiseLevel: (level: ExpertiseLevel) => void
  autoAdapt: boolean
  setAutoAdapt: (adapt: boolean) => void
}

const DetailLevelContext = createContext<DetailLevelContextType | undefined>(undefined)

export function DetailLevelProvider({ children }: { children: ReactNode }) {
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('prism-detail-level') as DetailLevel) || 'business'
    }
    return 'business'
  })

  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('prism-expertise-level') as ExpertiseLevel) || 'intermediate'
    }
    return 'intermediate'
  })

  const [autoAdapt, setAutoAdapt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('prism-auto-adapt') === 'true'
    }
    return true
  })

  useEffect(() => {
    localStorage.setItem('prism-detail-level', detailLevel)
  }, [detailLevel])

  useEffect(() => {
    localStorage.setItem('prism-expertise-level', expertiseLevel)
  }, [expertiseLevel])

  useEffect(() => {
    localStorage.setItem('prism-auto-adapt', String(autoAdapt))
  }, [autoAdapt])

  return (
    <DetailLevelContext.Provider value={{
      detailLevel,
      setDetailLevel,
      expertiseLevel,
      setExpertiseLevel,
      autoAdapt,
      setAutoAdapt
    }}>
      {children}
    </DetailLevelContext.Provider>
  )
}

export function useDetailLevel() {
  const context = useContext(DetailLevelContext)
  if (!context) {
    throw new Error('useDetailLevel must be used within DetailLevelProvider')
  }
  return context
}

// Helper hook to get appropriate content based on detail level
export function useAdaptiveContent<T extends Record<DetailLevel, string>>(content: T): string {
  const { detailLevel } = useDetailLevel()
  return content[detailLevel] || content.business
}
