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
  Sparkles,
  Mail,
  Send,
  KeyRound,
  ExternalLink,
  Key,
  RefreshCw
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';

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
    resetPassword, 
    verifyResetOtpAndSetPassword,
    createOrUpdatePasswordAfterVerification, 
    verifyResetCode, 
    confirmPasswordResetWithCode, 
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

  // Password Recovery Modal State (via SMTP OTP)
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'request_otp' | 'verify_otp' | 'paste_link'>('request_otp');
  const [resetInput, setResetInput] = useState('');
  const [resetOtpCode, setResetOtpCode] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<{
    success: boolean;
    email?: string;
    maskedEmail?: string;
    username?: string;
    message?: string;
  } | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  // Paste link / Code verification states
  const [pasteLinkInput, setPasteLinkInput] = useState('');
  const [extractedCode, setExtractedCode] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);

  // Direct / Link Password set inputs
  const [directPassword, setDirectPassword] = useState('');
  const [directConfirmPassword, setDirectConfirmPassword] = useState('');
  const [directShowPass, setDirectShowPass] = useState(false);

  // Helper to extract oobCode from string or URL
  const parseActionCode = (raw: string): string => {
    if (!raw) return '';
    try {
      if (raw.includes('oobCode=')) {
        const urlParams = new URLSearchParams(raw.split('?')[1] || raw);
        return urlParams.get('oobCode') || raw.trim();
      }
    } catch {
      // fallback
    }
    return raw.trim();
  };

  const handleVerifyPastedCode = async () => {
    const code = parseActionCode(pasteLinkInput);
    if (!code) {
      setResetError(language === 'hi' ? 'कृपया ईमेल में प्राप्त लिंक या कोड दर्ज करें।' : 'Please paste the reset link or code.');
      return;
    }

    setResetError(null);
    setIsVerifyingCode(true);
    const res = await verifyResetCode(code);
    setIsVerifyingCode(false);

    if (res.success && res.email) {
      setExtractedCode(code);
      setVerifiedEmail(res.email);
    } else {
      setResetError(res.error || (language === 'hi' ? 'यह सत्यापन लिंक अमान्य है या समाप्त हो चुका है।' : 'Invalid or expired reset code.'));
    }
  };

  const handleConfirmPastedCodeReset = async (e: React.FormEvent) => {
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

    setResetLoading(true);
    const res = await confirmPasswordResetWithCode(extractedCode, directPassword);
    setResetLoading(false);

    if (res.success) {
      setResetResult({
        success: true,
        message: language === 'hi' ? 'नया पासवर्ड सफलतापूर्वक बन गया है! अब आप लॉगिन कर सकते हैं।' : 'New password saved successfully! You can now login.',
        email: verifiedEmail
      });
      setIdentifier(verifiedEmail || resetInput);
      setPassword(directPassword);
    } else {
      setResetError(res.error || (language === 'hi' ? 'पासवर्ड सुरक्षित करने में त्रुटि हुई।' : 'Failed to save new password.'));
    }
  };

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

  // Send 6-Digit Reset OTP via SMTP
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetResult(null);
    setResetLoading(true);

    const res = await resetPassword(resetInput);
    setResetLoading(false);

    if (res.success) {
      setResetResult(res);
      setResetStep('verify_otp');
    } else {
      setResetError(res.error || (language === 'hi' ? 'खाता नहीं मिला। कृपया सही विवरण दर्ज करें।' : 'Unable to find matching account.'));
    }
  };

  // Verify 6-Digit OTP and configure new password
  const handleVerifyOtpAndSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    const cleanOtp = resetOtpCode.trim();
    if (cleanOtp.length !== 6) {
      setResetError(language === 'hi' ? 'कृपया ईमेल पर प्राप्त 6-अंकों का OTP कोड दर्ज करें।' : 'Please enter the 6-digit OTP code received on email.');
      return;
    }

    if (directPassword.length < 6) {
      setResetError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    if (directPassword !== directConfirmPassword) {
      setResetError(language === 'hi' ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं।' : 'Passwords do not match.');
      return;
    }

    const emailOrUser = resetResult?.email || resetInput.trim();
    setResetLoading(true);
    const res = await verifyResetOtpAndSetPassword(emailOrUser, cleanOtp, directPassword);
    setResetLoading(false);

    if (res.success) {
      setResetResult({
        success: true,
        message: res.message || (language === 'hi' ? 'बधाई! आपका नया पासवर्ड सक्रिय हो गया है।' : 'Password updated successfully!'),
        email: resetResult?.email || resetInput.trim(),
        username: resetResult?.username || resetInput.trim()
      });
      // Pre-fill login credentials
      setIdentifier(resetResult?.username || resetResult?.email || resetInput.trim());
      setPassword(directPassword);
    } else {
      setResetError(res.error || (language === 'hi' ? 'OTP सत्यापन अथवा पासवर्ड अपडेट असफल रहा।' : 'Failed to verify OTP or update password.'));
    }
  };

  // If user already has an active authenticated session
  if (isAuthenticated && userProfile) {
    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gov-navy-950 via-slate-900 to-gov-navy-950 flex flex-col justify-center sm:py-8 sm:px-4 selection:bg-amber-500 selection:text-slate-950">
        <div className="w-full sm:max-w-md sm:mx-auto min-h-screen sm:min-h-0 bg-white sm:rounded-3xl border-0 sm:border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col justify-between sm:justify-start">
          <div className="bg-gradient-to-br from-gov-navy-950 via-gov-navy-900 to-gov-navy-950 text-white p-6 text-center">
            <div className="flex justify-center mb-3">
              <UserAvatar
                userProfile={userProfile}
                size="xl"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{language === 'hi' ? 'सक्रिय लॉगिन सत्र' : 'Active Session'}</span>
            </div>
            <h2 className="text-xl font-black text-white">{userProfile.name}</h2>
            <p className="text-xs text-gov-amber-300 font-semibold mt-0.5 capitalize">
              {userProfile.role === 'admin' 
                ? (language === 'hi' ? 'प्रधानाध्यापिका (Headmaster)' : 'Headmaster (Admin)')
                : userProfile.role === 'teacher'
                ? (language === 'hi' ? 'शिक्षक / स्टॉफ (Teacher)' : 'Faculty (Teacher)')
                : (language === 'hi' ? 'छात्र (Student)' : 'Student')}
            </p>
          </div>

          <div className="p-6 space-y-3 flex-1 flex flex-col justify-center">
            <p className="text-xs sm:text-sm text-slate-600 text-center">
              {language === 'hi'
                ? 'आप पहले से पोर्टल में लॉगिन हैं। क्या आप अपने ERP डैशबोर्ड में जाना चाहते हैं?'
                : 'You are currently signed in. Would you like to proceed to your ERP Dashboard?'}
            </p>

            <button
              onClick={handleSuccess}
              className="w-full py-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 text-gov-navy-950 text-xs sm:text-sm font-black shadow-lg shadow-gov-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer touch-manipulation"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'hi' ? 'ERP डैशबोर्ड में प्रवेश करें' : 'Proceed to ERP Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => logout()}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer touch-manipulation"
              >
                {language === 'hi' ? 'लॉगआउट करें' : 'Sign Out / Switch'}
              </button>

              {handleGoHome && (
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer flex items-center justify-center gap-1 touch-manipulation"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Public Home'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gov-navy-950 via-slate-900 to-gov-navy-950 flex flex-col justify-center sm:py-8 sm:px-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full sm:max-w-xl sm:mx-auto min-h-screen sm:min-h-0 flex flex-col justify-center">
        
        {/* Main Card */}
        <div className="bg-white sm:rounded-3xl border-0 sm:border border-slate-700/50 shadow-2xl overflow-hidden flex-1 sm:flex-initial flex flex-col justify-between sm:justify-start">
          
          {/* Top Brand Header */}
          <div className="bg-gradient-to-br from-gov-navy-950 via-gov-navy-900 to-gov-navy-950 text-white p-5 sm:p-7 text-center relative">
            {/* Top Navigation Row */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gov-navy-900 border border-gov-navy-800 text-[10px] text-gov-amber-300 font-mono font-bold">
                UDISE: {settings.schoolCode}
              </div>

              {handleGoHome && (
                <button
                  onClick={handleGoHome}
                  className="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 bg-gov-navy-900/90 hover:bg-gov-navy-800 px-3 py-1.5 rounded-xl border border-gov-navy-700/80 cursor-pointer shadow-xs touch-manipulation"
                >
                  <Home className="w-3.5 h-3.5 text-gov-amber-400" />
                  <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                </button>
              )}
            </div>

            {/* School Logo & Title */}
            <div className="flex flex-col items-center space-y-2.5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-gov-amber-500 via-gov-amber-600 to-amber-700 p-1 shadow-lg shadow-gov-amber-500/20">
                <div className="w-full h-full bg-gov-navy-950 rounded-[14px] flex items-center justify-center text-gov-amber-400">
                  <School className="w-8 h-8 sm:w-9 sm:h-9" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gov-amber-500/20 text-gov-amber-300 border border-gov-amber-500/30 text-[10px] sm:text-[11px] font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद' : 'Basic Education Dept, UP'}</span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight">
                  {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                </h1>
                <div className="flex items-center justify-center gap-2 text-[11px] sm:text-xs text-slate-300 font-medium mt-1 flex-wrap">
                  <span>{settings.block || 'Shamsabad'}, {settings.district || 'Farrukhabad'}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{language === 'hi' ? 'शासकीय पोर्टल' : 'Official Portal'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-5 sm:p-8 space-y-5 sm:space-y-6 flex-1 flex flex-col justify-between sm:justify-start">
            
            {/* Header Title */}
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-black text-gov-navy-950 tracking-tight">
                {language === 'hi' ? 'विद्यालय प्रबंधन ईआरपी लॉगिन' : 'School ERP Portal Login'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                {language === 'hi' 
                  ? 'अपना पद/भूमिका चुनें और अधिकृत क्रेडेंशियल दर्ज करके प्रवेश करें।' 
                  : 'Select your role and enter your verified credentials to access your dashboard.'}
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              {/* Role 1: Headmaster / Admin */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 touch-manipulation ${
                  selectedRole === 'admin'
                    ? 'bg-gov-navy-900 text-gov-amber-400 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-gov-amber-400' : 'text-slate-400'}`} />
                <span className="truncate w-full text-[11px] leading-tight">
                  {language === 'hi' ? 'प्रधानाध्यापक' : 'Headmaster'}
                </span>
              </button>

              {/* Role 2: Teacher */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('teacher')}
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 touch-manipulation ${
                  selectedRole === 'teacher'
                    ? 'bg-gov-navy-900 text-gov-amber-400 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users className={`w-5 h-5 ${selectedRole === 'teacher' ? 'text-gov-amber-400' : 'text-slate-400'}`} />
                <span className="truncate w-full text-[11px] leading-tight">
                  {language === 'hi' ? 'शिक्षक / स्टॉफ' : 'Faculty'}
                </span>
              </button>

              {/* Role 3: Student */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('student')}
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 touch-manipulation ${
                  selectedRole === 'student'
                    ? 'bg-gov-navy-900 text-gov-amber-400 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <GraduationCap className={`w-5 h-5 ${selectedRole === 'student' ? 'text-gov-amber-400' : 'text-slate-400'}`} />
                <span className="truncate w-full text-[11px] leading-tight">
                  {language === 'hi' ? 'छात्र / अभिभावक' : 'Student / Parent'}
                </span>
              </button>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identifier input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {selectedRole === 'admin' 
                    ? (language === 'hi' ? 'प्रधानाध्यापक मोबाइल / यूजरनेम' : 'Headmaster Mobile / Username')
                    : selectedRole === 'teacher'
                    ? (language === 'hi' ? 'शिक्षक यूजरनेम / ईमेल / मोबाइल' : 'Teacher ID / Email / Mobile')
                    : (language === 'hi' ? 'छात्र आईडी / प्रवेश संख्या / ईमेल / मोबाइल' : 'Student ID / Admission No / Email / Mobile')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Fingerprint className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === 'admin'
                        ? (language === 'hi' ? 'उदा. 8090538115 या admin' : 'e.g. 8090538115')
                        : selectedRole === 'teacher'
                        ? (language === 'hi' ? 'उदा. TCH-2026-001 या 9415000000' : 'e.g. TCH-2026-001')
                        : (language === 'hi' ? 'उदा. STU-2026-001 या 1001 या ईमेल' : 'e.g. STU-2026-001 or email')
                    }
                    className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs font-bold text-slate-900 focus:bg-white focus:border-gov-amber-500 focus:outline-hidden transition-all shadow-inner touch-manipulation"
                    required
                  />
                </div>
              </div>

              {/* Password input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    {language === 'hi' ? 'गोपनीय पासवर्ड (Password)' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetModalOpen(true);
                      setResetStep('request_otp');
                      setResetResult(null);
                      setResetError(null);
                    }}
                    className="text-[11px] font-bold text-gov-amber-700 hover:text-gov-amber-800 hover:underline cursor-pointer flex items-center gap-1 touch-manipulation"
                  >
                    <KeyRound className="w-3 h-3 text-gov-amber-600" />
                    <span>{language === 'hi' ? 'पासवर्ड भूल गए? (SMTP OTP)' : 'Forgot Password?'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={
                      selectedRole === 'admin'
                        ? (language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter Admin password')
                        : (language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter your password')
                    }
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs font-bold text-slate-900 focus:bg-white focus:border-gov-amber-500 focus:outline-hidden transition-all shadow-inner touch-manipulation"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer touch-manipulation"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs sm:text-sm font-black shadow-lg shadow-gov-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 touch-manipulation"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>
                      {selectedRole === 'admin'
                        ? (language === 'hi' ? 'प्रधानाध्यापक के रूप में लॉगिन करें' : 'Sign In as Headmaster')
                        : selectedRole === 'teacher'
                        ? (language === 'hi' ? 'शिक्षक के रूप में लॉगिन करें' : 'Sign In as Teacher')
                        : (language === 'hi' ? 'छात्र / अभिभावक लॉगिन करें' : 'Sign In as Student / Parent')}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-center sm:text-left font-medium">
                {language === 'hi' ? 'नवीन छात्र प्रवेश या स्टॉफ पंजीकरण?' : 'New student or staff registration?'}
              </div>
              {onNavigateRegister && (
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-amber-900 text-slate-800 font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-2xs touch-manipulation"
                >
                  <span>{language === 'hi' ? 'ऑनलाइन पंजीकरण करें' : 'Register Here'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gov-amber-600" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* SMTP OTP Password Recovery Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={language === 'hi' ? 'सुरक्षित पासवर्ड रीसेट (SMTP ईमेल OTP)' : 'Password Reset (SMTP Email OTP)'}
      >
        <div className="space-y-4">
          
          {/* Step 1: Request OTP Form */}
          {resetStep === 'request_otp' && (
            <form onSubmit={handleSendResetEmail} className="space-y-3.5">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Mail className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  {language === 'hi'
                    ? 'अपना पंजीकृत ईमेल, यूजरनेम, प्रवेश संख्या अथवा मोबाइल दर्ज करें। आपके ईमेल पर 6-अंकों का आधिकारिक पासवर्ड रीसेट OTP कोड भेजा जाएगा।'
                    : 'Enter your registered email, username, or mobile. A 6-digit password reset OTP will be sent directly to your registered email via SMTP.'}
                </span>
              </div>

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'ईमेल / यूजरनेम / प्रवेश संख्या / मोबाइल' : 'Email / Username / Roll No / Mobile'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा. student@gmail.com या STU-2026-001' : 'e.g. user@gmail.com or STU-2026-001'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500 touch-manipulation"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetStep('paste_link')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer touch-manipulation"
                >
                  {language === 'hi' ? 'लिंक/कोड से रीसेट करें' : 'Have a link/code?'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 touch-manipulation"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'ईमेल पर 6-अंकों का OTP भेजें' : 'Send 6-Digit Reset OTP'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP and Configure New Password */}
          {resetStep === 'verify_otp' && (
            <div className="space-y-4">
              {resetResult && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{resetResult.message}</span>
                  </div>
                  {resetResult.maskedEmail && (
                    <div className="text-[11px] text-slate-600 flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
                      <span>{language === 'hi' ? 'ईमेल पता:' : 'Email address:'}</span>
                      <span className="font-mono font-bold text-slate-900">{resetResult.maskedEmail}</span>
                    </div>
                  )}
                </div>
              )}

              {resetError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpAndSavePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'ईमेल पर प्राप्त 6-अंकों का OTP कोड' : '6-Digit Reset OTP from Email'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={resetOtpCode}
                    onChange={(e) => setResetOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-xl sm:text-2xl font-black tracking-widest text-gov-navy-950 focus:bg-white focus:border-gov-amber-500 focus:outline-hidden touch-manipulation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'नया पासवर्ड' : 'New Password'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={directShowPass ? 'text' : 'password'}
                      value={directPassword}
                      onChange={(e) => setDirectPassword(e.target.value)}
                      placeholder={language === 'hi' ? 'नया पासवर्ड (न्यूनतम 6 अक्षर)' : 'New password (min 6 chars)'}
                      className="w-full px-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:bg-white focus:border-gov-amber-500 focus:outline-hidden touch-manipulation"
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={directShowPass ? 'text' : 'password'}
                    value={directConfirmPassword}
                    onChange={(e) => setDirectConfirmPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter password'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:bg-white focus:border-gov-amber-500 focus:outline-hidden touch-manipulation"
                    required
                    minLength={6}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request_otp');
                      setResetError(null);
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer touch-manipulation"
                  >
                    {language === 'hi' ? 'पुनः कोड भेजें' : 'Resend Code'}
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="px-5 py-2.5 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 touch-manipulation"
                  >
                    {resetLoading ? (
                      <div className="w-4 h-4 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'OTP सत्यापित करें और पासवर्ड सेव करें' : 'Verify & Set Password'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: Paste Link / Action Code */}
          {resetStep === 'paste_link' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'यदि आपके ईमेल पर सत्यापन लिंक आया है, तो उस लिंक अथवा कोड को यहाँ पेस्ट करके सीधे पासवर्ड सेट करें।'
                  : 'Paste the complete reset link or action code from your email to set a new password.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'ईमेल लिंक या सत्यापन कोड' : 'Email Reset Link or Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteLinkInput}
                    onChange={(e) => setPasteLinkInput(e.target.value)}
                    placeholder={language === 'hi' ? 'https://... या कोड यहाँ पेस्ट करें' : 'Paste full link or code'}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500 touch-manipulation"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPastedCode}
                    disabled={isVerifyingCode || !pasteLinkInput.trim()}
                    className="px-4 py-2.5 bg-gov-navy-900 hover:bg-gov-navy-950 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1 touch-manipulation"
                  >
                    {isVerifyingCode ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>{language === 'hi' ? 'जाँचें' : 'Verify'}</span>
                    )}
                  </button>
                </div>
              </div>

              {verifiedEmail && (
                <form onSubmit={handleConfirmPastedCodeReset} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-gov-navy-950">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'hi' ? 'सत्यापित ईमेल:' : 'Verified Account:'}</span>
                    <span className="font-mono text-gov-navy-900 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                      {verifiedEmail}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'नया पासवर्ड' : 'New Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={directShowPass ? 'text' : 'password'}
                        value={directPassword}
                        onChange={(e) => setDirectPassword(e.target.value)}
                        placeholder={language === 'hi' ? 'नया मजबूत पासवर्ड दर्ज करें' : 'Enter new password'}
                        className="w-full px-3.5 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500 touch-manipulation"
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

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                    </label>
                    <input
                      type={directShowPass ? 'text' : 'password'}
                      value={directConfirmPassword}
                      onChange={(e) => setDirectConfirmPassword(e.target.value)}
                      placeholder={language === 'hi' ? 'पासवर्ड दोबारा दर्ज करें' : 'Re-enter password'}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-[16px] sm:text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500 touch-manipulation"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 px-4 bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
                  >
                    {resetLoading ? (
                      <div className="w-4 h-4 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'नया पासवर्ड सुरक्षित करें' : 'Save New Password'}</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  onClick={() => setResetStep('request_otp')}
                  className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  {language === 'hi' ? 'वापस OTP अनुरोध पर जाएं' : 'Back to OTP Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          )}

        </div>
      </Modal>
    </div>
  );
};
