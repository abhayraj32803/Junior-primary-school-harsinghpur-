import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  dark?: boolean;
}

/**
 * Base Atomic Skeleton Element with Shimmer Effect
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rounded',
  width,
  height,
  dark = false,
  style,
  ...props
}) => {
  const variantStyles = {
    text: 'h-4 rounded-md',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
    circular: 'rounded-full'
  };

  const baseTheme = dark
    ? 'bg-slate-800/80'
    : 'bg-slate-200/80';

  const inlineStyles: React.CSSProperties = {
    width: width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height !== undefined ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    ...style
  };

  return (
    <div
      className={`relative overflow-hidden skeleton-shimmer ${baseTheme} ${variantStyles[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    >
      <div 
        className={`absolute inset-0 -translate-x-full skeleton-shimmer-wave ${
          dark 
            ? 'bg-gradient-to-r from-transparent via-slate-700/40 to-transparent' 
            : 'bg-gradient-to-r from-transparent via-white/70 to-transparent'
        }`} 
      />
    </div>
  );
};

/**
 * Hub Page Header Skeleton
 */
export const HubHeaderSkeleton: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div className="space-y-2.5 max-w-xl">
      <div className="flex items-center gap-2">
        <Skeleton width={90} height={20} className="rounded-full" />
        <Skeleton width={110} height={20} className="rounded-full" />
      </div>
      <Skeleton width="65%" height={28} className="rounded-lg" />
      <Skeleton width="90%" height={16} className="rounded-md" />
    </div>
    <div className="flex items-center gap-2 shrink-0">
      <Skeleton width={120} height={36} className="rounded-lg" />
      <Skeleton width={100} height={36} className="rounded-lg" />
    </div>
  </div>
);

/**
 * Tab Navigation Skeleton (Pill Bar)
 */
export const TabNavSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton 
        key={i} 
        width={i === 0 ? 140 : 120} 
        height={36} 
        className="rounded-lg shrink-0" 
      />
    ))}
  </div>
);

/**
 * Metric Cards Skeleton Row
 */
export const MetricCardsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton width="50%" height={14} className="rounded-md" />
          <Skeleton width={36} height={36} variant="circular" />
        </div>
        <Skeleton width="40%" height={32} className="rounded-lg" />
        <Skeleton width="75%" height={12} className="rounded-md" />
      </div>
    ))}
  </div>
);

/**
 * Data Table Skeleton
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 5
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
    {/* Table Top Controls */}
    <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <Skeleton width={260} height={38} className="rounded-xl" />
      <div className="flex items-center gap-2">
        <Skeleton width={110} height={38} className="rounded-xl" />
        <Skeleton width={130} height={38} className="rounded-xl" />
      </div>
    </div>

    {/* Table Header */}
    <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton 
          key={i} 
          width={i === 0 ? '25%' : i === columns - 1 ? '15%' : '18%'} 
          height={14} 
          className="rounded-md" 
        />
      ))}
    </div>

    {/* Table Rows */}
    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-1/4">
            <Skeleton width={36} height={36} variant="circular" className="shrink-0" />
            <div className="space-y-1.5 w-full">
              <Skeleton width="85%" height={14} className="rounded-md" />
              <Skeleton width="60%" height={10} className="rounded-md" />
            </div>
          </div>
          <Skeleton width="18%" height={14} className="rounded-md" />
          <Skeleton width="18%" height={14} className="rounded-md" />
          <Skeleton width="14%" height={22} className="rounded-full" />
          <div className="flex items-center gap-1.5 w-[15%] justify-end">
            <Skeleton width={32} height={32} className="rounded-lg" />
            <Skeleton width={32} height={32} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Grid Cards Skeleton (For Media, Facilities, Schemes, etc.)
 */
