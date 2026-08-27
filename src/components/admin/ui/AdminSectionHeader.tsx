import React from 'react';

export interface AdminSectionHeaderProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const AdminSectionHeader: React.FC<AdminSectionHeaderProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 ${className}`}>
      <div className="flex items-start sm:items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/80 mt-0.5 sm:mt-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#172033] tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs text-[#64748B] mt-0.5 font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};
