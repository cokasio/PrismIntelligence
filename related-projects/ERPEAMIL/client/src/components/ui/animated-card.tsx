import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true, 
  active = false,
  onClick 
}: AnimatedCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-background rounded-xl border border-border p-4 transition-all duration-300 animate-fade-in-up",
        hover && "cursor-pointer hover:shadow-datarails-sm hover:-translate-y-1",
        active && "border-primary bg-primary/5 shadow-datarails-sm",
        onClick && "active:scale-98",
        className
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {children}
    </div>
  );
}

// Removed SessionCard component as it's not being used