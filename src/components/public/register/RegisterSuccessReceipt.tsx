import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  LogIn, 
  Home, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Award, 
  Sparkles,
  School,
  FileCheck2,
  Lock,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { OtpInput } from '../../common/OtpInput';
import { UserProfile } from '../../../types';

interface RegisterSuccessReceiptProps {
  studentProfile: UserProfile | null;
  registeredEmail: string;
  isOtpStep: boolean;
  onVerifyOtp: (code: string) => Promise<boolean>;
  onResendOtp: () => Promise<boolean | void>;
  onNavigateLogin: () => void;
  onNavigateHome: () => void;
  language: 'hi' | 'en';
}

export const RegisterSuccessReceipt: React.FC<RegisterSuccessReceiptProps> = ({
  studentProfile,
  registeredEmail,
  isOtpStep,
  onVerifyOtp,
  onResendOtp,
  onNavigateLogin,
  onNavigateHome,
  language
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otpCode;
    if (!code || code.length < 6) {
      setOtpError(language === 'hi' ? 'कृपया 6 अंकों का पूरा सत्यापन कोड दर्ज करें।' : 'Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      const ok = await onVerifyOtp(code);
      if (ok) {
        setOtpSuccess(language === 'hi' ? 'ईमेल सत्यापन सफल! खाता सक्रिय कर दिया गया है।' : 'Email verified successfully! Account is now active.');
      } else {
        setOtpError(language === 'hi' ? 'गलत या अमान्य सत्यापन कोड। कृपया पुनः प्रयास करें।' : 'Invalid or expired verification code. Please try again.');
      }
    } catch (err: any) {
      setOtpError(err?.message || (language === 'hi' ? 'सत्यापन में त्रुटि हुई।' : 'Verification failed.'));
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // If currently in OTP Verification Stage
  if (isOtpStep) {
    return (
      <div className="max-w-xl mx-auto py-8 px-4 sm:px-6 animate-fade-in">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {language === 'hi' ? 'ईमेल OTP कोड सत्यापन' : 'Email OTP Verification'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {language === 'hi' 
                ? `हमने 6 अंकों का सुरक्षा कोड आपके पंजीकृत ईमेल पर भेजा है:`
                : `We have sent a 6-digit security code to your registered email:`}
            </p>
            <div className="mt-2 inline-block px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 font-mono font-bold text-amber-300 text-xs sm:text-sm">
              {registeredEmail}
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                {language === 'hi'
                  ? 'सुरक्षा नियमों के अनुसार सत्यापन कोड केवल पंजीकृत ईमेल पर भेजा जाता है। इनबॉक्स अथवा स्पैम (Spam/Junk) फोल्डर चेक करें।'
                  : 'As per security guidelines, the OTP is strictly sent only to your email address. Please check Inbox or Spam folder.'}
              </span>
            </div>

            {/* Otp Input Control */}
            <div className="py-2">
              <OtpInput
                length={6}
                value={otpCode}
                onChange={setOtpCode}
                onComplete={handleVerify}
                onResend={onResendOtp}
                isLoading={isVerifying}
                errorMessage={otpError}
                successMessage={otpSuccess}
                lang={language}
              />
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={() => handleVerify()}
              disabled={isVerifying || otpCode.length < 6}
              className={`w-full py-3.5 min-h-[48px] bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isVerifying || otpCode.length < 6 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying Code...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>{language === 'hi' ? 'कोड सत्यापित करें और आगे बढ़ें' : 'Verify Code & Proceed'}</span>
                </>
              )}
            </button>

            {/* Helper Skip/Home Links */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onNavigateLogin}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'सीधे लॉगिन स्क्रीन पर जाएं →' : 'Go directly to Login Screen →'}
              </button>
            </div>

          </div>

        </div>
      </div>
    );
  }

  // Once Verified: Digital Admission Receipt & ID Card
  const profile = studentProfile;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 animate-scale-in print:p-0 print:m-0">
      
      {/* Top Congratulatory Bar */}
      <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 text-center shadow-xl mb-6 relative overflow-hidden print:hidden">
        <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black">
          {language === 'hi' ? 'प्रवेश आवेदन सफलतापूर्वक पंजीकृत!' : 'Admission Application Registered!'}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-lg mx-auto leading-relaxed">
          {language === 'hi'
            ? 'छात्र का प्रवेश आवेदन सफलतापूर्वक दर्ज हो गया है। नीचे दी गई डिजिटल प्रवेश रसीद सुरक्षित रख लें।'
            : 'Your admission application has been registered successfully. Please retain this provisional admission receipt.'}
        </p>
      </div>

      {/* Printable Digital Admission Receipt Card */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        
        {/* Receipt Institutional Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shrink-0 shadow-md">
                <School className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                  {language === 'hi' ? 'प्राथमिक विद्यालय हरसिंहपुर गोवा' : 'Primary School Harsinghpur Gova'}
                </h3>
                <p className="text-xs text-slate-400">
                  {language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश • UDISE: 09290205902' : 'Basic Education Dept, Uttar Pradesh • UDISE: 09290205902'}
                </p>
              </div>
            </div>

            <div className="text-center sm:text-right bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">
                {language === 'hi' ? 'आवेदन पावती / रसीद' : 'Admission Receipt'}
              </span>
              <span className="font-mono text-sm font-black text-white">
                {profile?.admissionNumber || 'ADM-2026-PROV'}
              </span>
            </div>
          </div>
        </div>

        {/* Student Details Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
            {/* Student Photo */}
            <div className="w-28 h-32 rounded-2xl bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shadow-xs shrink-0">
              {profile?.profilePhoto || profile?.photoURL ? (
                <img
                  src={profile.profilePhoto || profile.photoURL}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 mb-1">
                {language === 'hi' ? 'सत्र 2025-26 प्रवेशित' : 'Enrolled Session 2025-26'}
              </div>
              <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                {profile?.name || profile?.fullName}
              </h4>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-600">
                <span className="font-bold text-slate-900">
                  {language === 'hi' ? `कक्षा: ${profile?.classNumber || '1'} (वर्ग ${profile?.sectionName || 'A'})` : `Class: ${profile?.classNumber || '1'} (Sec ${profile?.sectionName || 'A'})`}
                </span>
                <span>•</span>
                <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  ID: {profile?.username || profile?.studentId}
                </span>
              </div>
            </div>
          </div>

          {/* Full Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'पिता का नाम' : 'Father\'s Name'}</span>
              <span className="font-bold text-slate-800">{profile?.fatherName || '—'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'माता का नाम' : 'Mother\'s Name'}</span>
              <span className="font-bold text-slate-800">{profile?.motherName || '—'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'जन्मतिथि' : 'Date of Birth'}</span>
              <span className="font-bold text-slate-800">{profile?.dateOfBirth || profile?.dob || '—'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'पंजीकृत ईमेल' : 'Email'}</span>
              <span className="font-semibold text-slate-800 truncate block">{profile?.email || registeredEmail}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'मोबाइल नंबर' : 'Phone'}</span>
              <span className="font-semibold font-mono text-slate-800">{profile?.phone || profile?.mobile || '—'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{language === 'hi' ? 'सामाजिक वर्ग' : 'Category'}</span>
              <span className="font-bold text-slate-800">{profile?.category || 'General'}</span>
            </div>

          </div>

          {/* Official Verification Seal Banner */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900 block">
                {language === 'hi' ? 'प्रधानाध्यापिका आधिकारिक मुहर व भौतिक सत्यापन:' : 'Head Teacher Physical Verification Stamp:'}
              </span>
              <p className="text-amber-800 leading-relaxed">
                {language === 'hi'
                  ? 'यह एक अनंतिम (Provisional) प्रवेश रसीद है। विद्यालय खुलने पर मूल दस्तावेजों की छायाप्रति प्रधानाध्यापिका के समक्ष प्रस्तुत करें।'
                  : 'This is a provisional admission slip. Please present photocopies of required documents to the Head Teacher at school.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 print:hidden">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 text-slate-600" />
                <span>{language === 'hi' ? 'रसीद प्रिंट / डाउनलोड करें' : 'Print / Download'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onNavigateHome}
                className="min-h-[44px] px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Home className="w-4 h-4 text-slate-500" />
                <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
              </button>

              <button
                type="button"
                onClick={onNavigateLogin}
                className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>{language === 'hi' ? 'छात्र पोर्टल में लॉगिन करें' : 'Login to Student Portal'}</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
