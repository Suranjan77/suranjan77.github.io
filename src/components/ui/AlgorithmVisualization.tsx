"use client";

import React from "react";
import { motion } from "framer-motion";

interface Props {
  algorithmId: string;
}

export default function AlgorithmVisualization({ algorithmId }: Props) {
  // Linear Regression
  if (algorithmId === "linear-regression") {
    return (
      <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full p-8">
          <line x1="10%" y1="80%" x2="90%" y2="20%" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="4 4" className="opacity-30" />
          <motion.line 
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            x1="10%" y1="85%" x2="90%" y2="15%" stroke="var(--color-primary)" strokeWidth="4" 
          />
          {[15, 30, 45, 60, 75, 25, 40, 55, 70, 85].map((x, i) => {
            const offset = (i % 5) * 4 - 10;
            return (
              <circle key={i} cx={`${x}%`} cy={`${90 - x + offset}%`} r="4" fill="var(--color-tertiary)" />
            );
          })}
        </svg>
      </div>
    );
  }

  // Logistic Regression & SVM (Classification Boundaries)
  if (algorithmId === "logistic-regression" || algorithmId === "support-vector-machines") {
    return (
      <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full p-8">
          {/* Decision Boundary */}
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2 }}
            d="M 20 80 Q 50 50 80 20"
            fill="none"
            stroke={algorithmId === "logistic-regression" ? "var(--color-primary)" : "var(--color-secondary)"}
            strokeWidth="4"
            transform="scale(4)"
          />
          {/* Points Group 1 */}
          {[20, 30, 25, 40, 35].map((x, i) => (
            <circle key={`g1-${i}`} cx={`${x}%`} cy={`${x + 40 + (i%3)*5}%`} r="5" fill="var(--color-primary)" className="opacity-60" />
          ))}
          {/* Points Group 2 */}
          {[70, 80, 75, 60, 65].map((x, i) => (
            <circle key={`g2-${i}`} cx={`${x}%`} cy={`${x - 40 - (i%3)*5}%`} r="5" fill="var(--color-error)" className="opacity-60" />
          ))}
        </svg>
        <div className="absolute top-4 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          Decision Boundary
        </div>
      </div>
    );
  }

  // K-Means
  if (algorithmId === "k-means") {
    return (
      <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center p-8">
        <div className="grid grid-cols-2 gap-8 w-full h-full">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="relative border border-white/5 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                 className="w-4 h-4 rounded-full bg-secondary z-10 shadow-[0_0_15px_var(--color-secondary)]" 
               />
               <div className="absolute inset-0 opacity-20">
                  {Array.from({length: 6}).map((_, j) => (
                    <div key={j} className="absolute w-1.5 h-1.5 bg-secondary rounded-full" style={{ 
                      top: `${((j * i + 7) % 10) * 10}%`, 
                      left: `${((j + i * 3) % 10) * 10}%` 
                    }} />
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Decision Trees & Random Forests
  if (algorithmId === "decision-trees" || algorithmId === "random-forests") {
    return (
      <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full p-8" viewBox="0 0 200 120">
          {/* Root */}
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} cx="100" cy="20" r="8" fill="var(--color-primary)" />
          
          {/* Level 1 */}
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="100" y1="20" x2="60" y2="50" stroke="white" strokeWidth="1" opacity="0.2" />
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} x1="100" y1="20" x2="140" y2="50" stroke="white" strokeWidth="1" opacity="0.2" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} cx="60" cy="50" r="6" fill="var(--color-tertiary)" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} cx="140" cy="50" r="6" fill="var(--color-tertiary)" />

          {/* Level 2 */}
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} x1="60" y1="50" x2="40" y2="80" stroke="white" strokeWidth="1" opacity="0.1" />
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} x1="60" y1="50" x2="80" y2="80" stroke="white" strokeWidth="1" opacity="0.1" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="40" cy="80" r="4" fill="var(--color-secondary)" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="80" cy="80" r="4" fill="var(--color-secondary)" />
          
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} x1="140" y1="50" x2="120" y2="80" stroke="white" strokeWidth="1" opacity="0.1" />
          <motion.line initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.5 }} x1="140" y1="50" x2="160" y2="80" stroke="white" strokeWidth="1" opacity="0.1" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="120" cy="80" r="4" fill="var(--color-secondary)" />
          <motion.circle initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }} cx="160" cy="80" r="4" fill="var(--color-secondary)" />
        </svg>
      </div>
    );
  }

  // Neural Networks
  if (algorithmId === "neural-networks") {
    return (
      <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center p-8">
        <svg className="w-full h-full" viewBox="0 0 200 100">
           {/* Layers */}
           {[20, 60, 100, 140, 180].map((x, l) => (
             <g key={l}>
               {[1, 2, 3].map((y, i) => (
                 <React.Fragment key={i}>
                   {/* Connections to next layer */}
                   {l < 4 && [1, 2, 3].map((ny, ni) => (
                     <motion.line
                       key={`conn-${l}-${i}-${ni}`}
                       initial={{ pathLength: 0, opacity: 0 }}
                       animate={{ pathLength: 1, opacity: 0.1 }}
                       transition={{ duration: 1, delay: l * 0.2 }}
                       x1={x} y1={y * 25} x2={x + 40} y2={ny * 25}
                       stroke="var(--color-primary)"
                       strokeWidth="0.5"
                     />
                   ))}
                   <motion.circle
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ delay: l * 0.2 + i * 0.1 }}
                     cx={x} cy={y * 25} r="4"
                     fill={l === 0 ? "var(--color-primary)" : l === 4 ? "var(--color-tertiary)" : "var(--color-secondary)"}
                   />
                 </React.Fragment>
               ))}
             </g>
           ))}
        </svg>
      </div>
    );
  }

  // Fallback / Default Visualization
  return (
    <div className="relative w-full h-full bg-slate-900/50 rounded-lg overflow-hidden flex items-center justify-center p-8">
      <div className="text-slate-500 font-mono text-xs text-center w-full">
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          &lt;NEURAL_DATA_STREAM /&gt;
        </motion.div>
        <div className="mt-6 space-y-2 w-full max-w-[200px] mx-auto">
          {[70, 45, 85, 60, 95].map((width, i) => (
            <motion.div 
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${width}%` }}
              transition={{ duration: 1, delay: i * 0.1 }}
              className="h-1.5 bg-primary/20 rounded-full mx-auto" 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
