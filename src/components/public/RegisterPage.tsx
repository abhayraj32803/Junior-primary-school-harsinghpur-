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
  Check
} from 'lucide-react';
import { 
  sendStudentEmailVerificationCode, 
  verifyStudentEmailCode 
} from '../../services/verificationCodeService';
import { OtpInput } from '../common/OtpInput';

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

  // Student registration only (Teacher registration is strictly managed by School Admin/Headmaster)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registeredStudentProfile, setRegisteredStudentProfile] = useState<any | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  // 6-Digit Code Verification State for Student Post-Registration
  const [otpCode, setOtpCode] = useState<string>('');
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

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

  // Auto-generate suggested username as user types
  const handleNameChange = (val: string) => {
    setFullName(val);
    if (!preferredUsername || preferredUsername.startsWith('STU-')) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      setPreferredUsername(`STU-2026-${randomSuffix}`);
    }
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
      setResendStatusMsg(res.message || 'सत्यापन कोड ईमेल पर पुनः भेज दिया गया है।');
    } else {
      setVerificationError(res.error || 'कोड भेजने में विफल रहा।');
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
      });
    } else {
      setError(res.error || 'Failed to complete student registration.');
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
                ईमेल पर प्राप्त 6-अंकों का OTP कोड दर्ज करें (Enter 6-Digit OTP)
              </label>

              <OtpInput
                length={6}
                value={otpCode}
                onChange={(val) => {
                  setOtpCode(val);
                  setVerificationError(null);
                }}
                onComplete={(code) => triggerVerifyStudentOtp(code)}
                onResend={handleResendOtpCode}
                expiresInSeconds={600}
                cooldownSeconds={60}
                isLoading={verifyingCode}
                isResending={resendingEmail}
                errorMessage={verificationError}
                successMessage={resendStatusMsg}
                lang={language === 'hi' ? 'hi' : 'en'}
              />

              {/* Verify Action Button */}
              <button
                type="button"
                onClick={() => triggerVerifyStudentOtp(otpCode)}
                disabled={verifyingCode || otpCode.length !== 6}
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  verifyingCode || otpCode.length !== 6
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
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden bg-gov-navy-950 sm:bg-gradient-to-br sm:from-gov-navy-950 sm:via-slate-900 sm:to-gov-navy-950 flex flex-col justify-start sm:justify-center sm:py-8 sm:px-4 selection:bg-amber-500 selection:text-slate-950">
      <div className="w-full sm:max-w-3xl sm:mx-auto min-h-[100dvh] sm:min-h-0 bg-white sm:rounded-3xl border-0 sm:border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col justify-between sm:justify-start">
        
        {/* Top Header Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>बेसिक शिक्षा परिषद छात्र प्रवेश पोर्टल</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">UDISE: {settings.udiseCode}</span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              नवीन छात्र ऑनलाइन प्रवेश एवं पंजीकरण
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              <strong>{settings.schoolNameHi || settings.schoolName}</strong> में कक्षा 1 से 8 हेतु छात्र विवरण एवं खाता पंजीकरण।
            </p>
          </div>

          {/* Teacher Account Policy Notice */}
          <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-2xl text-[12px] text-amber-200/90 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">
                शिक्षकों एवं स्टॉफ पंजीकरण संबंधी आधिकारिक नियम (Faculty Registration Notice):
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                उत्तर प्रदेश बेसिक शिक्षा परिषद के सुरक्षा दिशा-निर्देशों के अनुसार शिक्षकों का यूजरनेम व पासवर्ड केवल विद्यालय प्रशासक (Headmaster / Admin) द्वारा प्रशासनिक पैनल (Admin Portal) से सीधे सृजित किया जाता है। शिक्षक स्वयं ऑनलाइन पंजीकरण नहीं कर सकते। अपने लॉगिन क्रेडेंशियल हेतु प्रधानाध्यापिका से संपर्क करें।
              </p>
              {onNavigateLogin && (
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  <span>शिक्षक लॉगिन पोर्टल पर जाएं →</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student Registration Form */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center gap-2.5 text-blue-900 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
            <span>छात्र नामांकन एवं विद्यार्थी पोर्टल खाता सृजन (Class 1–8 Admission)</span>
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
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center justify-between">
                <span>1. छात्र का व्यक्तिगत एवं शैक्षणिक विवरण</span>
                <span className="text-[11px] text-slate-400 font-normal">कक्षा 1 से 8</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    छात्र / छात्रा का पूरा नाम (Full Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="उदा. आरव शर्मा / Aarav Sharma"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>

                {/* Admission Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्रवेश / एस.आर. संख्या (Admission / SR Number) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={admissionNumber}
                    onChange={(e) => setAdmissionNumber(e.target.value)}
                    placeholder="उदा. ADM-2025-004 या SR-101"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden font-mono"
                    required
                  />
                </div>
              </div>

              {/* Student Specific Class & Parents Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    प्रवेश कक्षा (Class) <span className="text-rose-500">*</span>
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
                    वर्ग (Section)
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
                    पिता / अभिभावक का नाम
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="उदा. श्री रमाकांत शर्मा"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    मोबाइल नंबर (Mobile Number)
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
                    ईमेल आईडी (Email for Verification) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Security & Login Credentials */}
            <div className="space-y-4 pt-2">
              <div className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-1">
                2. पोर्टल लॉगिन क्रेडेंशियल (Login Credentials)
              </div>

              {/* Preferred Username */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    छात्र यूजरनेम (Student Username ID) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">प्रारूप: STU-2026-XXXX</span>
                </div>
                <input
                  type="text"
                  value={preferredUsername}
                  onChange={(e) => setPreferredUsername(e.target.value.toUpperCase())}
                  placeholder="STU-2026-0004"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-amber-800 font-bold focus:bg-white focus:border-amber-500 focus:outline-hidden font-mono"
                  required
                />
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    गोपनीय पासवर्ड (Password) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="न्यूनतम 6 अक्षर"
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
                    पासवर्ड पुनः दर्ज करें (Confirm Password) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="वही पासवर्ड दोबारा लिखें"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submission Button */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                पहले से पंजीकृत हैं?{' '}
                {onNavigateLogin && (
                  <button
                    type="button"
                    onClick={onNavigateLogin}
                    className="font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    लॉगिन पोर्टल पर जाएं
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
                    <span>छात्र पंजीकरण सुरक्षित जमा करें</span>
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
