"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function AlgorithmSimulator() {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
  const [slope, setSlope] = useState(0.5);
  const [intercept, setIntercept] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate some random points initially
  useEffect(() => {
    const initialPoints = Array.from({ length: 20 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setPoints(initialPoints);
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = 100 - ((e.clientY - rect.top) / rect.height) * 100;
    setPoints([...points, { x, y }]);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      <div 
        ref={containerRef}
        onClick={handleContainerClick}
        className="relative flex-1 bg-slate-950 rounded-xl border border-white/10 overflow-hidden cursor-crosshair"
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>

        {/* Regression Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line 
            x1="0%" 
            y1={`${100 - intercept}%`} 
            x2="100%" 
            y2={`${100 - (slope * 100 + intercept)}%`} 
            stroke="var(--color-primary)" 
            strokeWidth="3"
            className="drop-shadow-[0_0_8px_rgba(173,198,255,0.5)]"
          />
        </svg>

        {/* Points */}
        {points.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-2 h-2 bg-tertiary rounded-full -translate-x-1/2 translate-y-1/2"
            style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
          />
        ))}

        <div className="absolute bottom-4 left-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900/80 px-2 py-1 rounded">
          Interactive WebGL Simulator (Simulated)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-tighter flex justify-between">
            Slope (w) <span>{slope.toFixed(2)}</span>
          </label>
          <input 
            type="range" 
            min="-2" 
            max="2" 
            step="0.01" 
            value={slope}
            onChange={(e) => setSlope(parseFloat(e.target.value))}
            className="w-full accent-primary bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-tighter flex justify-between">
            Intercept (b) <span>{intercept.toFixed(0)}</span>
          </label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="1" 
            value={intercept}
            onChange={(e) => setIntercept(parseFloat(e.target.value))}
            className="w-full accent-tertiary bg-slate-800 rounded-lg appearance-none h-1.5 cursor-pointer"
          />
        </div>
      </div>
      
      <button 
        onClick={() => setPoints([])}
        className="text-[10px] font-bold text-slate-500 hover:text-error transition-colors uppercase tracking-widest self-end"
      >
        Reset Dataset
      </button>
    </div>
  );
}
