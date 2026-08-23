import React, { useState } from 'react';
import { useAuth, GoogleAuthDetails } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { GoogleAuthRoleModal } from '../common/GoogleAuthRoleModal';
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
  RefreshCw
} from 'lucide-react';

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
    checkAndReloadEmailVerification,
    submitStudentRegistration, 
    submitTeacherRegistration,
    loginWithGoogle
  } = useAuth();
  const { classes, settings, language } = useSchool();

  // Mode: 'student' or 'teacher' (Head Teacher registration is blocked by rule)
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [registeredStudentProfile, setRegisteredStudentProfile] = useState<any | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  const handleConfirmGoogleAuth = async (details: GoogleAuthDetails) => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await loginWithGoogle(details);
      setGoogleLoading(false);

      if (res.success) {
        setGoogleModalOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(res.error ? getFriendlyAuthErrorMessage(res.error, language) : (language === 'hi' ? 'Google प्रमाणीकरण पूरा नहीं हो सका।' : 'Google authentication could not be completed.'));
      }
    } catch (err: any) {
      setGoogleLoading(false);
      setError(getFriendlyAuthErrorMessage(err.code || err.message, language));
    }
  };

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

  const handleResendVerification = async () => {
    setResendingEmail(true);
    setResendStatusMsg(null);
    const res = await sendStudentVerificationEmail();
    setResendingEmail(false);
    if (res.success) {
      setResendStatusMsg(res.message || 'सत्यापन ईमेल सफलतापूर्वक पुनः भेजा गया।');
    } else {
      setError(res.error || 'ईमेल भेजने में विफलता हुई।');
    }
  };

  const handleCheckEmailStatus = async () => {
    setResendingEmail(true);
    const res = await checkAndReloadEmailVerification();
    setResendingEmail(false);
    if (res.isVerified) {
      setResendStatusMsg('बधाई हो! आपका ईमेल सफलतापूर्वक सत्यापित हो गया है।');
      if (registeredStudentProfile) {
        setRegisteredStudentProfile({ ...registeredStudentProfile, emailVerified: true });
      }
    } else {
      setResendStatusMsg('ईमेल अभी तक सत्यापित नहीं हुआ है। कृपया अपने इनबॉक्स में लिंक पर क्लिक करें।');
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

  // If student is successfully registered with Firebase Auth & Verification Email
  if (registeredStudentProfile) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-2xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-10 space-y-6 text-center animate-fade-in">
          
          <div className="w-16 h-16 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>खाता सफलतापूर्वक निर्मित • ईमेल सत्यापन भेजा गया</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Student Registered Successfully
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              Firebase Authentication में <strong>{registeredStudentProfile.fullName}</strong> का छात्र खाता बन चुका है। हमने <strong>{registeredStudentProfile.email}</strong> पर सत्यापन ईमेल भेजा है।
            </p>
          </div>

          {resendStatusMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resendStatusMsg}</span>
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
              <span className={`inline-flex items-center gap-1 font-bold ${registeredStudentProfile.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                {registeredStudentProfile.emailVerified ? 'सत्यापित (Verified)' : 'सत्यापन लंबित (Pending Email Click)'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
            <p className="leading-relaxed">
              <strong>निर्देश:</strong> कृपया अपना ईमेल इनबॉक्स खोलें और Firebase Verification लिंक पर क्लिक करें। सत्यापन के बाद आप छात्र पोर्टल पर पूर्ण पहुंच प्राप्त कर सकेंगे।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>{resendingEmail ? 'भेजा जा रहा है...' : 'ईमेल सत्यापन पुनः भेजें (Resend Email)'}</span>
            </button>

            <button
              type="button"
              onClick={handleCheckEmailStatus}
              disabled={resendingEmail}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? 'animate-spin' : ''}`} />
              <span>स्थिति जांचें (Refresh Status)</span>
            </button>

            {onSuccess ? (
              <button
                type="button"
                onClick={onSuccess}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Go to Dashboard
              </button>
            ) : onNavigateLogin ? (
              <button
                type="button"
                onClick={onNavigateLogin}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                Go to Sign In Portal
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
    <div className="min-h-[85vh] w-full max-w-full overflow-x-hidden flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-3xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        
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

          {/* Quick Google Registration Option for Students */}
          {activeTab === 'student' && (
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-amber-300 shadow-2xs shrink-0">
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" />
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">
                    {language === 'hi' ? 'Google के साथ त्वरित छात्र पंजीकरण' : 'Instant Student Registration with Google'}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium">
                    {language === 'hi'
                      ? 'नाम, माता-पिता का नाम, जन्मतिथि एवं कक्षा विवरण के साथ स्वतः छात्र प्रोफाइल बनाएं।'
                      : 'One-click registration: configure full student profile, DOB, class & parents info once.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGoogleModalOpen(true)}
                disabled={googleLoading}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{language === 'hi' ? 'Google से पंजीकृत करें' : 'Register with Google'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

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
