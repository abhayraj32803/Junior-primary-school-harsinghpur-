import React from 'react';

export interface AdminPageHeaderProps {
  badge?: string;
  badgeVariant?: 'indigo' | 'emerald' | 'amber' | 'slate' | 'rose';
  title: string;
  description?: string;
  children?: React.ReactNode; // Action buttons / controls
  className?: string;
}

export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({
  badge,
  badgeVariant = 'indigo',
  title,
  description,
  children,
  className = ''
}) => {
  const badgeClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80'
  }[badgeVariant];

  return (
    <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 ${className}`}>
      <div className="space-y-1 min-w-0">
        {badge && (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${badgeClasses}`}>
            {badge}
          </span>
        )}
        <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#172033] tracking-tight truncate">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-3xl font-normal">
            {description}
          </p>
        )}
      </div>

      {children && (
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
