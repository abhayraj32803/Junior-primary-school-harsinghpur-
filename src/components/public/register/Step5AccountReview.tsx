import React, { useState } from 'react';
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Users, 
  GraduationCap, 
  FileText, 
  Edit3, 
  ShieldCheck, 
  Send,
  Mail,
  Sparkles,
  Check,
  ChevronRight
} from 'lucide-react';
import { Step1Data } from './Step1BasicInfo';
import { Step2Data } from './Step2ParentsInfo';
import { Step3Data } from './Step3AcademicInfo';
import { Step4Data, UploadedDocSlot } from './Step4Documents';

export interface Step5Data {
  preferredUsername: string;
  password: string;
  confirmPassword: string;
}

interface Step5AccountReviewProps {
  step1Data: Step1Data;
  step2Data: Step2Data;
  step3Data: Step3Data;
  step4Data: Step4Data;
  data: Step5Data;
  onChange: (updates: Partial<Step5Data>) => void;
  onEditStep: (stepNumber: number) => void;
  errors: Record<string, string>;
  language: 'hi' | 'en';
  isSubmitting: boolean;
  onSubmit: () => void;
}

export const Step5AccountReview: React.FC<Step5AccountReviewProps> = ({
  step1Data,
  step2Data,
  step3Data,
  step4Data,
  data,
  onChange,
  onEditStep,
  errors,
  language,
  isSubmitting,
  onSubmit
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: language === 'hi' ? 'कमजोर (Weak)' : 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: language === 'hi' ? 'मध्यम (Fair)' : 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: language === 'hi' ? 'अच्छा (Good)' : 'Good', color: 'bg-blue-500' };
    return { score: 4, label: language === 'hi' ? 'मजबूत (Strong)' : 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(data.password);
  const passwordsMatch = data.password && data.confirmPassword && data.password === data.confirmPassword;
  const uploadedDocsList: UploadedDocSlot[] = Object.values(step4Data.documents || {});

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-amber-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'चरण 5: छात्र लॉगिन खाता निर्माण एवं विवरण समीक्षा' : 'Step 5: Student Portal Account & Final Review'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'पोर्टल लॉगिन हेतु एक सुरक्षित पासवर्ड बनाएं। आवेदन जमा करने से पूर्व सभी प्रविष्टियों की समीक्षा करें।'
              : 'Create a password for student portal access and review your complete application summary before final submission.'}
          </p>
        </div>
      </div>

      {/* Account Credentials Setup */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-5 shadow-lg">
        <div className="flex items-center gap-2 text-amber-400">
          <Lock className="w-5 h-5" />
          <h4 className="text-sm font-extrabold uppercase tracking-wider">
            {language === 'hi' ? 'छात्र पोर्टल लॉगिन क्रेडेंशियल (Portal Access Credentials)' : 'Portal Access Credentials'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Suggested Username ID */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {language === 'hi' ? 'छात्र आईडी (Suggested Student ID)' : 'Suggested Student ID'}
            </label>
            <div className="relative">
              <input
                type="text"
                value={data.preferredUsername}
                onChange={(e) => onChange({ preferredUsername: e.target.value.toUpperCase() })}
                placeholder="STU-2026-XXXX"
                className="w-full px-4 py-3 min-h-[44px] bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-amber-300 font-mono font-bold focus:border-amber-400 focus:outline-hidden"
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              {language === 'hi' ? 'लॉगिन हेतु छात्र आईडी या ईमेल का उपयोग करें।' : 'Use Student ID or Email to log in.'}
            </span>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {language === 'hi' ? 'पासवर्ड बनाएं (Create Password)' : 'Create Password'}{' '}
              <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => onChange({ password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-4 pr-10 py-3 min-h-[44px] bg-slate-800 border rounded-xl text-xs sm:text-sm text-white font-semibold focus:outline-hidden ${
                  errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-700 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.password}</span>
              </p>
            )}

            {/* Strength Meter */}
            {data.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{language === 'hi' ? 'सुरक्षा स्तर:' : 'Strength:'}</span>
                  <span className="font-bold text-slate-300">{strength.label}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full flex-1 rounded-full transition-all ${
                        step <= strength.score ? strength.color : 'bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              {language === 'hi' ? 'पासवर्ड की पुष्टि (Confirm Password)' : 'Confirm Password'}{' '}
              <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => onChange({ confirmPassword: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-4 pr-10 py-3 min-h-[44px] bg-slate-800 border rounded-xl text-xs sm:text-sm text-white font-semibold focus:outline-hidden ${
                  errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-700 focus:border-amber-400'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p className="mt-1 text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.confirmPassword}</span>
              </p>
            ) : passwordsMatch ? (
              <p className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{language === 'hi' ? 'पासवर्ड मेल खाता है ✓' : 'Passwords match ✓'}</span>
              </p>
            ) : null}
          </div>

        </div>
      </div>

      {/* Review Summary Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {language === 'hi' ? 'आवेदन समीक्षा सारांश (Application Summary Review)' : 'Application Summary'}
          </h4>
          <span className="text-[11px] text-slate-500 font-semibold">
            {language === 'hi' ? 'संशोधन हेतु संपादन (Edit) पर क्लिक करें' : 'Click Edit to modify any step'}
          </span>
        </div>

        {/* Step 1 Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <User className="w-4 h-4 text-blue-600" />
              <span>{language === 'hi' ? 'चरण 1: व्यक्तिगत विवरण' : 'Step 1: Personal Details'}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(1)}
              className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{language === 'hi' ? 'संशोधन करें' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'नाम' : 'Name'}</span>
              <span className="font-bold text-slate-800">{step1Data.fullName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'ईमेल' : 'Email'}</span>
              <span className="font-semibold text-slate-800 truncate block">{step1Data.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'मोबाइल' : 'Mobile'}</span>
              <span className="font-semibold font-mono text-slate-800">{step1Data.phone || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'जन्मतिथि / लिंग' : 'DOB / Gender'}</span>
              <span className="font-semibold text-slate-800">{step1Data.dateOfBirth || '—'} ({step1Data.gender})</span>
            </div>
          </div>
        </div>

        {/* Step 2 Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <Users className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? 'चरण 2: अभिभावक व निवास विवरण' : 'Step 2: Parents & Address'}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(2)}
              className="px-3 py-1 bg-white hover:bg-amber-50 text-amber-600 text-xs font-bold rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{language === 'hi' ? 'संशोधन करें' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'पिता का नाम' : 'Father'}</span>
              <span className="font-bold text-slate-800">{step2Data.fatherName || '—'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'माता का नाम' : 'Mother'}</span>
              <span className="font-bold text-slate-800">{step2Data.motherName || '—'}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'स्थानीय पता' : 'Address'}</span>
              <span className="font-semibold text-slate-800 truncate block">{step2Data.address}, {step2Data.village || ''}</span>
            </div>
          </div>
        </div>

        {/* Step 3 Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>{language === 'hi' ? 'चरण 3: शैक्षणिक विवरण' : 'Step 3: Academic Details'}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(3)}
              className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-600 text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{language === 'hi' ? 'संशोधन करें' : 'Edit'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'कक्षा व वर्ग' : 'Class & Section'}</span>
              <span className="font-black text-emerald-700">Class {step3Data.classNumber} - Section {step3Data.sectionName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'माध्यम' : 'Medium'}</span>
              <span className="font-semibold text-slate-800">{step3Data.mediumOfInstruction}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'प्रवेश श्रेणी' : 'Admission Quota'}</span>
              <span className="font-semibold text-slate-800">{step3Data.admissionQuota}</span>
            </div>
          </div>
        </div>

        {/* Step 4 Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 mb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>{language === 'hi' ? 'चरण 4: संलग्न दस्तावेज' : 'Step 4: Attached Documents'}</span>
            </div>
            <button
              type="button"
              onClick={() => onEditStep(4)}
              className="px-3 py-1 bg-white hover:bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{language === 'hi' ? 'संशोधन करें' : 'Edit'}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {uploadedDocsList.length > 0 ? (
              uploadedDocsList.map((doc, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700 shadow-2xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{doc.titleHi}</span>
                </span>
              ))
            ) : (
              <span className="text-slate-400 text-xs italic">
                {language === 'hi' ? 'कोई दस्तावेज अभी संलग्न नहीं (प्रवेश उपरांत विद्यालय में जमा करें)' : 'No documents uploaded yet (Can submit later at school)'}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Verification Notice & Submission CTA */}
      <div className="bg-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-800 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {language === 'hi' ? 'ईमेल OTP कोड सत्यापन प्रक्रिया' : 'Email OTP Verification Step'}
            </h4>
            <p className="text-xs text-emerald-200 leading-relaxed">
              {language === 'hi'
                ? `आवेदन सबमिट करने पर आपके पंजीकृत ईमेल (${step1Data.email || 'ईमेल'}) पर 6-अंकों का सुरक्षा सत्यापन कोड (OTP) भेजा जाएगा। कोड दर्ज करते ही छात्र खाता सक्रिय हो जाएगा।`
                : `Upon submission, a 6-digit verification OTP will be sent to your registered email (${step1Data.email || 'Email'}). Account activates immediately upon code entry.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className={`w-full py-4 min-h-[52px] bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-sm sm:text-base font-black rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.01]'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>{language === 'hi' ? 'पंजीकरण संसाधित हो रहा है...' : 'Processing Admission Application...'}</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>{language === 'hi' ? 'प्रवेश आवेदन जमा करें एवं OTP प्राप्त करें' : 'Submit Admission & Receive OTP'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
