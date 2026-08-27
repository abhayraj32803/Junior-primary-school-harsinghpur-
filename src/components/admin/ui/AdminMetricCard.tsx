import React from 'react';

export interface AdminMetricCardProps {
  label: string;
  value: string | number;
  subtext?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'indigo' | 'teal' | 'amber' | 'slate' | 'rose';
  onClick?: () => void;
  className?: string;
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'indigo',
  onClick,
  className = ''
}) => {
  const iconTheme = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    teal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  }[variant];

  return (
    <div
      onClick={onClick}
      className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-indigo-300 hover:shadow-sm' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] truncate">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border ${iconTheme}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
          {value}
        </div>
        {subtext && (
          <div className="text-xs text-[#64748B] font-medium mt-1">
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
