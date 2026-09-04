import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

export default function Container({ children, className = '', id }: ContainerProps) {
  return (
    <div
      id={id}
      className={`w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 box-border min-w-0 ${className}`}
    >
      {children}
    </div>
  );
}
