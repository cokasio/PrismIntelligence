// src/components/snap-happy/hooks/useSnapGestures.ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface GestureState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  deltaX: number;
  deltaY: number;
  distance: number;
  angle: number;
  velocity: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
}

export const useSnapGestures = (element?: HTMLElement | null) => {
  const [isGesturing, setIsGesturing] = useState(false);
  const [gesture, setGesture] = useState<GestureState | null>(null);
  const startTimeRef = useRef<number>(0);
  const elementRef = useRef<HTMLElement | null>(element || null);

  const calculateGesture = useCallback((startX: number, startY: number, currentX: number, currentY: number) => {
    const deltaX = currentX - startX;
    const deltaY = currentY - startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    const elapsedTime = Date.now() - startTimeRef.current;
    const velocity = distance / (elapsedTime || 1);
    
    let direction: GestureState['direction'] = null;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      direction = deltaX > 0 ? 'right' : 'left';
    } else if (deltaY !== 0) {
      direction = deltaY > 0 ? 'down' : 'up';
    }
    
    return {
      startX,
      startY,
      currentX,
      currentY,
      deltaX,
      deltaY,
      distance,
      angle,
      velocity,
      direction,
    };
  }, []);

  const handleStart = useCallback((x: number, y: number) => {
    setIsGesturing(true);
    startTimeRef.current = Date.now();
    const initialGesture = calculateGesture(x, y, x, y);
    setGesture(initialGesture);
  }, [calculateGesture]);

  const handleMove = useCallback((x: number, y: number) => {
    if (!isGesturing || !gesture) return;
    
    const updatedGesture = calculateGesture(
      gesture.startX,
      gesture.startY,
      x,
      y
    );
    setGesture(updatedGesture);
  }, [isGesturing, gesture, calculateGesture]);

  const handleEnd = useCallback(() => {
    setIsGesturing(false);
  }, []);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();
    
    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };
    const onTouchEnd = () => handleEnd();

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleStart, handleMove, handleEnd]);

  const setElement = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
  }, []);

  return {
    isGesturing,
    gesture,
    setElement,
  };
};