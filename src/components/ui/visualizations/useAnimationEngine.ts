"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSpring, useMotionValue } from "framer-motion";

/**
 * Manages narrative step-by-step navigation.
 * Can auto-advance with configurable intervals.
 */
export function useNarrativeStepper(stepsCount: number, autoPlayInterval = 1500) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % stepsCount);
  }, [stepsCount]);

  const stepBackward = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + stepsCount) % stepsCount);
  }, [stepsCount]);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= stepsCount - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, autoPlayInterval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, stepsCount, autoPlayInterval]);

  return {
    currentStep,
    setCurrentStep,
    isPlaying,
    stepForward,
    stepBackward,
    reset,
    play,
    pause,
  };
}

/**
 * Custom SVG dragging logic. Maps pointer positions directly to SVG coordinate system.
 */
export function useDraggable(
  initialPos: { x: number; y: number },
  onDragCallback?: (pos: { x: number; y: number }) => void,
  bounds?: { minX?: number; maxX?: number; minY?: number; maxY?: number }
) {
  const [position, setPosition] = useState(initialPos);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ isDragging: false });

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGElement>) => {
    e.preventDefault();
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    dragRef.current.isDragging = true;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGElement>) => {
    if (!dragRef.current.isDragging) return;

    // Find the owner SVG element
    const target = e.currentTarget as unknown as SVGGraphicsElement;
    const svg = target.ownerSVGElement || (target as unknown as SVGSVGElement);
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return;

    const svgCoords = point.matrixTransform(screenCTM.inverse());
    if (svgCoords) {
      let newX = svgCoords.x;
      let newY = svgCoords.y;

      if (bounds) {
        if (bounds.minX !== undefined) newX = Math.max(bounds.minX, newX);
        if (bounds.maxX !== undefined) newX = Math.min(bounds.maxX, newX);
        if (bounds.minY !== undefined) newY = Math.max(bounds.minY, newY);
        if (bounds.maxY !== undefined) newY = Math.min(bounds.maxY, newY);
      }

      const newPos = { x: newX, y: newY };
      setPosition(newPos);
      if (onDragCallback) {
        onDragCallback(newPos);
      }
    }
  }, [bounds, onDragCallback]);

  const handlePointerUp = useCallback((e: React.PointerEvent<SVGElement>) => {
    (e.target as SVGElement).releasePointerCapture(e.pointerId);
    dragRef.current.isDragging = false;
    setIsDragging(false);
  }, []);

  return {
    position,
    setPosition,
    isDragging,
    dragProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      style: { cursor: isDragging ? "grabbing" : "grab" } as React.CSSProperties,
    },
  };
}

/**
 * Manages simulation ticks via requestAnimationFrame at specified FPS.
 */
export function useSimulation(tickFn: () => void, fps = 10) {
  const [isRunning, setIsRunning] = useState(false);
  const tickFnRef = useRef(tickFn);

  useEffect(() => {
    tickFnRef.current = tickFn;
  }, [tickFn]);

  useEffect(() => {
    if (!isRunning) return;

    let lastTick = 0;
    const interval = 1000 / fps;
    let frameId: number;

    const loop = (timestamp: number) => {
      if (!lastTick) lastTick = timestamp;
      const elapsed = timestamp - lastTick;

      if (elapsed >= interval) {
        tickFnRef.current();
        lastTick = timestamp - (elapsed % interval);
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isRunning, fps]);

  const start = useCallback(() => setIsRunning(true), []);
  const stop = useCallback(() => setIsRunning(false), []);
  const step = useCallback(() => tickFnRef.current(), []);

  return {
    isRunning,
    setIsRunning,
    start,
    stop,
    step,
  };
}

/**
 * Hook wrapper around Framer Motion's useSpring to interpolate a numeric value smoothly.
 */
export function useSpringValue(targetValue: number, config = { stiffness: 100, damping: 15 }) {
  const motionValue = useMotionValue(targetValue);
  const springValue = useSpring(motionValue, config);

  useEffect(() => {
    motionValue.set(targetValue);
  }, [targetValue, motionValue]);

  return springValue;
}
