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
  Sparkles
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
}

export const LoginPage: React.FC<LoginPageProps> = ({ 
  onSuccess, 
  onLoginSuccess, 
  onNavigateHome, 
  onBackToHome,
  onNavigateRegister
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

  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Forgot password modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetInput, setResetInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccessMsg(null);
    const res = await resetPassword(resetInput);
    if (res.success) {
      setResetSuccessMsg(res.message || (language === 'hi' ? 'पासवर्ड रीसेट लिंक पंजीकृत विवरण पर प्रेषित किया गया।' : 'Password recovery request sent.'));
    } else {
      setResetError(res.error || (language === 'hi' ? 'खाता नहीं मिला। कृपया सही विवरण दर्ज करें।' : 'Unable to find matching account.'));
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl w-full">
        
        {/* Main Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
          
          {/* Top Brand Header */}
          <div className="bg-gradient-to-br from-gov-navy-950 via-gov-navy-900 to-gov-navy-950 text-white p-6 sm:p-7 text-center relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
              {handleGoHome && (
                <button
                  onClick={handleGoHome}
                  className="text-xs font-semibold text-slate-300 hover:text-white transition-colors flex items-center gap-1 bg-gov-navy-900/80 hover:bg-gov-navy-800 px-3 py-1.5 rounded-xl border border-gov-navy-700/80 cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'होम' : 'Home'}</span>
                </button>
              )}
            </div>

            {/* School Logo & Title */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gov-amber-500 via-gov-amber-600 to-amber-700 p-1 shadow-lg shadow-gov-amber-500/20">
                <div className="w-full h-full bg-gov-navy-950 rounded-[14px] flex items-center justify-center text-gov-amber-400">
                  <School className="w-9 h-9" />
                </div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gov-amber-500/20 text-gov-amber-300 border border-gov-amber-500/30 text-[11px] font-bold mb-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद' : 'Basic Education Dept, UP'}</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                </h1>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-300 font-mono mt-1">
                  <span className="bg-gov-navy-900 px-2 py-0.5 rounded border border-gov-navy-700 text-gov-amber-300 font-bold">
                    UDISE: {settings.schoolCode}
                  </span>
                  <span>•</span>
                  <span>{settings.block || 'Shamsabad'}, {settings.district || 'Farrukhabad'}</span>
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
                        ? '8090538115'
                        : selectedRole === 'teacher'
                        ? 'e.g. TCH-2026-001 or email'
                        : 'e.g. STU-2026-0001 or ADM-2025-001'
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
                      setResetModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-gov-amber-700 hover:text-gov-amber-800 transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot Password?'}
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

      {/* Forgot Password Recovery Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title={language === 'hi' ? 'पासवर्ड पुनःप्राप्ति अनुरोध' : 'Account Password Recovery'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            {language === 'hi'
              ? 'अपना पंजीकृत यूजरनेम / लॉगिन आईडी अथवा ईमेल दर्ज करें।'
              : 'Enter your registered Username or Email address to initiate recovery.'}
          </p>

          {resetSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetSuccessMsg}</span>
            </div>
          )}

          {resetError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{resetError}</span>
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'यूजरनेम या पंजीकृत ईमेल' : 'Username or Registered Email'}
              </label>
              <input
                type="text"
                value={resetInput}
                onChange={(e) => setResetInput(e.target.value)}
                placeholder={language === 'hi' ? 'यूजरनेम दर्ज करें' : 'Enter Username or Email'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs cursor-pointer"
              >
                {language === 'hi' ? 'अनुरोध भेजें' : 'Send Request'}
              </button>
            </div>
          </form>
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
