import React from 'react';

type PingColor = 'violet' | 'marigold' | 'signal' | 'muted';

interface SignalPingProps {
  color?: PingColor;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function SignalPing({
  color = 'signal',
  size = 'md',
  className = '',
}: SignalPingProps) {
  const colorMap = {
    violet: {
      dot: 'bg-violet shadow-[0_0_8px_rgba(139,92,246,0.5)]',
      ring: 'border-violet/30 bg-violet/2',
    },
    marigold: {
      dot: 'bg-marigold shadow-[0_0_8px_rgba(242,169,59,0.5)]',
      ring: 'border-marigold/30 bg-marigold/2',
    },
    signal: {
      dot: 'bg-signal shadow-[0_0_8px_rgba(52,211,153,0.5)]',
      ring: 'border-signal/30 bg-signal/2',
    },
    muted: {
      dot: 'bg-text-muted',
      ring: 'border-text-muted/20 bg-text-muted/1',
    },
  };

  const sizeMap = {
    sm: { wrapper: 'w-6 h-6', dot: 'w-1.5 h-1.5' },
    md: { wrapper: 'w-12 h-12', dot: 'w-2.5 h-2.5' },
    lg: { wrapper: 'w-24 h-24', dot: 'w-4 h-4' },
  };

  const selectedColor = colorMap[color] || colorMap.signal;
  const selectedSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center ${selectedSize.wrapper} ${className}`}>
      {/* Concentric rings */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-full border ${selectedColor.ring} animate-ping-pulse motion-reduce:animate-none motion-reduce:opacity-20`}
          style={{
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}
      
      {/* Center dot */}
      <div className={`rounded-full ${selectedColor.dot} relative z-10`} style={{
        width: selectedSize.dot,
        height: selectedSize.dot,
      }} />
    </div>
  );
}