export const CardGridSkeleton: React.FC<{ count?: number; columns?: 2 | 3 | 4 }> = ({
  count = 6,
  columns = 3
}) => {
  const colClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  }[columns];

  return (
    <div className={`grid ${colClass} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton width={40} height={40} className="rounded-xl" />
              <Skeleton width={70} height={22} className="rounded-full" />
            </div>
            <Skeleton width="80%" height={20} className="rounded-lg" />
            <Skeleton width="100%" height={14} className="rounded-md" />
            <Skeleton width="65%" height={14} className="rounded-md" />
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <Skeleton width={80} height={12} className="rounded-md" />
            <Skeleton width={90} height={28} className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Full Admin Hub View Skeleton (Header + SubTabs + Content Placeholder)
 */
export const HubViewSkeleton: React.FC<{ subTabCount?: number; type?: 'table' | 'cards' | 'mixed' }> = ({
  subTabCount = 5,
  type = 'table'
}) => (
  <div className="space-y-5 animate-fade-in">
    {/* Page Header */}
    <HubHeaderSkeleton />

    {/* SubNav Tabs */}
    <TabNavSkeleton count={subTabCount} />

    {/* Dynamic Content Body Skeleton */}
    <div className="pt-1">
      {type === 'table' && <TableSkeleton rows={6} columns={5} />}
      {type === 'cards' && <CardGridSkeleton count={6} columns={3} />}
      {type === 'mixed' && (
        <div className="space-y-4">
          <MetricCardsSkeleton count={3} />
          <TableSkeleton rows={5} columns={4} />
        </div>
      )}
    </div>
  </div>
);

/**
 * Comprehensive Admin Dashboard Skeleton
 * Precision-mirrors the structure of AdminDashboard.tsx
 */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Top Directorate Welcome Header */}
    <div className="bg-[#0F172A] p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
        <Skeleton width={56} height={56} className="rounded-xl shrink-0" dark />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton width={140} height={20} className="rounded-full" dark />
            <Skeleton width={110} height={20} className="rounded-full" dark />
          </div>
          <Skeleton width="60%" height={24} className="rounded-lg" dark />
          <Skeleton width="85%" height={14} className="rounded-md" dark />
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton width={100} height={38} className="rounded-xl" dark />
        <Skeleton width={130} height={38} className="rounded-xl" dark />
      </div>
    </div>

    {/* Pending Approvals Alert Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton width={36} height={36} className="rounded-lg shrink-0 bg-amber-200/60" />
          <div className="space-y-1.5">
            <Skeleton width={120} height={14} className="rounded-md bg-amber-200/60" />
            <Skeleton width={200} height={12} className="rounded-md bg-amber-200/40" />
          </div>
        </div>
        <Skeleton width={80} height={32} className="rounded-lg bg-amber-300/80" />
      </div>
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton width={36} height={36} className="rounded-lg shrink-0 bg-blue-200/60" />
          <div className="space-y-1.5">
            <Skeleton width={120} height={14} className="rounded-md bg-blue-200/60" />
            <Skeleton width={200} height={12} className="rounded-md bg-blue-200/40" />
          </div>
        </div>
        <Skeleton width={80} height={32} className="rounded-lg bg-blue-300/80" />
      </div>
    </div>

    {/* Metric Cards KPI Row */}
    <MetricCardsSkeleton count={4} />

    {/* Quick Action Launchpad */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton width={160} height={18} className="rounded-md" />
          <Skeleton width={240} height={12} className="rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3.5 bg-white rounded-xl border border-slate-200 flex flex-col items-center text-center space-y-2">
            <Skeleton width={40} height={40} className="rounded-xl mb-1" />
            <Skeleton width="70%" height={14} className="rounded-md" />
            <Skeleton width="50%" height={10} className="rounded-md" />
          </div>
        ))}
      </div>
    </div>

    {/* Class Attendance Live Pulse Grid */}
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton width={220} height={18} className="rounded-md" />
          <Skeleton width={280} height={12} className="rounded-md" />
        </div>
        <Skeleton width={140} height={14} className="rounded-md" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-center space-y-2">
            <Skeleton width="60%" height={10} className="mx-auto rounded-md" />
            <Skeleton width="50%" height={20} className="mx-auto rounded-md" />
            <Skeleton width="90%" height={6} className="mx-auto rounded-full" />
            <Skeleton width="70%" height={10} className="mx-auto rounded-md" />
          </div>
        ))}
      </div>
    </div>

    {/* 5 Consolidated Core Administrative Hubs */}
    <div className="space-y-3">
      <div className="space-y-1">
        <Skeleton width={200} height={20} className="rounded-md" />
        <Skeleton width={320} height={14} className="rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between mb-2">
                <Skeleton width={40} height={40} className="rounded-lg" />
                <Skeleton width={75} height={20} className="rounded-md" />
              </div>
              <Skeleton width="75%" height={18} className="rounded-lg" />
              <Skeleton width="100%" height={12} className="rounded-md" />
              <Skeleton width="85%" height={12} className="rounded-md" />
            </div>
            <div className="flex gap-1.5 pt-3 border-t border-slate-100">
              <Skeleton width={50} height={18} className="rounded" />
              <Skeleton width={60} height={18} className="rounded" />
              <Skeleton width={55} height={18} className="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Two-column Bottom Widgets: Active Notices & Security Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width={160} height={18} className="rounded-md" />
          <Skeleton width={60} height={14} className="rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton width="60%" height={14} className="rounded-md" />
                <Skeleton width={60} height={10} className="rounded-md" />
              </div>
              <Skeleton width="90%" height={12} className="rounded-md" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton width={180} height={18} className="rounded-md" />
          <Skeleton width={80} height={14} className="rounded-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <div className="space-y-1.5 flex-1">
                <Skeleton width="50%" height={14} className="rounded-md" />
                <Skeleton width="35%" height={10} className="rounded-md" />
              </div>
              <Skeleton width={45} height={10} className="rounded-md shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
