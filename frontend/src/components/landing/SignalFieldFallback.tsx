'use client';

import React from 'react';

/**
 * Static CSS-only fallback for the 3D signal field.
 * Rendered on mobile (<768px) and when prefers-reduced-motion is set.
 * Uses the same violet/signal color palette as the 3D scene.
 */
export default function SignalFieldFallback() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Signal-green accent */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          bottom: '-15%',
          right: '-10%',
          background:
            'radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Violet accent top-left */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full animate-float"
        style={{
          top: '-10%',
          left: '-5%',
          background:
            'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Marigold subtle accent */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full animate-glow-pulse"
        style={{
          top: '55%',
          left: '30%',
          background:
            'radial-gradient(circle, rgba(242,169,59,0.04) 0%, transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Simulated node dots — decorative */}
      {[
        { top: '15%', left: '20%', color: '#8B5CF6', size: 6, delay: 0 },
        { top: '25%', left: '75%', color: '#34D399', size: 5, delay: 1.5 },
        { top: '60%', left: '15%', color: '#34D399', size: 4, delay: 0.8 },
        { top: '40%', left: '85%', color: '#8B5CF6', size: 7, delay: 2.1 },
        { top: '70%', left: '60%', color: '#8B5CF6', size: 5, delay: 0.3 },
        { top: '80%', left: '35%', color: '#34D399', size: 4, delay: 1.2 },
        { top: '20%', left: '50%', color: '#8B5CF6', size: 3, delay: 1.8 },
        { top: '50%', left: '40%', color: '#34D399', size: 6, delay: 0.6 },
      ].map((node, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-glow-pulse"
          style={{
            top: node.top,
            left: node.left,
            width: node.size,
            height: node.size,
            backgroundColor: node.color,
            boxShadow: `0 0 ${node.size * 3}px ${node.color}60`,
            opacity: 0.6,
            animationDelay: `${node.delay}s`,
          }}
        />
      ))}

      {/* Thin connecting lines — SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line x1="20%" y1="15%" x2="50%" y2="20%" stroke="#8B5CF6" strokeWidth="1" />
        <line x1="50%" y1="20%" x2="75%" y2="25%" stroke="#34D399" strokeWidth="1" />
        <line x1="15%" y1="60%" x2="40%" y2="50%" stroke="#34D399" strokeWidth="1" />
        <line x1="40%" y1="50%" x2="85%" y2="40%" stroke="#8B5CF6" strokeWidth="1" />
        <line x1="60%" y1="70%" x2="85%" y2="40%" stroke="#8B5CF6" strokeWidth="0.5" />
        <line x1="35%" y1="80%" x2="60%" y2="70%" stroke="#34D399" strokeWidth="0.5" />
      </svg>
    </div>
  );
}
