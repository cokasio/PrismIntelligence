// src/components/snap-happy/hooks/useSnapGrid.ts
import { useState, useCallback, useEffect } from 'react';
import { GridLayout } from '../types';

export const useSnapGrid = (initialLayout: GridLayout[] = []) => {
  const [layout, setLayout] = useState<GridLayout[]>(initialLayout);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const snapToGrid = useCallback((x: number, y: number, gridSize = 100) => {
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }, []);

  const moveItem = useCallback((itemId: string, newX: number, newY: number) => {
    setLayout(prev => prev.map(item => 
      item.i === itemId 
        ? { ...item, x: newX, y: newY }
        : item
    ));
  }, []);

  const resizeItem = useCallback((itemId: string, newW: number, newH: number) => {
    setLayout(prev => prev.map(item => 
      item.i === itemId 
        ? { ...item, w: newW, h: newH }
        : item
    ));
  }, []);

  const addItem = useCallback((item: GridLayout) => {
    setLayout(prev => [...prev, item]);
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setLayout(prev => prev.filter(item => item.i !== itemId));
  }, []);

  const getItemById = useCallback((itemId: string) => {
    return layout.find(item => item.i === itemId);
  }, [layout]);

  const compactLayout = useCallback((direction: 'vertical' | 'horizontal' = 'vertical') => {
    // Simple compacting algorithm
    const sorted = [...layout].sort((a, b) => {
      if (direction === 'vertical') {
        return a.y === b.y ? a.x - b.x : a.y - b.y;
      }
      return a.x === b.x ? a.y - b.y : a.x - b.x;
    });

    const compacted: GridLayout[] = [];
    sorted.forEach(item => {
      // Find the first available position
      let newPos = { x: 0, y: 0 };
      // ... compacting logic
      compacted.push({ ...item, ...newPos });
    });

    setLayout(compacted);
  }, [layout]);

  return {
    layout,
    isDragging,
    draggedItem,
    setIsDragging,
    setDraggedItem,
    snapToGrid,
    moveItem,
    resizeItem,
    addItem,
    removeItem,
    getItemById,
    compactLayout,
  };
};