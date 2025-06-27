import React from 'react';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
  hover?: boolean;
}

export function MagicCard({ children, className, gradient = false, hover = true }: MagicCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-background p-6 group",
        gradient && "bg-gradient-to-br from-background to-muted/50",
        hover && "cursor-pointer shadow-datarails hover-lift",
        className
      )}
    >
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedNumber({ value, duration = 1, className }: AnimatedNumberProps) {
  return (
    <span className={cn("transition-all duration-500", className)}>
      {value.toLocaleString()}
    </span>
  );
}

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function GlowingButton({ children, onClick, className, variant = 'primary' }: GlowingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative px-6 py-3 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95",
        variant === 'primary' && "gradient-primary shadow-button",
        variant === 'secondary' && "gradient-secondary",
        "before:absolute before:inset-0 before:bg-white/20 before:translate-y-full before:transition-transform before:duration-300 hover:before:translate-y-0",
        className
      )}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingElement({ children, delay = 0, className }: FloatingElementProps) {
  return (
    <div 
      className={cn("animate-fade-in-up", className)}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {children}
    </div>
  );
}