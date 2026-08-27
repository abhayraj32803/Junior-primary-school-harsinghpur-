import React from 'react';

export interface AdminSettingsRowProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  enabled?: boolean;
  onToggle?: (nextValue: boolean) => void;
  disabled?: boolean;
  control?: React.ReactNode; // Custom control (dropdown, input, etc.) if not a boolean toggle
  badge?: string;
  className?: string;
}

export const AdminSettingsRow: React.FC<AdminSettingsRowProps> = ({
  icon: Icon,
  title,
  description,
  enabled = false,
  onToggle,
  disabled = false,
  control,
  badge,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 bg-white hover:bg-slate-50/70 rounded-xl border border-slate-200/80 transition-colors ${className}`}>
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#172033]">
              {title}
            </span>
            {badge && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
        {control ? (
          control
        ) : onToggle ? (
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            disabled={disabled}
            onClick={() => onToggle(!enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              enabled ? 'bg-[#4F46E5]' : 'bg-slate-300'
            }`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
};
