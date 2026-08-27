import React from 'react';

export type BadgeStatusType = 
  | 'active' 
  | 'pending' 
  | 'inactive' 
  | 'published' 
  | 'draft' 
  | 'danger' 
  | 'success' 
  | 'warning' 
  | 'info';

export interface AdminStatusBadgeProps {
  status: BadgeStatusType | string;
  label?: string;
  dot?: boolean;
  className?: string;
}

export const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({
  status,
  label,
  dot = true,
  className = ''
}) => {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';
  let displayLabel = label || status;

  if (normalized === 'active' || normalized === 'approved' || normalized === 'available' || normalized === 'success') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
    displayLabel = label || 'Active';
  } else if (normalized === 'pending' || normalized === 'warning' || normalized === 'needs verification') {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotColor = 'bg-amber-500';
    displayLabel = label || 'Pending';
  } else if (normalized === 'published' || normalized === 'live' || normalized === 'info') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
    dotColor = 'bg-indigo-500';
    displayLabel = label || 'Published';
  } else if (normalized === 'draft' || normalized === 'inactive' || normalized === 'disabled' || normalized === 'rejected' || normalized === 'absent' || normalized === 'danger') {
    styles = 'bg-red-50 text-red-700 border-red-200/80';
    dotColor = 'bg-red-500';
    displayLabel = label || (normalized === 'absent' ? 'Absent' : 'Inactive');
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${styles} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span className="truncate">{displayLabel}</span>
    </span>
  );
};
