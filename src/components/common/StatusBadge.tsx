import React from 'react';
import { DataVerificationStatus, VerificationMeta } from '../../types';
import { CheckCircle2, ShieldCheck, Clock, HelpCircle, AlertCircle, Info } from 'lucide-react';

interface StatusBadgeProps {
  status?: DataVerificationStatus | string;
  verification?: VerificationMeta;
  source?: string;
  sourceType?: string;
  size?: 'xs' | 'sm' | 'md';
  showDetailsTooltip?: boolean;
  language?: 'hi' | 'en';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  verification,
  source,
  sourceType,
  size = 'sm',
  showDetailsTooltip = false,
  language = 'hi'
}) => {
  const actualStatus: DataVerificationStatus = (
    verification?.statusType || 
    (verification?.status === 'verified' ? 'VERIFIED_CURRENT' : undefined) ||
    (verification?.status === 'verification_required' ? 'HISTORICAL_VERIFICATION_REQUIRED' : undefined) ||
    (status as DataVerificationStatus) || 
    'HISTORICAL_VERIFICATION_REQUIRED'
  );

  const displaySource = source || verification?.source;

  let badgeConfig = {
    bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-500/20',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
    labelHi: 'सत्यापित वर्तमान',
    labelEn: 'Verified Current',
    code: 'VERIFIED_CURRENT'
  };

  switch (actualStatus) {
    case 'VERIFIED_CURRENT':
      badgeConfig = {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 ring-emerald-500/20',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
        labelHi: 'सत्यापित वर्तमान',
        labelEn: 'Verified Current',
        code: 'VERIFIED_CURRENT'
      };
      break;

    case 'SCHOOL_PROVIDED':
      badgeConfig = {
        bg: 'bg-blue-50 text-blue-900 border-blue-300 ring-blue-500/20',
        dot: 'bg-blue-500',
        icon: ShieldCheck,
        labelHi: 'विद्यालय प्रदत्त',
        labelEn: 'School-Provided',
        code: 'SCHOOL_PROVIDED'
      };
      break;

    case 'HISTORICAL_VERIFICATION_REQUIRED':
      badgeConfig = {
        bg: 'bg-amber-50 text-amber-950 border-amber-300 ring-amber-500/20',
        dot: 'bg-amber-500',
        icon: Clock,
        labelHi: 'ऐतिहासिक / सत्यापन अपेक्षित',
        labelEn: 'Historical / Needs Verification',
        code: 'HISTORICAL_VERIFICATION_REQUIRED'
      };
      break;

    case 'NOT_AVAILABLE':
    default:
      badgeConfig = {
        bg: 'bg-slate-100 text-slate-750 border-slate-300 ring-slate-400/20',
        dot: 'bg-slate-400',
        icon: HelpCircle,
        labelHi: 'अनुपलब्ध',
        labelEn: 'Not Available',
        code: 'NOT_AVAILABLE'
      };
      break;
  }

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-xs px-3 py-1.5 gap-2'
  }[size];

  const Icon = badgeConfig.icon;

  return (
    <div className="inline-flex items-center group relative">
      <span className={`inline-flex items-center font-semibold rounded-full border shadow-2xs transition-all ${sizeClasses} ${badgeConfig.bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${badgeConfig.dot} shrink-0`}></span>
        <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
        <span className="truncate whitespace-nowrap">
          {language === 'hi' ? badgeConfig.labelHi : badgeConfig.labelEn}
        </span>
      </span>

      {showDetailsTooltip && (displaySource || verification?.note) && (
        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-slate-100 text-[11px] rounded-xl shadow-xl z-50 pointer-events-none border border-slate-700">
          <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
            <Info className="w-3 h-3" />
            <span>{language === 'hi' ? 'डेटा स्रोत व विवरण' : 'Data Source & Note'}</span>
          </div>
          {displaySource && (
            <div className="text-slate-300 mb-0.5">
              <span className="text-slate-400 font-medium">{language === 'hi' ? 'स्रोत: ' : 'Source: '}</span>
              {displaySource}
            </div>
          )}
          {verification?.lastVerified && (
            <div className="text-slate-400 text-[10px]">
              {language === 'hi' ? 'सत्यापन तिथि: ' : 'Verified On: '}{verification.lastVerified}
            </div>
          )}
          {verification?.note && (
            <div className="text-slate-300 text-[10px] mt-1 pt-1 border-t border-slate-800 italic">
              {verification.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
