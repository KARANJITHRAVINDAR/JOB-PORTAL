import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'signal' | 'marigold';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyle = 'rounded-full py-3 px-5 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantStyles = {
    primary: 'bg-violet text-text-primary hover:bg-violet-dim focus:outline-none focus:ring-2 focus:ring-violet/50',
    secondary: 'bg-bg-surface text-text-primary border border-line hover:bg-bg-surface-raised focus:outline-none focus:ring-2 focus:ring-line/50',
    signal: 'bg-transparent text-signal border border-signal hover:bg-signal/10 focus:outline-none focus:ring-2 focus:ring-signal/30',
    marigold: 'bg-marigold text-bg-void hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-marigold/50',
  };

  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
