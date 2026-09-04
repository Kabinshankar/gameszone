import React from 'react';
import Link from 'next/link';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  children: React.ReactNode;
  className?: string;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-xl disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer leading-none';

  const variantStyles = {
    primary: 'bg-gradient-to-b from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 border-t border-indigo-300/40 border-b border-indigo-800/80 hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
    secondary: 'bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-100 border-t border-zinc-600/50 border-b border-zinc-950/80 shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
    outline: 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 hover:border-zinc-500 hover:-translate-y-0.5 active:scale-95',
    ghost: 'bg-transparent hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100',
    icon: 'p-3 bg-gradient-to-b from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-zinc-300 hover:text-white border-t border-zinc-600/40 border-b border-zinc-950/80 shadow-md active:scale-95',
  };

  const sizeStyles = {
    sm: 'text-xs px-4 py-2.5 gap-2',
    md: 'text-sm px-6 py-3.5 gap-2.5',
    lg: 'text-base px-8 py-4 gap-3',
  };

  const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${variant === 'icon' ? '' : sizeStyles[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button className={combinedClasses} {...props}>
      {children}
    </button>
  );
}
