import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { getFriendlyAuthErrorMessage } from '../../utils/authErrorUtils';
import { 
  GraduationCap, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight,
  School,
  Building2,
  Clock,
  FileCheck2,
  ShieldAlert,
  Send,
  Sparkles,
  Mail,
  RefreshCw,
  KeyRound,
  Copy,
  Check
} from 'lucide-react';
import { 
  sendStudentEmailVerificationCode, 
  verifyStudentEmailCode 
} from '../../services/verificationCodeService';

interface RegisterPageProps {
  onSuccess?: () => void;
  onNavigateLogin?: () => void;
  onNavigateHome?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateLogin,
  onNavigateHome
}) => {
  const { 
    registerStudentWithAuth, 
    sendStudentVerificationEmail, 
    sendStudentVerificationCode,
    verifyStudentVerificationCode,
    checkAndReloadEmailVerification,
    submitStudentRegistration, 
    submitTeacherRegistration
  } = useAuth();
  const { classes, settings, language } = useSchool();

  // Mode: 'student' or 'teacher' (Head Teacher registration is blocked by rule)
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registeredStudentProfile, setRegisteredStudentProfile] = useState<any | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  // 6-Digit Code Verification State for Student Post-Registration
  const [verificationDigits, setVerificationDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [activeOtpCode, setActiveOtpCode] = useState<string | null>(null);
  const [otpExpiresInSec, setOtpExpiresInSec] = useState<number>(600);
  const [otpCooldownSec, setOtpCooldownSec] = useState<number>(60);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const otpInputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredUsername, setPreferredUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Student specific fields
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [classNumber, setClassNumber] = useState<number>(5);
  const [sectionName, setSectionName] = useState('A');
  const [rollNumber, setRollNumber] = useState('1');
  const [fatherName, setFatherName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2015-05-15');
  const [category, setCategory] = useState<string>('General');

  // Teacher specific fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('Assistant Teacher (Primary)');
  const [subject, setSubject] = useState('Hindi & Mathematics');
  const [qualification, setQualification] = useState('B.Ed, Graduation (TET Qualified)');
  const [specialization, setSpecialization] = useState('Elementary Education');

  // Auto-generate suggested username as user types
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!preferredUsername || preferredUsername.startsWith('STU-') || preferredUsername.startsWith('TCH-')) {
      const prefix = activeTab === 'student' ? 'STU-2026' : 'TCH-2026';
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setPreferredUsername(`${prefix}-${randomSuffix}`);
    }
  };

  const handleTabChange = (tab: 'student' | 'teacher') => {
    setActiveTab(tab);
    setError(null);
    const prefix = tab === 'student' ? 'STU-2026' : 'TCH-2026';
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setPreferredUsername(`${prefix}-${randomSuffix}`);
  };

  // Expiry countdown effect for OTP
  React.useEffect(() => {
    if (!registeredStudentProfile || verificationSuccess || otpExpiresInSec <= 0) return;
    const timer = setInterval(() => {
      setOtpExpiresInSec(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [registeredStudentProfile, verificationSuccess, otpExpiresInSec]);

  // Cooldown countdown effect for Resend
  React.useEffect(() => {
    if (otpCooldownSec <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldownSec(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldownSec]);

  const formatOtpTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendOtpCode = async () => {
    if (!registeredStudentProfile?.email) return;
    setResendingEmail(true);
    setVerificationError(null);
    setResendStatusMsg(null);

    const res = await sendStudentEmailVerificationCode(registeredStudentProfile.email, {
      studentName: registeredStudentProfile.fullName,
      studentId: registeredStudentProfile.username,
      uid: registeredStudentProfile.uid
    });

    setResendingEmail(false);
    if (res.success) {
      if (res.code) setActiveOtpCode(res.code);
      setOtpExpiresInSec(600);
      setOtpCooldownSec(60);
      setResendStatusMsg(res.message || 'सत्यापन कोड ईमेल पर पुनः भेज दिया गया है।');
    } else {
      setVerificationError(res.error || 'कोड भेजने में विफल रहा।');
    }
  };

  const handleOtpDigitChange = (idx: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (clean.length >= 6) {
      const slice6 = clean.slice(0, 6).split('');
      setVerificationDigits(slice6);
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
      triggerVerifyStudentOtp(slice6.join(''));
      return;
    }

    const digit = clean.slice(-1);
    const updated = [...verificationDigits];
    updated[idx] = digit;
    setVerificationDigits(updated);
    setVerificationError(null);

    if (digit && idx < 5) {
      otpInputRefs.current[idx + 1]?.focus();
    }

    if (digit && idx === 5) {
      const full = updated.join('');
      if (full.length === 6) {
        triggerVerifyStudentOtp(full);
      }
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationDigits[idx] && idx > 0) {
      otpInputRefs.current[idx - 1]?.focus();
    }
  };

  const triggerVerifyStudentOtp = async (codeStr: string) => {
    if (!registeredStudentProfile?.email || codeStr.length !== 6) {
      setVerificationError('कृपया सभी 6 अंक दर्ज करें।');
      return;
    }

    setVerifyingCode(true);
    setVerificationError(null);

    const res = await verifyStudentEmailCode(registeredStudentProfile.email, codeStr, {
      uid: registeredStudentProfile.uid,
      onSuccessCallback: async () => {
        if (checkAndReloadEmailVerification) {
          await checkAndReloadEmailVerification();
        }
      }
    });

    setVerifyingCode(false);

    if (res.success) {
      setVerificationSuccess(true);
      setRegisteredStudentProfile({ ...registeredStudentProfile, emailVerified: true });
      setResendStatusMsg(res.message || 'छात्र खाता एवं ईमेल सफलतापूर्वक सत्यापित हो गया!');
    } else {
      setVerificationError(res.error || 'गलत सत्यापन कोड!');
    }
  };

  const handleCopyAndAutoFillOtp = () => {
    if (activeOtpCode) {
      navigator.clipboard.writeText(activeOtpCode);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
      const chars = activeOtpCode.split('');
      setVerificationDigits(chars);
      if (otpInputRefs.current[5]) otpInputRefs.current[5].focus();
      triggerVerifyStudentOtp(activeOtpCode);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full official name (कृपया अपना पूरा नाम दर्ज करें).');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters (पासवर्ड न्यूनतम 6 अक्षरों का होना चाहिए).');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);

    if (activeTab === 'student') {
      if (!admissionNumber.trim()) {
        setError('Admission Number is required for Student verification.');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setError('Valid Email address is required for Student Authentication and Verification.');
        setLoading(false);
        return;
      }

      // Direct Firebase Auth + Firestore Registration
      const res = await registerStudentWithAuth({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        admissionNumber: admissionNumber.trim(),
        classNumber,
        sectionName,
        rollNumber,
        phone: phone.trim(),
        dateOfBirth,
        fatherName: fatherName.trim(),
        guardianName: guardianName.trim(),
        category,
        preferredUsername: preferredUsername.trim().toUpperCase()
      });

      setLoading(false);
      if (res.success && res.profile) {
        setRegisteredStudentProfile(res.profile);
        // Automatically dispatch 6-digit OTP code to student's email
        sendStudentEmailVerificationCode(res.profile.email, {
          studentName: res.profile.fullName,
          studentId: res.profile.username,
          uid: res.profile.uid
        }).then(otpRes => {
          if (otpRes.success && otpRes.code) {
            setActiveOtpCode(otpRes.code);
          }
        });
        setOtpExpiresInSec(600);
        setOtpCooldownSec(60);
      } else {
        setError(res.error || 'Failed to complete student registration.');
      }
    } else {
      if (!employeeId.trim()) {
        setError('Teacher / Staff Employee ID is required.');
        setLoading(false);
        return;
      }
      if (!email.trim()) {
        setError('Valid official or personal email address is required.');
        setLoading(false);
        return;
      }
      const res = await submitTeacherRegistration({
        fullName: fullName.trim(),
        employeeId: employeeId.trim(),
        designation,
        subject,
        qualification,
        specialization,
        phone: phone.trim(),
        email: email.trim(),
        preferredUsername: preferredUsername.trim().toUpperCase(),
        password
      });
      setLoading(false);
      if (res.success && res.request) {
        setSubmittedRequest(res.request);
      } else {
        setError(res.error || 'Failed to submit teacher account request.');
      }
    }
  };

  // If student is successfully registered with Firebase Auth & Verification Email / Code
  if (registeredStudentProfile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6 text-center animate-fade-in">
          
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
            {verificationSuccess || registeredStudentProfile.emailVerified ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
            ) : (
              <KeyRound className="w-8 h-8 animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border ${
              verificationSuccess || registeredStudentProfile.emailVerified 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              {verificationSuccess || registeredStudentProfile.emailVerified ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>छात्र खाता एवं ईमेल 100% सत्यापित</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  <span>ईमेल सत्यापन कोड (6-Digit OTP Verification)</span>
                </>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {verificationSuccess || registeredStudentProfile.emailVerified 
                ? 'Verification Successful!'
                : 'Enter Verification Code'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              {verificationSuccess || registeredStudentProfile.emailVerified ? (
                <span>
                  बधाई हो! <strong>{registeredStudentProfile.fullName}</strong> का छात्र ईमेल एवं आधिकारिक खाता सफलतापूर्वक सत्यापित हो चुका है।
                </span>
              ) : (
                <span>
                  हमने <strong>{registeredStudentProfile.email}</strong> पर 6-अंकों का सत्यापन कोड भेजा है। सत्यापन के लिए नीचे कोड दर्ज करें:
                </span>
              )}
            </p>
          </div>

          {resendStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendStatusMsg}</span>
            </div>
          )}

          {/* OTP Code Form if not yet verified */}
          {!verificationSuccess && !registeredStudentProfile.emailVerified && (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 text-center">
              <label className="text-xs font-bold text-slate-700 block">
                ईमेल पर प्राप्त 6-अंकों का कोड दर्ज करें (Enter 6-Digit OTP)
              </label>

              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {verificationDigits.map((d, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    disabled={verifyingCode}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-mono font-black rounded-xl border-2 transition-all shadow-xs focus:outline-hidden ${
                      verificationError
                        ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600'
                        : d
                        ? 'border-blue-600 bg-blue-50/30 text-blue-950 shadow-sm'
                        : 'border-slate-300 bg-white text-slate-900 focus:border-blue-500'
                    }`}
                    placeholder="•"
                  />
                ))}
              </div>

              {verificationError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{verificationError}</span>
                </div>
              )}

              {/* Timer & Resend */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>वैधता: <strong className="font-mono text-slate-800">{formatOtpTime(otpExpiresInSec)}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={handleResendOtpCode}
                  disabled={resendingEmail || otpCooldownSec > 0}
                  className={`font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                    otpCooldownSec > 0 || resendingEmail
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-blue-600 hover:text-blue-800 underline'
                  }`}
                >
                  <RefreshCw className={`w-3 h-3 ${resendingEmail ? 'animate-spin' : ''}`} />
                  <span>
                    {resendingEmail
                      ? 'भेज रहे हैं...'
                      : otpCooldownSec > 0
                      ? `कोड पुनः भेजें (${otpCooldownSec}s)`
                      : 'कोड पुनः भेजें (Resend)'}
                  </span>
                </button>
              </div>

              {/* Verify Action Button */}
              <button
                type="button"
                onClick={() => triggerVerifyStudentOtp(verificationDigits.join(''))}
                disabled={verifyingCode || verificationDigits.join('').length !== 6}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  verifyingCode || verificationDigits.join('').length !== 6
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {verifyingCode ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>सत्यापित किया जा रहा है...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>सत्यापन कोड की पुष्टि करें (Verify Code)</span>
                  </>
                )}
              </button>

              {/* Simulated Delivery Code Auto-Fill Test Assistant */}
              {activeOtpCode && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-left space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      ईमेल कोड प्रेषण सहायक (OTP Preview):
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyAndAutoFillOtp}
                      className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedOtp ? 'भरा गया' : 'स्वतः भरें (Auto-Fill)'}
                    </button>
                  </div>
                  <div className="font-mono font-black text-slate-900 text-sm tracking-widest bg-white p-1.5 rounded border border-amber-200 text-center">
                    {activeOtpCode}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Student Account Summary Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Firebase UID:</span>
              <span className="font-mono font-bold text-slate-900">{registeredStudentProfile.uid}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Student ID / Login:</span>
              <span className="font-mono font-bold text-blue-700">{registeredStudentProfile.username}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Admission / SR No:</span>
              <span className="font-mono font-bold text-slate-900">{registeredStudentProfile.admissionNumber}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Class & Section:</span>
              <span className="font-bold text-slate-900">Class {registeredStudentProfile.classNumber} - Section '{registeredStudentProfile.sectionName}'</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Email Verification Status:</span>
              <span className={`inline-flex items-center gap-1 font-bold ${
                verificationSuccess || registeredStudentProfile.emailVerified ? 'text-emerald-600' : 'text-amber-600'
              }`}>
                {verificationSuccess || registeredStudentProfile.emailVerified ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>सत्यापित (100% Verified)</span>
                  </>
                ) : (
                  'सत्यापन कोड लंबित (Enter 6-Digit OTP)'
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onSuccess ? (
              <button
                type="button"
                onClick={onSuccess}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                Go to Dashboard (डैशबोर्ड पर जाएं)
              </button>
            ) : onNavigateLogin ? (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
              >
                Go to Sign In Portal (लॉगिन पोर्टल पर जाएं)
              </button>
            ) : null}
          </div>

        </div>
      </div>
    );
  }

  // If request has been successfully submitted, show the official verification receipt (for teacher)
  if (submittedRequest) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6 text-center animate-fade-in">
          
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Status: PENDING APPROVAL (सत्यापन लंबित)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Registration Request Submitted
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Your registration application for <strong>{submittedRequest.fullName}</strong> ({submittedRequest.requestedRole.toUpperCase()}) has been queued for verification.
            </p>
          </div>

          {/* Details Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Request Token / Ref ID:</span>
              <span className="font-mono font-bold text-slate-900">{submittedRequest.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Requested Username:</span>
              <span className="font-mono font-bold text-amber-700">{submittedRequest.preferredUsername}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
              <span className="text-slate-500">Reviewing Authority:</span>
              <span className="font-bold text-slate-800">Smt. Kiran Shakya (Head Teacher / प्रधानाध्यापिका)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Institution & UDISE:</span>
              <span className="text-slate-700">{settings.schoolName} (UDISE: {settings.udiseCode})</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-800 text-xs text-left flex items-start gap-3">
            <FileCheck2 className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
            <p className="leading-relaxed">
              <strong>Next Steps:</strong> The Head Teacher will inspect school enrolment records and verify your admission or staff identity. Once approved, you can immediately sign in using your requested Username <strong>{submittedRequest.preferredUsername}</strong> and chosen password.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onNavigateLogin && (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Go to Sign In Portal
              </button>
            )}
            {onNavigateHome && (
              <button
                type="button"
                onClick={onNavigateHome}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Return to School Homepage
              </button>
            )}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-br from-gov-navy-950 via-slate-900 to-gov-navy-950 flex flex-col justify-center sm:py-8 sm:px-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full sm:max-w-3xl sm:mx-auto min-h-screen sm:min-h-0 bg-white sm:rounded-3xl border-0 sm:border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col justify-between sm:justify-start">
        
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Basic Shiksha Parishad Enrollment</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">UDISE: {settings.udiseCode}</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Official Portal Registration Request
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Submit your verified registration details for <strong>{settings.schoolName}</strong>. All requests undergo identity verification by Head Teacher Smt. Kiran Shakya.
            </p>
          </div>

          {/* Security Notice on Head Teacher Registration */}
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-[11px] text-slate-300 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
            <p>
              <strong className="text-amber-400">Administrative Rule:</strong> Public registration for Head Teacher is strictly restricted. Only teachers and enrolled students may request account access.
            </p>
          </div>
        </div>

        {/* Tab Navigation: Student vs Teacher */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => handleTabChange('student')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${activeTab === 'student' ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>Student Registration (छात्र पंजीकरण)</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('teacher')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'teacher'
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'teacher' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>Teacher Account Request (शिक्षक अनुरोध)</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Section 1: Personal & Identity Information */}
            <div className="space-y-4">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                1. Basic Identity Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeTab === 'student' ? 'Student Full Name (छात्र का नाम)' : 'Teacher Full Name (शिक्षक का नाम)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder={activeTab === 'student' ? 'e.g. Aarav Sharma' : 'e.g. Shri Manoj Kumar Yadav'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Admission / Employee ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {activeTab === 'student' ? 'Admission / SR Number (दाखिला संख्या)' : 'Teacher / Staff Employee ID'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activeTab === 'student' ? admissionNumber : employeeId}
                    onChange={(e) => activeTab === 'student' ? setAdmissionNumber(e.target.value) : setEmployeeId(e.target.value)}
                    placeholder={activeTab === 'student' ? 'e.g. ADM-2025-004' : 'e.g. TCH-2026-004'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              {/* Student Specific Class & Parents Fields */}
              {activeTab === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Class (कक्षा) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={classNumber}
                      onChange={(e) => setClassNumber(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                        <option key={c} value={c}>Class {c} (कक्षा {c})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Section (वर्ग)
                    </label>
                    <select
                      value={sectionName}
                      onChange={(e) => setSectionName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Father / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Shri Ramakant Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Teacher Specific Designation & Subject Fields */}
              {activeTab === 'teacher' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Designation (पदनाम) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    >
                      <option value="Assistant Teacher (Primary)">Assistant Teacher (Primary / प्राथमिक)</option>
                      <option value="Assistant Teacher (Upper Primary)">Assistant Teacher (Upper Primary / उच्च प्राथमिक)</option>
                      <option value="Shiksha Mitra">Shiksha Mitra (शिक्षा मित्र)</option>
                      <option value="Physical Education Instructor">Physical Education Instructor (खेल शिक्षक)</option>
                      <option value="Special Educator">Special Educator (विशेष शिक्षक)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject Specialization (विषय)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Science, Mathematics, Hindi"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (मोबाइल नंबर)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (ईमेल) {activeTab === 'teacher' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'student' ? 'student@example.com (optional)' : 'teacher@school.gov.in'}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required={activeTab === 'teacher'}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Security & Login Credentials */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                2. Portal Security & Login Credentials
              </div>

              {/* Preferred Username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Preferred Login Username (लॉगिन यूजरनेम) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Format: {activeTab === 'student' ? 'STU-YYYY-XXXX' : 'TCH-YYYY-XXX'}</span>
                </div>
                <input
                  type="text"
                  value={preferredUsername}
                  onChange={(e) => setPreferredUsername(e.target.value.toUpperCase())}
                  placeholder={activeTab === 'student' ? 'STU-2026-0004' : 'TCH-2026-004'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-amber-800 font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden font-mono"
                  required
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password (पासवर्ड) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                      required
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

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password (पासवर्ड पुनः दर्ज करें) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Already registered?{' '}
                {onNavigateLogin && (
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Sign In here
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Registration for Head Teacher Verification</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
