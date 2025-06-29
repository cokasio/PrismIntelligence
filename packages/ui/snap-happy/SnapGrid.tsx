// src/components/snap-happy/SnapGrid.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { SnapGridProps, GridLayout } from './types';

export const SnapGrid: React.FC<SnapGridProps> = ({
  children,
  columns = 12,
  rowHeight = 100,
  gap = 16,
  className = '',
  onLayoutChange,
  isDraggable = true,
  isResizable = true,
  compactType = 'vertical',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    position: 'relative' as const,
    minHeight: '400px',
  };

  return (
    <div 
      className={`snap-grid ${className}`}
      style={gridStyle}
      data-dragging={isDragging}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === SnapGridItem) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
            isDraggable,
            isResizable,
            onDragStart: () => setIsDragging(true),
            onDragEnd: () => setIsDragging(false),
          });
        }
        return child;
      })}
    </div>
  );
};
interface SnapGridItemProps {
  children: React.ReactNode;
  id: string;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
  className?: string;
  static?: boolean;
  index?: number;
  isDraggable?: boolean;
  isResizable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const SnapGridItem: React.FC<SnapGridItemProps> = ({
  children,
  id,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { w: 4, h: 2 },
  minSize = { w: 1, h: 1 },
  maxSize = { w: 12, h: 12 },
  className = '',
  static: isStatic = false,
  isDraggable = true,
  isResizable = true,
  onDragStart,
  onDragEnd,
}) => {
  const [position, setPosition] = useState(defaultPosition);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isStatic || !isDraggable) return;
    
    e.preventDefault();
    setIsDragging(true);
    onDragStart?.();
    
    const startX = e.clientX - position.x * 100;
    const startY = e.clientY - position.y * 100;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.round((e.clientX - startX) / 100);
      const newY = Math.round((e.clientY - startY) / 100);
      
      setPosition({
        x: Math.max(0, Math.min(12 - size.w, newX)),
        y: Math.max(0, newY),
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      onDragEnd?.();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, size, isDraggable, isStatic, onDragStart, onDragEnd]);

  const gridItemStyle = {
    gridColumn: `${position.x + 1} / span ${size.w}`,
    gridRow: `${position.y + 1} / span ${size.h}`,
    transition: isDragging ? 'none' : 'all 0.2s ease',
    cursor: isDraggable && !isStatic ? 'move' : 'default',
    userSelect: 'none' as const,
  };

  return (
    <div
      className={`snap-grid-item ${className} ${isDragging ? 'dragging' : ''}`}
      style={gridItemStyle}
      onMouseDown={handleMouseDown}
      data-grid-id={id}
    >
      {children}
      {isResizable && !isStatic && (
        <div className="resize-handle" />
      )}
    </div>
  );
};