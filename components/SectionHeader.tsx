import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  linkText?: string;
  linkHref?: string;
}

export default function SectionHeader({
  icon,
  title,
  subtitle,
  linkText,
  linkHref,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-6 mb-5 sm:mb-6">
      <div>
        <h2 className="text-xl sm:text-[24px] font-bold tracking-normal leading-[1.2] flex items-center gap-3">
          {icon}
          <span>{title}</span>
        </h2>
        {subtitle && (
          <p className="text-sm text-zinc-400 leading-relaxed tracking-normal mt-1.5">{subtitle}</p>
        )}
      </div>

      {linkText && linkHref && (
        <Link
          href={linkHref}
          className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-2 whitespace-nowrap shrink-0 tracking-wide transition-colors"
        >
          {linkText} <ArrowRight className="w-4 h-4 ml-0.5" />
        </Link>
      )}
    </div>
  );
}
