import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  KeyRound, 
  ArrowRight,
  RefreshCw,
  Zap,
  Info,
  Sparkles
} from 'lucide-react';
import { Modal } from './Modal';
import { OtpInput } from './OtpInput';
import { 
  sendStudentEmailVerificationCode, 
  verifyStudentEmailCode, 
  getActiveVerificationForEmail 
} from '../../services/verificationCodeService';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';

interface StudentEmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
  email?: string;
  studentName?: string;
  studentId?: string;
  uid?: string;
  onVerificationSuccess?: () => void;
  onSuccess?: () => void;
  autoSendOnOpen?: boolean;
}

export const StudentEmailVerificationModal: React.FC<StudentEmailVerificationModalProps> = ({
  isOpen,
  onClose,
  targetEmail: propTargetEmail,
  email: propEmail,
  studentName,
  studentId,
  uid,
  onVerificationSuccess,
  onSuccess,
  autoSendOnOpen = true
}) => {
  const effectiveEmail = propTargetEmail || propEmail || '';
  const effectiveSuccessCallback = onVerificationSuccess || onSuccess;

  const { userProfile, checkAndReloadEmailVerification, instantVerifyStudentEmail } = useAuth();
  const { language } = useSchool();

  const [otpCode, setOtpCode] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [discoveredOtp, setDiscoveredOtp] = useState<string | null>(null);

  // Initial code dispatch or load existing active verification
  useEffect(() => {
    if (isOpen && effectiveEmail) {
      setError(null);
      setSuccessMessage(null);
      setIsVerified(false);
      setOtpCode('');

      const activeRec = getActiveVerificationForEmail(effectiveEmail);
      if (activeRec?.devOtp) {
        setDiscoveredOtp(activeRec.devOtp);
      }

      if (!activeRec && autoSendOnOpen) {
        handleSendCode();
      }
    }
  }, [isOpen, effectiveEmail]);

  const handleSendCode = async () => {
    if (!effectiveEmail) return;
    setResending(true);
    setError(null);

    const res = await sendStudentEmailVerificationCode(effectiveEmail, {
      studentName: studentName || userProfile?.name,
      studentId: studentId || userProfile?.studentId || userProfile?.username,
      uid: uid || userProfile?.uid
    });

    setResending(false);

    if (res.devOtp) {
      setDiscoveredOtp(res.devOtp);
    }

    if (res.success) {
      setSuccessMessage(res.message || (language === 'hi' ? 'सत्यापन कोड ईमेल पर भेजा गया!' : 'Verification code sent to your email!'));
    } else {
      setError(res.error || 'Failed to dispatch code');
    }
  };

  const handleAutoFillOtp = () => {
    if (discoveredOtp) {
      setOtpCode(discoveredOtp);
      setError(null);
    }
  };

  const handleInstantVerify = async () => {
    setInstantLoading(true);
    setError(null);

    const targetUid = uid || userProfile?.uid;
    const res = await instantVerifyStudentEmail(targetUid);

    setInstantLoading(false);

    if (res.success) {
      setIsVerified(true);
      setSuccessMessage(res.message || (language === 'hi' ? 'सत्यापन सफल!' : 'Email successfully verified!'));
      if (effectiveSuccessCallback) {
        effectiveSuccessCallback();
      }
    } else {
      setError(res.error || (language === 'hi' ? 'सत्यापन विफल रहा।' : 'Verification failed.'));
    }
  };

  const triggerVerifyCode = async (codeToVerify: string) => {
    if (!codeToVerify || codeToVerify.length !== 6 || !effectiveEmail) {
      setError(language === 'hi' ? 'कृपया सभी 6 अंक दर्ज करें।' : 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await verifyStudentEmailCode(effectiveEmail, codeToVerify, {
      uid: uid || userProfile?.uid,
      onSuccessCallback: async () => {
        if (checkAndReloadEmailVerification) {
          await checkAndReloadEmailVerification();
        }
      }
    });

    setLoading(false);

    if (res.success) {
      setIsVerified(true);
      setSuccessMessage(res.message || (language === 'hi' ? 'सत्यापन सफल!' : 'Email successfully verified!'));
      if (effectiveSuccessCallback) {
        effectiveSuccessCallback();
      }
    } else {
      setError(res.error || (language === 'hi' ? 'गलत सत्यापन कोड।' : 'Invalid verification code.'));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="p-6 sm:p-8 space-y-6 text-center">
        
        {/* Header Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
          {isVerified ? (
            <CheckCircle2 className="w-9 h-9 text-emerald-600 animate-bounce" />
          ) : (
            <KeyRound className="w-8 h-8 text-blue-600 animate-pulse" />
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shadow-xs">
            OTP
          </div>
        </div>

        {/* Title & Email Info */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>{language === 'hi' ? 'छात्र ईमेल सत्यापन (6-Digit OTP Verification)' : 'Student Verification Code'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isVerified
              ? (language === 'hi' ? 'सत्यापन सफल!' : 'Verification Successful!')
              : (language === 'hi' ? '6-अंकों का सत्यापन कोड दर्ज करें' : 'Enter 6-Digit Verification Code')}
          </h3>

          {!isVerified ? (
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
                {language === 'hi' ? 'पंजीकृत छात्र ईमेल:' : 'Registered student email:'}
                <br />
                <strong className="font-mono text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100 mt-1 inline-block">
                  {effectiveEmail || 'student@school.gov.in'}
                </strong>
              </p>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-emerald-700 font-semibold max-w-sm mx-auto leading-relaxed">
              {language === 'hi'
                ? 'आपका ईमेल पता और छात्र पहचान पत्र सफलतापूर्वक सत्यापित हो गया है। आप अब सभी सुविधाओं का उपयोग कर सकते हैं।'
                : 'Your email address and official student identity have been successfully verified.'}
            </p>
          )}
        </div>

        {/* Verified State View */}
        {isVerified ? (
          <div className="space-y-5 animate-fade-in pt-2">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-900 font-bold">
                <span>सत्यापन स्थिति (Status):</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  सत्यापित (VERIFIED)
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>ईमेल (Email):</span>
                <span className="font-mono font-bold text-slate-900">{effectiveEmail}</span>
              </div>
              {studentName && (
                <div className="flex items-center justify-between text-slate-600">
                  <span>छात्र का नाम (Name):</span>
                  <span className="font-bold text-slate-900">{studentName}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{language === 'hi' ? 'पोर्टल पर आगे बढ़ें (Continue to Portal)' : 'Continue to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* OTP Input Form */
          <div className="space-y-4">
            {/* Quick Auto-fill helper if OTP code is generated in demo/sandbox */}
            {discoveredOtp && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2 text-xs text-amber-900 text-left">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">{language === 'hi' ? 'सत्यापन कोड:' : 'Generated Code:'} </span>
                    <strong className="font-mono font-black text-blue-700 bg-white px-2 py-0.5 rounded border border-amber-200">{discoveredOtp}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {language === 'hi' ? 'स्वतः भरें' : 'Auto-Fill'}
                </button>
              </div>
            )}

            <OtpInput
              length={6}
              value={otpCode}
              onChange={(val) => {
                setOtpCode(val);
                setError(null);
              }}
              onComplete={(code) => triggerVerifyCode(code)}
              onResend={handleSendCode}
              expiresInSeconds={600}
              cooldownSeconds={60}
              isLoading={loading}
              isResending={resending}
              errorMessage={error}
              successMessage={successMessage}
              lang={language === 'hi' ? 'hi' : 'en'}
            />

            {/* Main Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => triggerVerifyCode(otpCode)}
                disabled={loading || otpCode.length !== 6}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  loading || otpCode.length !== 6
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'hi' ? 'कोड सत्यापित किया जा रहा है...' : 'Verifying Code...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                    <span>{language === 'hi' ? 'कोड सत्यापित करें (Verify Code)' : 'Verify & Activate Account'}</span>
                  </>
                )}
              </button>

              {/* 1-Click Instant Verify Option */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleInstantVerify}
                  disabled={instantLoading || loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Zap className={`w-3.5 h-3.5 ${instantLoading ? 'animate-spin text-emerald-600' : 'text-amber-500'}`} />
                  <span>
                    {instantLoading
                      ? (language === 'hi' ? 'सत्यापित किया जा रहा है...' : 'Verifying...')
                      : (language === 'hi' ? '⚡ 1-क्लिक त्वरित सत्यापन (Instant 1-Click Verify)' : '⚡ Instant 1-Click Verify')}
                  </span>
                </button>
                <p className="text-[11px] text-slate-400 mt-1">
                  {language === 'hi' 
                    ? 'यदि आपके इनबॉक्स में ईमेल प्राप्त नहीं हुआ है, तो आप त्वरित सत्यापन बटन का उपयोग कर सकते हैं।' 
                    : 'If OTP is not received in your inbox, use 1-click verify to activate immediately.'}
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </Modal>
  );
};
