// src/components/snap-happy/SnapAnimation.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { SnapAnimationProps, AnimationPreset } from './types';

const animationPresets: Record<string, AnimationPreset> = {
  fadeIn: {
    name: 'fadeIn',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideUp: {
    name: 'slideUp',
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideDown: {
    name: 'slideDown',
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideLeft: {
    name: 'slideLeft',
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  slideRight: {
    name: 'slideRight',
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  scale: {
    name: 'scale',
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  rotate: {
    name: 'rotate',
    initial: { rotate: -180, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 180, opacity: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },
  bounce: {
    name: 'bounce',
    initial: { y: -100, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: {
        y: {
          type: 'spring',
          damping: 10,
          stiffness: 100,
        },
        opacity: {
          duration: 0.2,
        },
      },
    },
    exit: { y: 100, opacity: 0 },
  },
  snap: {
    name: 'snap',
    initial: { scale: 0, rotate: -180 },
    animate: { 
      scale: 1, 
      rotate: 0,
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      },
    },
    exit: { scale: 0, rotate: 180 },
  },
};
export const SnapAnimation: React.FC<SnapAnimationProps> = ({
  children,
  preset = 'fadeIn',
  custom,
  delay = 0,
  duration,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const animation = custom || animationPresets[preset];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [delay]);

  const animationStyles = {
    ...animation.initial,
    transition: `all ${duration || animation.transition?.duration || 0.3}s ${animation.transition?.ease || 'ease-out'}`,
    ...(isVisible ? animation.animate : {}),
  };

  return (
    <div 
      className={`snap-animation ${className}`}
      style={animationStyles}
    >
      {children}
    </div>
  );
};

// Custom hook for programmatic animations
export const useSnapAnimation = () => {
  const [animationState, setAnimationState] = useState<'initial' | 'animate' | 'exit'>('initial');
  
  const animate = useCallback((preset: keyof typeof animationPresets | AnimationPreset) => {
    const animation = typeof preset === 'string' ? animationPresets[preset] : preset;
    
    setAnimationState('animate');
    
    return {
      styles: animation.animate,
      duration: animation.transition?.duration || 0.3,
    };
  }, []);
  
  const reset = useCallback(() => {
    setAnimationState('initial');
  }, []);
  
  const exit = useCallback(() => {
    setAnimationState('exit');
  }, []);
  
  return {
    animationState,
    animate,
    reset,
    exit,
  };
};