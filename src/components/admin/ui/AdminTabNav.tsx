import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface AdminTabNavProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onChangeTab: (tabId: T) => void;
  className?: string;
}

export function AdminTabNav<T extends string = string>({
  tabs,
  activeTab,
  onChangeTab,
  className = ''
}: AdminTabNavProps<T>) {
  return (
    <div className={`flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChangeTab(tab.id)}
            className={`min-h-[38px] sm:min-h-[36px] flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 touch-manipulation active:scale-[0.98] ${
              isActive
                ? 'bg-[#0F172A] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            {Icon && (
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
            )}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
