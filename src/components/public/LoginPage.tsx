import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';
import { 
  ShieldCheck, 
  LogIn, 
  GraduationCap, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Home,
  School,
  Mail,
  Send,
  KeyRound,
  RefreshCw,
  UserCheck,
  Building2,
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import { OtpInput } from '../common/OtpInput';
import { 
  sendPasswordResetOtpEmail, 
  verifyPasswordResetOtpCode, 
  completePasswordResetWithToken 
} from '../../services/verificationCodeService';

interface LoginPageProps {
  onSuccess?: () => void;
  onLoginSuccess?: () => void;
  onNavigateHome?: () => void;
  onBackToHome?: () => void;
  onNavigateRegister?: () => void;
  initialRole?: UserRole;
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onSuccess, 
  onLoginSuccess, 
  onNavigateHome, 
  onBackToHome,
  onNavigateRegister,
  initialRole
}) => {
  const { 
    login, 
    isAuthenticated, 
    userProfile, 
    logout 
  } = useAuth();
  const { settings, language } = useSchool();

  const handleSuccess = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    } else if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoHome = onNavigateHome || onBackToHome;

  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole || 'student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync role if initialRole prop changes
  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Password Recovery Modal State (OTP Only - 100% provider-free)
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request_otp' | 'verify_otp' | 'set_password' | 'done'>('request_otp');
  const [resetInput, setResetInput] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetSessionToken, setResetSessionToken] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResending, setResetResending] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    email?: string;
    maskedEmail?: string;
    username?: string;
    message?: string;
  } | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // New Password inputs
  const [directPassword, setDirectPassword] = useState('');
  const [directConfirmPassword, setDirectConfirmPassword] = useState('');
  const [directShowPass, setDirectShowPass] = useState(false);

  // Switch role tab
  const handleSelectRoleTab = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setPassword('');
    setIdentifier('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(language === 'hi' ? 'कृपया यूजरनेम / लॉगिन आईडी दर्ज करें।' : 'Please enter Username / Login ID.');
      return;
    }
    if (!password) {
      setError(language === 'hi' ? 'कृपया पासवर्ड दर्ज करें।' : 'Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await login(selectedRole, identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      handleSuccess();
    } else {
      setError(res.error || (language === 'hi' ? 'लॉगिन असफल रहा। कृपया सही क्रेडेंशियल दर्ज करें।' : 'Failed to authenticate. Please check your credentials.'));
    }
  };

  // Step 1: Send 6-Digit Reset OTP via backend API
  const handleSendResetEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = resetInput.trim();
    if (!clean) {
      setResetError(language === 'hi' ? 'कृपया अपना ईमेल या यूजरनेम दर्ज करें।' : 'Please enter your email or username.');
      return;
    }

    setResetError(null);
    setResetSuccessMsg(null);
    setResetResult(null);
    setResetLoading(true);

    const res = await sendPasswordResetOtpEmail(clean, {
      username: clean,
      role: selectedRole
    });
    setResetLoading(false);

    if (res.success) {
      setResetResult({
        success: true,
        email: clean.includes('@') ? clean : undefined,
        message: res.message || (language === 'hi' ? '6-अंकों का सत्यापन कोड ईमेल पर भेज दिया गया है।' : 'Verification code sent to your email.')
      });
      setResetStep('verify_otp');
    } else {
      setResetError(res.error || (language === 'hi' ? 'कोड भेजने में विफल रहा।' : 'Failed to send verification code.'));
    }
  };

  // Resend OTP handler for OtpInput
  const handleResendOtp = async () => {
    const target = resetResult?.email || resetInput.trim();
    if (!target) return;
    setResetResending(true);
    setResetError(null);
    const res = await sendPasswordResetOtpEmail(target, {
      username: resetResult?.username || resetInput.trim(),
      role: selectedRole
    });
    setResetResending(false);
    if (res.success) {
      setResetSuccessMsg(language === 'hi' ? 'सत्यापन कोड पुनः भेज दिया गया है।' : 'Code resent successfully.');
    } else {
      setResetError(res.error || (language === 'hi' ? 'कोड पुनः भेजने में विफल रहा।' : 'Failed to resend code.'));
    }
  };

  // Step 2: Verify 6-Digit OTP & Obtain resetSessionToken
  const handleVerifyResetOtp = async (codeToVerify?: string) => {
    const cleanCode = (codeToVerify || resetOtpCode).trim();
    if (cleanCode.length !== 6) {
      setResetError(language === 'hi' ? 'कृपया सभी 6 अंक दर्ज करें।' : 'Please enter all 6 digits.');
      return;
    }

    const emailOrUser = resetResult?.email || resetInput.trim();
    setResetLoading(true);
    setResetError(null);

    const res = await verifyPasswordResetOtpCode(emailOrUser, cleanCode);
    setResetLoading(false);

    if (res.success && res.resetSessionToken) {
      setResetSessionToken(res.resetSessionToken);
      setResetStep('set_password');
      setResetError(null);
    } else {
      setResetError(res.error || (language === 'hi' ? 'अमान्य या समाप्त हो चुका OTP कोड।' : 'Invalid or expired OTP code.'));
    }
  };

  // Step 3: Complete Password Reset with Session Token
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (directPassword.length < 6) {
      setResetError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    if (directPassword !== directConfirmPassword) {
      setResetError(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
      return;
    }

    if (!resetSessionToken) {
      setResetError(language === 'hi' ? 'सत्र समाप्त हो गया है। कृपया पुनः OTP प्राप्त करें।' : 'Session expired. Please request OTP again.');
      return;
    }

    setResetLoading(true);
    const targetEmail = resetResult?.email || resetInput.trim();
    const res = await completePasswordResetWithToken(targetEmail, resetSessionToken, directPassword);
    setResetLoading(false);

    if (res.success) {
      setResetStep('done');
      setIdentifier(resetResult?.username || resetResult?.email || resetInput.trim());
      setPassword(directPassword);
    } else {
      setResetError(res.error || (language === 'hi' ? 'पासवर्ड अपडेट असफल रहा।' : 'Failed to update password.'));
    }
  };

  // If user already has an active authenticated session
  if (isAuthenticated && userProfile) {
    return (
      <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-[#f3f6fa] flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans">
        {/* Compact Header */}
        <header className="bg-gov-navy-950 text-white border-b border-slate-800 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center p-0.5 shadow-sm text-gov-navy-950 shrink-0">
                <School className="w-5 h-5 text-gov-navy-950" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black text-white truncate leading-tight">
                  {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                </h1>
                <div className="text-[11px] text-slate-300 font-medium flex items-center gap-2 flex-wrap">
                  <span>{settings.block || 'Shamsabad'}, {settings.district || 'Farrukhabad'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{language === 'hi' ? 'शासकीय पोर्टल' : 'Official Portal'}</span>
                </div>
              </div>
            </div>

            {handleGoHome && (
              <button
                onClick={handleGoHome}
                className="text-xs font-bold text-slate-200 hover:text-white bg-gov-navy-900 hover:bg-gov-navy-800 px-3 py-1.5 rounded-xl border border-gov-navy-700/80 transition-all flex items-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">{language === 'hi' ? 'मुख्य पृष्ठ' : 'Public Home'}</span>
              </button>
            )}
          </div>
        </header>

        {/* Active Session Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="w-full max-w-[480px] bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-900/5 overflow-hidden">
            <div className="bg-gradient-to-br from-gov-navy-950 via-slate-900 to-gov-navy-950 text-white p-6 text-center relative">
              <div className="flex justify-center mb-3">
                <UserAvatar userProfile={userProfile} size="xl" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{language === 'hi' ? 'सक्रिय लॉगिन सत्र' : 'Active Session'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white">{userProfile.name}</h2>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">
                {userProfile.role === 'admin' 
                  ? (language === 'hi' ? 'प्रधानाध्यापक (Headmaster)' : 'Headmaster (Admin)')
                  : userProfile.role === 'teacher'
                  ? (language === 'hi' ? 'शिक्षक / स्टॉफ (Teacher)' : 'Faculty (Teacher)')
                  : (language === 'hi' ? 'छात्र / अभिभावक (Student)' : 'Student / Parent')}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
                {language === 'hi'
                  ? 'आप पहले से पोर्टल में लॉगिन हैं। क्या आप अपने प्रबंधन डैशबोर्ड में जाना चाहते हैं?'
                  : 'You are already signed in. Would you like to proceed to your ERP Dashboard?'}
              </p>

              <button
                onClick={handleSuccess}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-gov-navy-950 font-black text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'hi' ? 'ERP डैशबोर्ड में प्रवेश करें' : 'Proceed to ERP Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer"
                >
                  {language === 'hi' ? 'लॉगआउट करें' : 'Sign Out / Switch'}
                </button>

                {handleGoHome && (
                  <button
                    type="button"
                    onClick={handleGoHome}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-500" />
                    <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Public Home'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="py-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-200/80 bg-white/50">
          <span>© 2026 {language === 'hi' ? 'विद्यालय प्रबंधन पोर्टल • उत्तर प्रदेश बेसिक शिक्षा परिषद' : 'School ERP Portal • UP Basic Education'}</span>
        </footer>
      </div>
    );
  }

  // Role details config
  const roleConfig = {
    admin: {
      title: language === 'hi' ? 'प्रधानाध्यापक लॉगिन' : 'Headmaster Login',
      badge: language === 'hi' ? 'प्रधानाध्यापक' : 'Headmaster',
      idLabel: language === 'hi' ? 'यूज़र आईडी / ईमेल' : 'User ID / Email',
      idPlaceholder: language === 'hi' ? 'उदा. 8090538115 या admin' : 'e.g. 8090538115 or admin',
      passLabel: language === 'hi' ? 'पासवर्ड' : 'Password',
      passPlaceholder: language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password',
      cta: language === 'hi' ? 'प्रधानाध्यापक लॉगिन करें' : 'Sign In as Headmaster',
      icon: ShieldCheck
    },
    teacher: {
      title: language === 'hi' ? 'शिक्षक एवं स्टाफ लॉगिन' : 'Teacher & Staff Login',
      badge: language === 'hi' ? 'शिक्षक / स्टाफ' : 'Teacher / Staff',
      idLabel: language === 'hi' ? 'स्टाफ आईडी / ईमेल / मोबाइल' : 'Staff ID / Email / Mobile',
      idPlaceholder: language === 'hi' ? 'उदा. TCH-2026-001 या 9415000000' : 'e.g. TCH-2026-001 or 9415000000',
      passLabel: language === 'hi' ? 'पासवर्ड' : 'Password',
      passPlaceholder: language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password',
      cta: language === 'hi' ? 'लॉगिन करें' : 'Sign In as Teacher',
      icon: Users
    },
    student: {
      title: language === 'hi' ? 'छात्र एवं अभिभावक लॉगिन' : 'Student & Parent Login',
      badge: language === 'hi' ? 'छात्र / अभिभावक' : 'Student / Parent',
      idLabel: language === 'hi' ? 'छात्र आईडी / प्रवेश संख्या / ईमेल / मोबाइल' : 'Student ID / Admission No / Email / Mobile',
      idPlaceholder: language === 'hi' ? 'उदा. STU-2026-001 या प्रवेश संख्या' : 'e.g. STU-2026-001 or admission no',
      passLabel: language === 'hi' ? 'पासवर्ड' : 'Password',
      passPlaceholder: language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password',
      cta: language === 'hi' ? 'छात्र / अभिभावक लॉगिन करें' : 'Sign In as Student / Parent',
      icon: GraduationCap
    }
  };

  const currentRoleConfig = roleConfig[selectedRole] || roleConfig.student;

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gradient-to-br from-slate-100 via-blue-50/40 to-amber-50/30 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950 font-sans relative">
      
      {/* Decorative colorful ambient background orbs */}
      <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-10 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -z-0 animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute top-1/2 right-10 w-48 sm:w-72 h-48 sm:h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Top Tricolor Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-xs relative z-30" />

      {/* 2. Compact & Elegant School Header */}
      <header className="bg-gradient-to-r from-gov-navy-950 via-slate-900 to-gov-navy-950 text-white border-b border-slate-800 shadow-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between gap-2.5 sm:gap-4">
          
          {/* School Brand and Badges */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center p-0.5 shadow-md shadow-amber-500/20 text-gov-navy-950 shrink-0 ring-2 ring-amber-400/40">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-gov-navy-950" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h1 className="text-xs sm:text-base font-black text-white truncate tracking-tight leading-tight">
                {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
              </h1>
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-slate-300 font-medium flex-wrap mt-0.5">
                <span className="text-slate-200 truncate max-w-[130px] sm:max-w-none">{settings.block || 'Shamsabad'}, {settings.district || 'Farrukhabad'}</span>
                <span className="text-slate-500 hidden xs:inline">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20 text-[9px] sm:text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  {language === 'hi' ? 'शासकीय पोर्टल' : 'Official Portal'}
                </span>
                <span className="hidden md:inline text-slate-500">•</span>
                <span className="hidden md:inline text-amber-300 font-mono text-[10px] bg-gov-navy-900/90 px-2 py-0.5 rounded-md border border-amber-400/30 font-semibold shadow-2xs">
                  UDISE: {settings.schoolCode}
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Subtle Home Button & Mobile UDISE */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden xs:inline-block md:hidden text-[9px] sm:text-[10px] font-mono text-amber-300 bg-gov-navy-900 px-1.5 sm:px-2 py-1 rounded-md border border-amber-400/30 font-bold">
              UDISE: {settings.schoolCode}
            </span>

            {handleGoHome && (
              <button
                onClick={handleGoHome}
                className="min-h-[38px] sm:min-h-[40px] text-xs font-bold text-slate-100 hover:text-white bg-gov-navy-900/90 hover:bg-gov-navy-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-gov-navy-700/90 hover:border-amber-400/50 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer touch-manipulation group"
                title={language === 'hi' ? 'मुख्य वेबसाइट पर जाएं' : 'Back to Home'}
              >
                <Home className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 3. Main Login Card Section (Centered, max-w-[540px]) */}
      <main className="flex-1 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 md:py-10 relative z-10 w-full">
        <div className="w-full max-w-[540px] mx-auto bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-950/10 overflow-hidden transition-all relative">
          
          {/* Card Top Colorful Accent Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600" />

          {/* Card Top Title & Subtitle */}
          <div className="px-4 sm:px-8 pt-5 sm:pt-6 pb-4 sm:pb-5 text-center border-b border-slate-100/90 bg-gradient-to-b from-blue-50/40 via-amber-50/20 to-white">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-100/80 via-orange-100/60 to-amber-100/80 border border-amber-300/80 text-amber-950 text-[11px] sm:text-xs font-black mb-2 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="truncate">{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद' : 'Basic Education Dept, UP'}</span>
              <Sparkles className="w-3 h-3 text-amber-600 shrink-0" />
            </div>
            
            <h2 className="text-lg sm:text-2xl font-black text-gov-navy-950 tracking-tight">
              {language === 'hi' ? 'विद्यालय प्रबंधन पोर्टल' : 'School Management Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-sm mx-auto leading-relaxed">
              {language === 'hi'
                ? 'अपनी भूमिका चुनें और अधिकृत क्रेडेंशियल दर्ज करके प्रवेश करें।'
                : 'Select your role and enter authorized credentials to log in.'}
            </p>

            {/* 4. Role Selection (3 Equal-Width Tabs with optimized >=48px mobile touch targets) */}
            <div className="grid grid-cols-3 gap-1 sm:gap-1.5 p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/90 mt-3.5 sm:mt-4.5 shadow-inner">
              {/* Tab 1: Headmaster */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`min-h-[50px] sm:min-h-[54px] py-2 sm:py-2.5 px-1 sm:px-1.5 rounded-xl text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 touch-manipulation select-none ${
                  selectedRole === 'admin'
                    ? 'bg-gradient-to-br from-gov-navy-950 via-slate-900 to-indigo-950 text-white shadow-md shadow-slate-950/20 font-black ring-1 ring-amber-400/40 scale-[1.02]'
                    : 'bg-transparent hover:bg-white/80 active:bg-white/90 text-slate-700 font-bold border border-transparent'
                }`}
              >
                <div className={`p-1 rounded-lg shrink-0 ${selectedRole === 'admin' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'}`}>
                  <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <span className="truncate w-full text-[10px] sm:text-xs text-center leading-tight">
                  {language === 'hi' ? 'प्रधानाध्यापक' : 'Headmaster'}
                </span>
              </button>

              {/* Tab 2: Teacher / Staff */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('teacher')}
                className={`min-h-[50px] sm:min-h-[54px] py-2 sm:py-2.5 px-1 sm:px-1.5 rounded-xl text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 touch-manipulation select-none ${
                  selectedRole === 'teacher'
                    ? 'bg-gradient-to-br from-gov-navy-950 via-slate-900 to-indigo-950 text-white shadow-md shadow-slate-950/20 font-black ring-1 ring-amber-400/40 scale-[1.02]'
                    : 'bg-transparent hover:bg-white/80 active:bg-white/90 text-slate-700 font-bold border border-transparent'
                }`}
              >
                <div className={`p-1 rounded-lg shrink-0 ${selectedRole === 'teacher' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'}`}>
                  <Users className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <span className="truncate w-full text-[10px] sm:text-xs text-center leading-tight">
                  {language === 'hi' ? 'शिक्षक / स्टाफ' : 'Teacher / Staff'}
                </span>
              </button>

              {/* Tab 3: Student / Parent */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('student')}
                className={`min-h-[50px] sm:min-h-[54px] py-2 sm:py-2.5 px-1 sm:px-1.5 rounded-xl text-xs transition-all cursor-pointer flex flex-col items-center justify-center gap-1 touch-manipulation select-none ${
                  selectedRole === 'student'
                    ? 'bg-gradient-to-br from-gov-navy-950 via-slate-900 to-indigo-950 text-white shadow-md shadow-slate-950/20 font-black ring-1 ring-amber-400/40 scale-[1.02]'
                    : 'bg-transparent hover:bg-white/80 active:bg-white/90 text-slate-700 font-bold border border-transparent'
                }`}
              >
                <div className={`p-1 rounded-lg shrink-0 ${selectedRole === 'student' ? 'bg-amber-400/20 text-amber-300' : 'text-slate-500'}`}>
                  <GraduationCap className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <span className="truncate w-full text-[10px] sm:text-xs text-center leading-tight">
                  {language === 'hi' ? 'छात्र / अभिभावक' : 'Student / Parent'}
                </span>
              </button>
            </div>
          </div>

          {/* 5. Dynamic Login Form Area */}
          <div className="p-4 sm:p-8 space-y-4 sm:space-y-5">
            
            {/* Selected Role Header Indicator with Soft Gradient Backdrop */}
            <div className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-amber-50/40 rounded-xl border border-slate-200/80">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 text-gov-navy-950 flex items-center justify-center shadow-xs shrink-0">
                  <currentRoleConfig.icon className="w-4 h-4 text-gov-navy-950 font-black" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-gov-navy-950 leading-tight truncate">
                    {currentRoleConfig.title}
                  </h3>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-semibold block truncate">
                    {language === 'hi' ? 'सुरक्षित प्रमाणीकरण सत्र' : 'Secure Verification'}
                  </span>
                </div>
              </div>
              <span className="text-[9px] sm:text-[10px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-2xs shrink-0">
                {currentRoleConfig.badge}
              </span>
            </div>

            {/* Error Message Display */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2.5 shadow-2xs animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              
              {/* 6. Identifier Input */}
              <div className="space-y-1 sm:space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  {currentRoleConfig.idLabel}
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-600 transition-colors">
                    <Fingerprint className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentRoleConfig.idPlaceholder}
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl text-sm sm:text-base font-bold text-slate-900 transition-all outline-hidden touch-manipulation placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                    required
                  />
                </div>
              </div>

              {/* 6. Password Input + 7. Forgot Password Link */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800">
                    {currentRoleConfig.passLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(true);
                      setResetStep('request_otp');
                      setResetResult(null);
                      setResetError(null);
                      setResetInput(identifier);
                    }}
                    className="min-h-[32px] sm:min-h-[36px] text-xs font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer flex items-center gap-1 touch-manipulation group py-1"
                  >
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 group-hover:rotate-12 transition-transform" />
                    <span>{language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}</span>
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-amber-600 transition-colors">
                    <Lock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentRoleConfig.passPlaceholder}
                    className="w-full pl-10 pr-12 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[48px] bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 rounded-xl text-sm sm:text-base font-bold text-slate-900 transition-all outline-hidden touch-manipulation placeholder:text-slate-400 placeholder:font-normal shadow-2xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="min-h-[44px] min-w-[44px] absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-slate-400 hover:text-amber-600 transition-colors cursor-pointer touch-manipulation"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-4.5 sm:h-4.5" /> : <Eye className="w-4 h-4 sm:w-4.5 sm:h-4.5" />}
                  </button>
                </div>
              </div>

              {/* 8. Primary Login Button (Vibrant Orange & Gold Gradient CTA with 48px+ touch target) */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[48px] sm:min-h-[52px] py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 active:scale-[0.98] disabled:opacity-50 text-gov-navy-950 text-xs sm:text-sm font-black shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation border border-amber-300/40 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin relative z-10" />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gov-navy-950 font-black relative z-10 shrink-0" />
                      <span className="relative z-10 truncate">{currentRoleConfig.cta}</span>
                      <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-gov-navy-950 font-black group-hover:translate-x-1 transition-transform relative z-10 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 9. Registration Section (Subtle Secondary Section with gentle gradient and >=44px mobile touch target) */}
            <div className="pt-3.5 sm:pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-2.5 text-xs">
              <div className="text-slate-600 text-center sm:text-left font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                <span>{language === 'hi' ? 'नए छात्र / स्टाफ हैं?' : 'New student or staff?'}</span>
              </div>

              {onNavigateRegister && (
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-blue-50 to-amber-50 hover:from-blue-100 hover:to-amber-100 text-gov-navy-950 font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200/90 hover:border-amber-400/60 shadow-2xs touch-manipulation shrink-0"
                >
                  <span>{language === 'hi' ? 'ऑनलाइन पंजीकरण करें' : 'Register Online'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                </button>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* 10. Minimal Clean Footer / Trust Information */}
      <footer className="py-4 px-4 text-center space-y-1 text-xs text-slate-500 border-t border-slate-200/80 bg-white/70 backdrop-blur-xs relative z-10">
        <div className="font-bold text-slate-700">
          © 2026 {language === 'hi' ? 'विद्यालय प्रबंधन पोर्टल • उत्तर प्रदेश बेसिक शिक्षा परिषद' : 'School Management Portal • UP Basic Education'}
        </div>
        <div className="text-[11px] text-slate-500 font-medium">
          UDISE: <span className="font-mono text-amber-800 font-bold">{settings.schoolCode}</span> • {settings.schoolNameHi || settings.schoolName}, {settings.district || 'Farrukhabad'}
        </div>
      </footer>

      {/* 7. Forgot Password Modal (Clean, Pure 6-Digit OTP Flow) */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => {
          setResetModalOpen(false);
          setResetStep('request_otp');
          setResetError(null);
          setResetSuccessMsg(null);
          setResetOtpCode('');
          setResetSessionToken(null);
        }}
        title={language === 'hi' ? 'सुरक्षित पासवर्ड रीसेट' : 'Password Reset (OTP Verification)'}
      >
        <div className="space-y-4">
          
          {/* Step 1: Request OTP Form */}
          {resetStep === 'request_otp' && (
            <form onSubmit={handleSendResetEmail} className="space-y-4">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {language === 'hi'
                    ? 'अपना पंजीकृत ईमेल या यूजरनेम दर्ज करें। आपके ईमेल पर 6-अंकों का आधिकारिक पासवर्ड रीसेट सुरक्षा कोड (OTP) भेजा जाएगा।'
                    : 'Enter your registered email or username. A 6-digit password reset security code (OTP) will be sent to your email.'}
                </span>
              </div>

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-semibold">{resetError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'पंजीकृत ईमेल या यूजरनेम' : 'Registered Email or Username'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा. student@gmail.com या STU-2026-001' : 'e.g. user@gmail.com or STU-2026-001'}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white touch-manipulation"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center justify-center touch-manipulation"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? '6-अंकों का OTP कोड भेजें' : 'Send 6-Digit OTP'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verify 6-Digit OTP */}
          {resetStep === 'verify_otp' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    {language === 'hi' 
                      ? '6-अंकों का सत्यापन कोड ईमेल पर भेजा गया है।' 
                      : 'A 6-digit verification code has been sent to your email.'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {language === 'hi'
                    ? 'कृपया अपने ईमेल पर प्राप्त 6-अंकों का कोड नीचे दर्ज करें:'
                    : 'Please enter the 6-digit code received on your email below:'}
                </p>
              </div>

              <OtpInput
                length={6}
                value={resetOtpCode}
                onChange={(val) => setResetOtpCode(val)}
                onComplete={(code) => handleVerifyResetOtp(code)}
                onResend={handleResendOtp}
                expiresInSeconds={300}
                cooldownSeconds={45}
                isLoading={resetLoading}
                isResending={resetResending}
                errorMessage={resetError}
                successMessage={resetSuccessMsg}
                lang={language === 'hi' ? 'hi' : 'en'}
              />

              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setResetStep('request_otp');
                    setResetError(null);
                    setResetSuccessMsg(null);
                  }}
                  className="min-h-[44px] text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer touch-manipulation flex items-center justify-center"
                >
                  {language === 'hi' ? 'ईमेल बदलें' : 'Change Email'}
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyResetOtp()}
                  disabled={resetLoading || resetOtpCode.length !== 6}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'OTP सत्यापित करें' : 'Verify OTP'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Set New Password */}
          {resetStep === 'set_password' && (
            <form onSubmit={handleSaveNewPassword} className="space-y-3.5">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'hi'
                    ? 'OTP सफलतापूर्वक सत्यापित हो गया है! अब अपना नया सुरक्षित पासवर्ड बनाएं।'
                    : 'OTP verified successfully! Now set your new secure password.'}
                </span>
              </div>

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="font-semibold">{resetError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'नया पासवर्ड (न्यूनतम 6 अक्षर)' : 'New Password (min 6 chars)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={directShowPass ? 'text' : 'password'}
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'नया पासवर्ड दर्ज करें' : 'Enter new password'}
                    className="w-full px-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden touch-manipulation"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setDirectShowPass(!directShowPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 touch-manipulation cursor-pointer"
                  >
                    {directShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type={directShowPass ? 'text' : 'password'}
                  value={directConfirmPassword}
                  onChange={(e) => setDirectConfirmPassword(e.target.value)}
                  placeholder={language === 'hi' ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter password'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden touch-manipulation"
                  required
                  minLength={6}
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-xs cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पासवर्ड सुरक्षित करें' : 'Save New Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Success / Done */}
          {resetStep === 'done' && (
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-black text-slate-900">
                {language === 'hi' ? 'पासवर्ड सफलतापूर्वक बदल दिया गया है!' : 'Password Reset Successfully!'}
              </h3>
              <p className="text-xs text-slate-600">
                {language === 'hi'
                  ? 'आपका नया पासवर्ड सक्रिय हो गया है। आप अब सीधे अपने क्रेडेंशियल के साथ लॉगिन कर सकते हैं।'
                  : 'Your new password is now active. You can sign in immediately.'}
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setResetModalOpen(false);
                    setResetStep('request_otp');
                  }}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-gov-navy-950 hover:bg-gov-navy-900 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center justify-center touch-manipulation"
                >
                  {language === 'hi' ? 'लॉगिन फ़ॉर्म पर जाएं' : 'Proceed to Login'}
                </button>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
};
