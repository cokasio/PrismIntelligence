// src/components/snap-happy/SnapScroll.tsx
'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SnapScrollProps } from './types';

export const SnapScroll: React.FC<SnapScrollProps> = ({
  children,
  direction = 'vertical',
  type = 'mandatory',
  padding = 0,
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  
  const scrollStyles: React.CSSProperties = {
    scrollSnapType: `${direction === 'both' ? 'both' : direction === 'horizontal' ? 'x' : 'y'} ${type}`,
    overflowX: direction === 'horizontal' || direction === 'both' ? 'scroll' : 'hidden',
    overflowY: direction === 'vertical' || direction === 'both' ? 'scroll' : 'hidden',
    scrollPadding: `${padding}px`,
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    height: direction === 'vertical' || direction === 'both' ? '100vh' : 'auto',
    width: '100%',
    position: 'relative' as const,
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const container = scrollRef.current;
      const sections = container.querySelectorAll('.snap-section');
      const scrollPos = direction === 'horizontal' ? container.scrollLeft : container.scrollTop;
      const containerSize = direction === 'horizontal' ? container.clientWidth : container.clientHeight;
      
      // Find active section
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const offset = direction === 'horizontal' 
          ? rect.left - containerRect.left 
          : rect.top - containerRect.top;
          
        if (Math.abs(offset) < containerSize / 2) {
          setActiveSection(index);
        }
      });
    };

    const container = scrollRef.current;
    container?.addEventListener('scroll', handleScroll);
    
    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [direction]);

  const scrollToSection = (index: number) => {
    if (!scrollRef.current) return;
    
    const sections = scrollRef.current.querySelectorAll('.snap-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
    }
  };
  return (
    <div className={`snap-scroll-container ${className}`}>
      <div 
        ref={scrollRef}
        className="snap-scroll"
        style={scrollStyles}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === SnapSection) {
            return React.cloneElement(child as React.ReactElement<any>, {
              index,
              isActive: activeSection === index,
              scrollToSection: () => scrollToSection(index),
            });
          }
          return child;
        })}
      </div>
      
      {/* Navigation dots */}
      <div className={`snap-nav ${direction === 'horizontal' ? 'horizontal' : 'vertical'}`}>
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === SnapSection) {
            return (
              <button
                key={index}
                className={`snap-dot ${activeSection === index ? 'active' : ''}`}
                onClick={() => scrollToSection(index)}
                aria-label={`Go to section ${index + 1}`}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

interface SnapSectionProps {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
  index?: number;
  isActive?: boolean;
  scrollToSection?: () => void;
}

export const SnapSection: React.FC<SnapSectionProps> = ({
  children,
  className = '',
  align = 'start',
  isActive = false,
}) => {
  const sectionStyles: React.CSSProperties = {
    scrollSnapAlign: align,
    scrollSnapStop: 'always',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
  };

  return (
    <section 
      className={`snap-section ${className} ${isActive ? 'active' : ''}`}
      style={sectionStyles}
    >
      {children}
    </section>
  );
};