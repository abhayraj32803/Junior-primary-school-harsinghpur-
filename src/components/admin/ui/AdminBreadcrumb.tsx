import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

export interface AdminBreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigateHome?: () => void;
  className?: string;
}

export const AdminBreadcrumb: React.FC<AdminBreadcrumbProps> = ({
  items,
  onNavigateHome,
  className = ''
}) => {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-[#64748B] font-medium py-1 overflow-x-auto custom-scrollbar whitespace-nowrap ${className}`}>
      <button
        type="button"
        onClick={onNavigateHome}
        className="flex items-center gap-1.5 hover:text-indigo-600 active:text-indigo-700 transition-colors cursor-pointer shrink-0 text-[#64748B] hover:underline"
        title="Dashboard Home"
      >
        <Home className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1.5 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-[#172033] truncate max-w-[200px] sm:max-w-none">
                {item.label}
              </span>
            ) : item.onClick ? (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-indigo-600 transition-colors cursor-pointer truncate max-w-[150px] sm:max-w-none"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-[#64748B] truncate max-w-[150px] sm:max-w-none">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
