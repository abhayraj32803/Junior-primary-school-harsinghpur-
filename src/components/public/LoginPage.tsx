import React, { useState } from 'react';
import { useAuth, GoogleAuthDetails } from '../../context/AuthContext';
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
  Building2,
  Fingerprint,
  Home,
  School,
  Sparkles,
  Mail,
  Send,
  KeyRound,
  ExternalLink,
  Key
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { UserAvatar } from '../common/UserAvatar';
import { GoogleAuthRoleModal } from '../common/GoogleAuthRoleModal';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrorUtils';

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
  const { login, loginWithGoogle, resetPassword, isAuthenticated, userProfile, logout } = useAuth();
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync role if initialRole prop changes
  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Direct Google Sign-In for Students (re-login or instant login)
  const handleDirectGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle();
      setGoogleLoading(false);

      if (res.success) {
        setGoogleModalOpen(false);
        handleSuccess();
      } else {
        setError(res.error ? getFriendlyAuthErrorMessage(res.error, language) : (language === 'hi' ? 'Google प्रमाणीकरण पूरा नहीं हो सका।' : 'Google authentication could not be completed.'));
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setError(getFriendlyAuthErrorMessage(err.code || err.message, language));
    }
  };

  // Google Sign-In Confirmation Handler from Modal (Optional custom registration)
  const handleConfirmGoogleAuth = async (details: GoogleAuthDetails) => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle(details);
      setGoogleLoading(false);

      if (res.success) {
        setGoogleModalOpen(false);
        handleSuccess();
      } else {
        setError(res.error ? getFriendlyAuthErrorMessage(res.error, language) : (language === 'hi' ? 'Google प्रमाणीकरण पूरा नहीं हो सका।' : 'Google authentication could not be completed.'));
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setError(getFriendlyAuthErrorMessage(err.code || err.message, language));
    }
  };

  // Password Recovery & Creation Modal State
  const { createOrUpdatePasswordAfterVerification, verifyResetCode, confirmPasswordResetWithCode } = useAuth();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTab, setResetTab] = useState<'email_link' | 'paste_link' | 'direct_set'>('email_link');
  const [resetInput, setResetInput] = useState('');
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

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetResult(null);
    setResetLoading(true);

    const res = await resetPassword(resetInput);
    setResetLoading(false);

    if (res.success) {
      setResetResult(res);
    } else {
      setResetError(res.error || (language === 'hi' ? 'खाता नहीं मिला। कृपया सही विवरण दर्ज करें।' : 'Unable to find matching account.'));
    }
  };

  const handleDirectPasswordCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetResult(null);

    if (!resetInput.trim()) {
      setResetError(language === 'hi' ? 'कृपया अपना यूजरनेम या ईमेल दर्ज करें।' : 'Please enter your Username or Email.');
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

    setResetLoading(true);
    const res = await createOrUpdatePasswordAfterVerification(resetInput.trim(), directPassword);
    setResetLoading(false);

    if (res.success) {
      setResetResult({
        success: true,
        message: res.message || (language === 'hi' ? 'नया पासवर्ड सफलतापूर्वक बन गया है!' : 'Password updated successfully!'),
        username: resetInput.trim()
      });
      // Pre-fill login input
      setIdentifier(resetInput.trim());
      setPassword(directPassword);
    } else {
      setResetError(res.error || (language === 'hi' ? 'पासवर्ड अपडेट करने में त्रुटि हुई।' : 'Failed to update password.'));
    }
  };

  // If user already has an active authenticated session
  if (isAuthenticated && userProfile) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
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

          <div className="p-6 space-y-3">
            <p className="text-xs text-slate-600 text-center">
              {language === 'hi'
                ? 'आप पहले से पोर्टल में लॉगिन हैं। क्या आप अपने ERP डैशबोर्ड में जाना चाहते हैं?'
                : 'You are currently signed in. Would you like to proceed to your ERP Dashboard?'}
            </p>

            <button
              onClick={handleSuccess}
              className="w-full py-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 text-gov-navy-950 text-xs sm:text-sm font-black shadow-lg shadow-gov-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{language === 'hi' ? 'ERP डैशबोर्ड में प्रवेश करें' : 'Proceed to ERP Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
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
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
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
    <div className="min-h-[85vh] w-full max-w-full overflow-x-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          
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
                  className="text-xs font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 bg-gov-navy-900/90 hover:bg-gov-navy-800 px-3 py-1.5 rounded-xl border border-gov-navy-700/80 cursor-pointer shadow-xs"
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
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Title */}
            <div className="text-center space-y-1">
              <h2 className="text-xl font-black text-gov-navy-950 tracking-tight">
                {language === 'hi' ? 'विद्यालय प्रबंधन ईआरपी लॉगिन' : 'School ERP Portal Login'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
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
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
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
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                  selectedRole === 'teacher'
                    ? 'bg-gov-navy-900 text-gov-amber-400 shadow-sm font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users className={`w-5 h-5 ${selectedRole === 'teacher' ? 'text-gov-amber-400' : 'text-slate-400'}`} />
                <span className="truncate w-full text-[11px] leading-tight">
                  {language === 'hi' ? 'शिक्षक / स्टॉफ' : 'Teacher / Staff'}
                </span>
              </button>

              {/* Role 3: Student */}
              <button
                type="button"
                onClick={() => handleSelectRoleTab('student')}
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
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

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 shadow-2xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-semibold">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identifier Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {selectedRole === 'admin'
                    ? (language === 'hi' ? 'प्रधानाध्यापक यूजरनेम / मोबाइल नं.' : 'Headmaster Username / Mobile')
                    : selectedRole === 'teacher'
                    ? (language === 'hi' ? 'शिक्षक लॉगिन आईडी (TCH-...) या ईमेल' : 'Teacher Login ID (e.g. TCH-2026-001) or Email')
                    : (language === 'hi' ? 'छात्र लॉगिन आईडी (STU-...) / प्रवेश क्रमांक' : 'Student ID (e.g. STU-2026-0001) or Admission No')}
                  <span className="text-rose-500"> *</span>
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
                        ? (language === 'hi' ? 'यूजरनेम / मोबाइल नं. दर्ज करें' : 'Enter Admin Username / Mobile')
                        : selectedRole === 'teacher'
                        ? (language === 'hi' ? 'शिक्षक आईडी या ईमेल दर्ज करें' : 'Enter Teacher ID or Email')
                        : (language === 'hi' ? 'छात्र आईडी / प्रवेश क्रमांक दर्ज करें' : 'Enter Student ID or Admission No')
                    }
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-gov-amber-500 focus:outline-hidden transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    {language === 'hi' ? 'सुरक्षा पासवर्ड (Password)' : 'Security Password'} <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetInput(identifier);
                      setResetResult(null);
                      setResetError(null);
                      setResetModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-gov-amber-700 hover:text-gov-amber-800 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3 text-gov-amber-600" />
                    <span>{language === 'hi' ? 'ईमेल से पासवर्ड बनाएं / भूल गए?' : 'Create / Reset Password'}</span>
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
                    className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-gov-amber-500 focus:outline-hidden transition-all shadow-inner"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs sm:text-sm font-black shadow-lg shadow-gov-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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

            {/* Google Authentication Divider & Button (Students Only) */}
            <div className="space-y-3 pt-1">
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full"></div>
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider relative">
                  {language === 'hi' ? 'अथवा Google से छात्र लॉगिन' : 'Or Student Google Sign-In'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleDirectGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold shadow-xs hover:shadow transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                )}
                <span>
                  {language === 'hi' ? 'Google से छात्र लॉगिन करें (केवल छात्र)' : 'Sign in with Google (Students Only)'}
                </span>
              </button>
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 text-center sm:text-left font-medium">
                {language === 'hi' ? 'नवीन छात्र प्रवेश या स्टॉफ पंजीकरण?' : 'New student or staff registration?'}
              </div>
              {onNavigateRegister && (
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-amber-900 text-slate-800 font-bold transition-all cursor-pointer flex items-center gap-1.5 border border-slate-200 shadow-2xs"
                >
                  <span>{language === 'hi' ? 'ऑनलाइन पंजीकरण करें' : 'Register Here'}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gov-amber-600" />
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Email Verification & Password Setup Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={language === 'hi' ? 'ईमेल सत्यापन द्वारा पासवर्ड निर्माण व रीसेट' : 'Create / Reset Password via Email Verification'}
      >
        <div className="space-y-4">
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setResetTab('email_link');
                setResetError(null);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                resetTab === 'email_link'
                  ? 'bg-white text-gov-navy-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-gov-amber-600" />
              <span>{language === 'hi' ? 'ईमेल लिंक भेजें' : 'Send Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setResetTab('paste_link');
                setResetError(null);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                resetTab === 'paste_link'
                  ? 'bg-white text-gov-navy-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-gov-amber-600" />
              <span>{language === 'hi' ? 'लिंक / कोड पेस्ट करें' : 'Paste Link / Code'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setResetTab('direct_set');
                setResetError(null);
              }}
              className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                resetTab === 'direct_set'
                  ? 'bg-white text-gov-navy-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-gov-amber-600" />
              <span>{language === 'hi' ? 'सीधा पासवर्ड' : 'Direct Set'}</span>
            </button>
          </div>

          {/* Success Result View */}
          {resetResult && (
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 text-emerald-900 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-xs">
                    {language === 'hi' ? 'सत्यापन संदेश' : 'Action Status'}
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {resetResult.message}
                  </p>
                </div>
              </div>

              {resetResult.maskedEmail && (
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">{language === 'hi' ? 'पंजीकृत ईमेल:' : 'Registered Email:'}</span>
                    <span className="font-mono font-bold text-emerald-950 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                      {resetResult.maskedEmail}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'Gmail इनबॉक्स खोलें' : 'Open Gmail'}</span>
                      <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setResetTab('paste_link');
                        setResetResult(null);
                      }}
                      className="py-2 px-3 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-600 text-gov-navy-950 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'ईमेल लिंक यहाँ पेस्ट करें' : 'Paste Email Link'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-gov-amber-600" />
                  <span>{language === 'hi' ? 'मार्गदर्शन:' : 'Guidance:'}</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  {language === 'hi'
                    ? 'यदि ईमेल लिंक पर क्लिक करने पर कोई समस्या आती है, तो ईमेल में आए लिंक को कॉपी करके "लिंक / कोड पेस्ट करें" टैब में पेस्ट कर सकते हैं अथवा "सीधा पासवर्ड" विकल्प से पासवर्ड बना सकते हैं।'
                    : 'If you encounter any issues clicking the email link, simply copy the link and paste it into the "Paste Link / Code" tab or use "Direct Set".'}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {resetError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </div>
          )}

          {/* Tab 1: Send Email Verification Link */}
          {resetTab === 'email_link' && (
            <form onSubmit={handleSendResetEmail} className="space-y-3.5">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'अपना पंजीकृत ईमेल, यूजरनेम, छात्र प्रवेश संख्या (Admission No.) अथवा मोबाइल नंबर दर्ज करें। आपके ईमेल पर पासवर्ड बनाने का आधिकारिक लिंक भेजा जाएगा।'
                  : 'Enter your registered Email, Username, Admission Number, or Mobile Number to receive the secure password creation link.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'ईमेल / यूजरनेम / प्रवेश संख्या / मोबाइल' : 'Email / Username / Admission No / Mobile'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={resetInput}
                    onChange={(e) => setResetInput(e.target.value)}
                    placeholder={language === 'hi' ? 'उदा. student@gmail.com या STU-2026-001 या 8090538115' : 'e.g. user@gmail.com or STU-2026-001'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'ईमेल पर सत्यापन लिंक भेजें' : 'Send Verification Email'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Paste Link / Action Code */}
          {resetTab === 'paste_link' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'यदि आपके ईमेल पर सत्यापन लिंक आया है, तो उस पूरे लिंक अथवा सत्यापन कोड (oobCode) को यहाँ पेस्ट करके सीधे पासवर्ड सेट करें।'
                  : 'Paste the complete reset link or action code from your email to authenticate and configure your new password.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'ईमेल से प्राप्त लिंक या सत्यापन कोड' : 'Email Reset Link or Code'}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={pasteLinkInput}
                    onChange={(e) => setPasteLinkInput(e.target.value)}
                    placeholder={language === 'hi' ? 'https://... या कोड यहाँ पेस्ट करें' : 'Paste full link or oobCode here'}
                    className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyPastedCode}
                    disabled={isVerifyingCode || !pasteLinkInput.trim()}
                    className="px-4 py-2.5 bg-gov-navy-900 hover:bg-gov-navy-950 disabled:opacity-50 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1"
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
                        className="w-full px-3.5 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setDirectShowPass(!directShowPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
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
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                      required
                      minLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-2.5 px-4 bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            </div>
          )}

          {/* Tab 2: Direct Password Setup */}
          {resetTab === 'direct_set' && (
            <form onSubmit={handleDirectPasswordCreate} className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'hi'
                  ? 'अपना यूजरनेम या ईमेल दर्ज करें और अपने खाते के लिए नया पासवर्ड सीधे बनाएं।'
                  : 'Enter your Username or Email and configure your new secure password directly.'}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'यूजरनेम या पंजीकृत ईमेल' : 'Username or Registered Email'}
                </label>
                <input
                  type="text"
                  value={resetInput}
                  onChange={(e) => setResetInput(e.target.value)}
                  placeholder={language === 'hi' ? 'यूजरनेम दर्ज करें' : 'Enter Username or Email'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'नया पासवर्ड (कम से कम 6 अक्षर)' : 'New Password (min 6 chars)'}
                </label>
                <div className="relative">
                  <input
                    type={directShowPass ? 'text' : 'password'}
                    value={directPassword}
                    onChange={(e) => setDirectPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'नया पासवर्ड दर्ज करें' : 'Enter new password'}
                    className="w-full px-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setDirectShowPass(!directShowPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {directShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'नया पासवर्ड पुनः दर्ज करें (Confirm Password)' : 'Confirm New Password'}
                </label>
                <input
                  type={directShowPass ? 'text' : 'password'}
                  value={directConfirmPassword}
                  onChange={(e) => setDirectConfirmPassword(e.target.value)}
                  placeholder={language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm password'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-gov-amber-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-5 py-2.5 rounded-xl bg-gov-amber-500 hover:bg-gov-amber-600 disabled:opacity-50 text-gov-navy-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {resetLoading ? (
                    <div className="w-4 h-4 border-2 border-gov-navy-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Key className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पासवर्ड सुरक्षित करें' : 'Save New Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* Google Auth Role Selection Modal */}
      <GoogleAuthRoleModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onConfirm={handleConfirmGoogleAuth}
        isLoading={googleLoading}
        language={language}
      />
    </div>
  );
};
