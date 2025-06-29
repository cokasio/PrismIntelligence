// src/components/snap-happy/hooks/useSnapScroll.ts
import { useState, useCallback, useEffect, useRef } from 'react';

export const useSnapScroll = () => {
  const [activeSection, setActiveSection] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLElement | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const scrollToSection = useCallback((index: number) => {
    if (!scrollContainerRef.current) return;
    
    const sections = scrollContainerRef.current.querySelectorAll('.snap-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start', 
        inline: 'start' 
      });
      setActiveSection(index);
    }
  }, []);

  const scrollToNext = useCallback(() => {
    const nextIndex = activeSection + 1;
    scrollToSection(nextIndex);
  }, [activeSection, scrollToSection]);

  const scrollToPrev = useCallback(() => {
    const prevIndex = Math.max(0, activeSection - 1);
    scrollToSection(prevIndex);
  }, [activeSection, scrollToSection]);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  const setScrollContainer = useCallback((element: HTMLElement | null) => {
    scrollContainerRef.current = element;
  }, []);

  return {
    activeSection,
    isScrolling,
    scrollToSection,
    scrollToNext,
    scrollToPrev,
    setScrollContainer,
  };
};