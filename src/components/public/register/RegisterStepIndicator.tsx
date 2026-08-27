import React from 'react';
import { 
  User, 
  Users, 
  GraduationCap, 
  FileText, 
  KeyRound, 
  CheckCircle2, 
  ChevronRight 
} from 'lucide-react';

export interface StepItem {
  id: number;
  titleEn: string;
  titleHi: string;
  shortTitleEn: string;
  shortTitleHi: string;
  icon: React.ElementType;
}

export const REGISTRATION_STEPS: StepItem[] = [
  {
    id: 1,
    titleEn: 'Basic Information',
    titleHi: 'व्यक्तिगत विवरण',
    shortTitleEn: 'Basic Info',
    shortTitleHi: 'व्यक्तिगत',
    icon: User
  },
  {
    id: 2,
    titleEn: 'Parent & Guardian Details',
    titleHi: 'अभिभावक विवरण',
    shortTitleEn: 'Parents',
    shortTitleHi: 'अभिभावक',
    icon: Users
  },
  {
    id: 3,
    titleEn: 'Academic Details',
    titleHi: 'शैक्षणिक विवरण',
    shortTitleEn: 'Academics',
    shortTitleHi: 'शैक्षणिक',
    icon: GraduationCap
  },
  {
    id: 4,
    titleEn: 'Documents & Undertaking',
    titleHi: 'दस्तावेज व घोषणा',
    shortTitleEn: 'Documents',
    shortTitleHi: 'दस्तावेज',
    icon: FileText
  },
  {
    id: 5,
    titleEn: 'Account & Verification',
    titleHi: 'खाता व समीक्षा',
    shortTitleEn: 'Review & Account',
    shortTitleHi: 'खाता व समीक्षा',
    icon: KeyRound
  }
];

interface RegisterStepIndicatorProps {
  currentStep: number;
  completedSteps: number[];
  onStepClick: (stepId: number) => void;
  language: 'hi' | 'en';
}

export const RegisterStepIndicator: React.FC<RegisterStepIndicatorProps> = ({
  currentStep,
  completedSteps,
  onStepClick,
  language
}) => {
  const currentStepObj = REGISTRATION_STEPS.find(s => s.id === currentStep) || REGISTRATION_STEPS[0];
  const progressPercent = Math.round(((currentStep - 1) / (REGISTRATION_STEPS.length - 1)) * 100);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 sm:px-8 py-5">
      {/* Desktop Stepper Bar */}
      <div className="hidden md:block max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Track */}
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0" />
          {/* Active Filled Track */}
          <div 
            className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500 -z-0"
            style={{ width: `calc(${progressPercent}% * 0.88)` }}
          />

          {REGISTRATION_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted || step.id < currentStep;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable && !isCurrent}
                className={`relative z-10 flex flex-col items-center group cursor-pointer transition-transform ${
                  !isClickable && !isCurrent ? 'cursor-not-allowed opacity-75' : 'hover:scale-105'
                }`}
                title={language === 'hi' ? step.titleHi : step.titleEn}
              >
                {/* Step Circle */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                      : isCurrent
                      ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-400/30 scale-110 shadow-amber-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-[11px] font-extrabold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-amber-300'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {language === 'hi' ? `चरण ${step.id}` : `Step ${step.id}`}
                  </span>
                  <span
                    className={`block text-xs font-semibold max-w-[110px] truncate ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {language === 'hi' ? step.shortTitleHi : step.shortTitleEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Stepper Header & Compact Progress */}
      <div className="md:hidden space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-sm shadow-md">
              {currentStep}
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                {language === 'hi' ? `चरण ${currentStep} / 5` : `Step ${currentStep} of 5`}
              </div>
              <h3 className="text-sm font-black text-white leading-tight">
                {language === 'hi' ? currentStepObj.titleHi : currentStepObj.titleEn}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-amber-300">
              {progressPercent}%
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              {language === 'hi' ? 'पूर्ण' : 'Complete'}
            </span>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.max(progressPercent, 12)}%` }}
          />
        </div>

        {/* Step Quick Pills */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {REGISTRATION_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isClickable = isCompleted || step.id < currentStep;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable && !isCurrent}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-400 text-slate-950'
                    : isCompleted
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                }`}
              >
                {isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                <span>{step.id}. {language === 'hi' ? step.shortTitleHi : step.shortTitleEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
