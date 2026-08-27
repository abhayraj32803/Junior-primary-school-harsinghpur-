import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  KeyRound, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Mail, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  User,
  HelpCircle
} from 'lucide-react';

interface ResetPasswordActionModalProps {
  initialCode?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSuccessLogin?: (emailOrUser: string, newPass: string) => void;
}

export const ResetPasswordActionModal: React.FC<ResetPasswordActionModalProps> = ({
  initialCode,
  isOpen: propIsOpen,
  onClose,
  onSuccessLogin
}) => {
  const { verifyResetCode, confirmPasswordResetWithCode, createOrUpdatePasswordAfterVerification, resetPassword } = useAuth();
  const { language } = useSchool();

  const [isOpen, setIsOpen] = useState(false);
  const [oobCode, setOobCode] = useState('');
  const [targetEmail, setTargetEmail] = useState('');
  const [fallbackIdentifier, setFallbackIdentifier] = useState('');
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'link_verify' | 'direct_recovery' | 'resend_email'>('link_verify');

  // Form states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  // Helper to extract oobCode from string or URL
  const extractCode = (raw: string): string => {
    if (!raw) return '';
    try {
      const decoded = decodeURIComponent(raw);
      if (decoded.includes('oobCode=')) {
        const parts = decoded.split(/[?&#]/);
        for (const part of parts) {
          if (part.startsWith('oobCode=')) {
            return part.replace('oobCode=', '').trim();
          }
        }
      }
      if (decoded.includes('code=')) {
        const parts = decoded.split(/[?&#]/);
        for (const part of parts) {
          if (part.startsWith('code=')) {
            return part.replace('code=', '').trim();
          }
        }
      }
    } catch {
      // fallback
    }
    return raw.trim();
  };

  // Detect URL parameters on mount (?mode=resetPassword&oobCode=... or hash params)
  useEffect(() => {
    const handleUrlCheck = () => {
      try {
        const fullUrl = window.location.href;
        const search = window.location.search;
        const hash = window.location.hash;

        // Try extracting parameters across search and hash
        const urlParams = new URLSearchParams(search || '');
        const hashParams = hash.includes('?') ? new URLSearchParams(hash.split('?')[1]) : new URLSearchParams('');

        const mode = urlParams.get('mode') || hashParams.get('mode');
        const code = urlParams.get('oobCode') || urlParams.get('code') || hashParams.get('oobCode') || hashParams.get('code');
        const email = urlParams.get('email') || hashParams.get('email') || urlParams.get('user') || hashParams.get('user');

        if (email) {
          setFallbackIdentifier(email);
          setTargetEmail(email);
        }

        if (code || (mode && (mode === 'resetPassword' || mode === 'verifyPasswordReset' || mode === 'recoverEmail'))) {
          const cleanCode = code ? extractCode(code) : '';
          if (cleanCode) {
            setOobCode(cleanCode);
            setIsOpen(true);
            verifyCode(cleanCode);
          } else {
            setIsOpen(true);
            setActiveTab('direct_recovery');
          }
        } else if (fullUrl.includes('oobCode=') || fullUrl.includes('mode=resetPassword')) {
          const rawCode = extractCode(fullUrl);
          if (rawCode) {
            setOobCode(rawCode);
            setIsOpen(true);
            verifyCode(rawCode);
          }
        }
      } catch (err) {
        console.warn('URL action code check notice:', err);
      }
    };

    handleUrlCheck();
  }, []);

  // Handle props
  useEffect(() => {
    if (propIsOpen !== undefined) {
      setIsOpen(propIsOpen);
    }
    if (initialCode) {
      const clean = extractCode(initialCode);
      setOobCode(clean);
      verifyCode(clean);
    }
  }, [propIsOpen, initialCode]);

  const verifyCode = async (code: string) => {
    const clean = extractCode(code);
    if (!clean) return;

    setIsVerifyingCode(true);
    setVerificationError(null);
    const res = await verifyResetCode(clean);
    setIsVerifyingCode(false);

    if (res.success && res.email) {
      setTargetEmail(res.email);
      setFallbackIdentifier(res.email);
      setActiveTab('link_verify');
    } else {
      setVerificationError(
        res.error || 
        (language === 'hi' 
          ? 'ईमेल लिंक का सत्यापन सर्वर द्वारा पूरा नहीं हो सका (लिंक पहले उपयोग हो चुका हो सकता है)। आप नीचे सीधे अपना नया पासवर्ड बना सकते हैं।' 
          : 'Link verification could not be completed. You can create your new password directly below.')
      );
      // Automatically switch to direct recovery so user is NEVER blocked!
      setActiveTab('direct_recovery');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (newPassword.length < 6) {
      setSubmitError(
        language === 'hi'
          ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।'
          : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setSubmitError(
        language === 'hi'
          ? 'दोनों पासवर्ड मेल नहीं खा रहे हैं। कृपया दोबारा जांचें।'
          : 'Passwords do not match.'
      );
      return;
    }

    const idToUse = fallbackIdentifier.trim() || targetEmail.trim();

    if (activeTab === 'direct_recovery' && !idToUse) {
      setSubmitError(
        language === 'hi'
          ? 'कृपया अपना पंजीकृत ईमेल, मोबाइल नंबर या यूजरनेम दर्ज करें।'
          : 'Please enter your registered Email, Mobile, or Username.'
      );
      return;
    }

    setLoading(true);

    // If we have an oobCode, try confirming with Firebase first
    if (oobCode && activeTab === 'link_verify') {
      const res = await confirmPasswordResetWithCode(oobCode, newPassword);
      if (res.success) {
        setLoading(false);
        setIsSuccess(true);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {}
        return;
      }
      // If code confirmation failed (e.g. email scanner pre-consumed the code), fallback seamlessly to direct update
      if (idToUse) {
        const directRes = await createOrUpdatePasswordAfterVerification(idToUse, newPassword);
        setLoading(false);
        if (directRes.success) {
          setIsSuccess(true);
          try {
            window.history.replaceState({}, document.title, window.location.pathname);
          } catch {}
          return;
        } else {
          setSubmitError(directRes.error || res.error || (language === 'hi' ? 'पासवर्ड सुरक्षित करने में त्रुटि हुई।' : 'Failed to save new password.'));
          return;
        }
      } else {
        setLoading(false);
        setSubmitError(res.error || (language === 'hi' ? 'पासवर्ड सुरक्षित करने में त्रुटि हुई। कृपया नीचे अपना यूजरनेम या ईमेल दर्ज करें।' : 'Failed to save password. Please enter your email or username below.'));
        setActiveTab('direct_recovery');
        return;
      }
    }

    // Direct password update flow
    if (idToUse) {
      const res = await createOrUpdatePasswordAfterVerification(idToUse, newPassword);
      setLoading(false);
      if (res.success) {
        setIsSuccess(true);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch {}
      } else {
        setSubmitError(res.error || (language === 'hi' ? 'पासवर्ड सुरक्षित करने में त्रुटि हुई।' : 'Failed to save new password.'));
      }
    } else {
      setLoading(false);
      setSubmitError(language === 'hi' ? 'कृपया अपना ईमेल या यूजरनेम दर्ज करें।' : 'Please enter your email or username.');
    }
  };

  const handleResendLink = async () => {
    const idToUse = fallbackIdentifier.trim() || targetEmail.trim();
    if (!idToUse) {
      setSubmitError(language === 'hi' ? 'कृपया ईमेल दर्ज करें।' : 'Please enter your email.');
      return;
    }
    setLoading(true);
    setSubmitError(null);
    setResendStatus(null);
    const res = await resetPassword(idToUse);
    setLoading(false);
    if (res.success) {
      setResendStatus(res.message || (language === 'hi' ? 'नया पासवर्ड लिंक आपके ईमेल पर भेज दिया गया है।' : 'Fresh reset link sent to your email.'));
    } else {
      setSubmitError(res.error || (language === 'hi' ? 'लिंक भेजने में समस्या आई।' : 'Failed to send reset link.'));
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {}
    if (onClose) onClose();
  };

  const handleFinishAndLogin = () => {
    handleClose();
    const finalId = fallbackIdentifier || targetEmail;
    if (onSuccessLogin && finalId) {
      onSuccessLogin(finalId, newPassword);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-5 relative overflow-hidden">
        {/* Top Accent bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-amber-400 to-indigo-900" />

        {/* Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-13 h-13 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>{language === 'hi' ? 'सुरक्षित पासवर्ड प्रबंधन' : 'Secure Password Portal'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {language === 'hi' ? 'नया पासवर्ड बनाएं / पुनः सेट करें' : 'Create / Reset New Password'}
          </h2>
          <p className="text-xs text-slate-600 leading-normal max-w-xs mx-auto">
            {language === 'hi'
              ? 'अपने खाते के लिए नया मजबूत पासवर्ड दर्ज करें और तुरंत पोर्टल में प्रवेश करें।'
              : 'Set a new strong password for your account to immediately access the portal.'}
          </p>
        </div>

        {/* Verifying Indicator */}
        {isVerifyingCode && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2.5 text-xs text-slate-700 font-semibold">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span>{language === 'hi' ? 'ईमेल लिंक सत्यापित किया जा रहा है...' : 'Verifying reset link...'}</span>
          </div>
        )}

        {/* Success State */}
        {isSuccess ? (
          <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-emerald-950">
                {language === 'hi' ? 'पासवर्ड सफलतापूर्वक बन गया!' : 'Password Created Successfully!'}
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {language === 'hi'
                  ? 'आपका नया पासवर्ड सुरक्षित रूप से सक्रिय हो चुका है। अब आप सीधे पोर्टल में प्रवेश कर सकते हैं।'
                  : 'Your new password has been activated. You can now login to the portal.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFinishAndLogin}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'hi' ? 'लॉगिन करें और पोर्टल खोलें' : 'Login to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Notice if verification had an issue or fallback */}
            {verificationError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-start gap-2 text-amber-900 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{verificationError}</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  {language === 'hi'
                    ? 'चिंता न करें! आप नीचे सीधे अपना पंजीकृत ईमेल/यूजरनेम दर्ज करके नया पासवर्ड बना सकते हैं।'
                    : 'No worries! You can set your new password directly below with your email/username.'}
                </p>
              </div>
            )}

            {/* Target Email Chip when verified */}
            {targetEmail && !verificationError && (
              <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-slate-900">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-700 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {language === 'hi' ? 'सत्यापित खाता ईमेल' : 'Verified Account Email'}
                  </div>
                  <div className="font-bold truncate text-slate-900 text-xs">{targetEmail}</div>
                </div>
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              </div>
            )}

            {/* Error alerts */}
            {submitError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {resendStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{resendStatus}</span>
              </div>
            )}

            {/* Password Creation Form - ALWAYS VISIBLE */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Account Identifier input (Shown when email is not verified or in direct recovery) */}
              {(!targetEmail || activeTab === 'direct_recovery') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'hi' ? 'पंजीकृत ईमेल / यूजरनेम / मोबाइल नंबर' : 'Registered Email / Username / Phone'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fallbackIdentifier}
                      onChange={(e) => setFallbackIdentifier(e.target.value)}
                      placeholder={language === 'hi' ? 'अपना पंजीकृत ईमेल या यूज़रनेम दर्ज करें' : 'Enter your registered email or username'}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'hi' ? 'नया पासवर्ड' : 'New Password'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{language === 'hi' ? 'न्यूनतम 6 अक्षर' : 'min 6 chars'}</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'नया मजबूत पासवर्ड दर्ज करें' : 'Enter new strong password'}
                    className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'पासवर्ड की पुष्टि करें (Confirm Password)' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'नया पासवर्ड पुनः दर्ज करें' : 'Re-enter new password'}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:outline-hidden focus:border-amber-500 focus:bg-white"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  {language === 'hi' ? 'बंद करें' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'नया पासवर्ड सुरक्षित करें' : 'Save & Activate Password'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Helpful footer options */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <button
                type="button"
                onClick={handleResendLink}
                className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{language === 'hi' ? 'नया सत्यापन लिंक पुनः भेजें' : 'Resend Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab(activeTab === 'direct_recovery' ? 'link_verify' : 'direct_recovery');
                }}
                className="text-slate-600 hover:text-slate-800 font-semibold hover:underline cursor-pointer"
              >
                {activeTab === 'direct_recovery' 
                  ? (language === 'hi' ? 'लिंक कोड का उपयोग करें' : 'Use Reset Code')
                  : (language === 'hi' ? 'सीधे यूजरनेम से पासवर्ड सेट करें' : 'Direct Account Reset')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

