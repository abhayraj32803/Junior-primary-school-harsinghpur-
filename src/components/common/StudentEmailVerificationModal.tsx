import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ArrowRight, 
  KeyRound, 
  Copy, 
  Check, 
  Sparkles,
  Lock,
  Clock,
  Send
} from 'lucide-react';
import { Modal } from './Modal';
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
  targetEmail: string;
  studentName?: string;
  studentId?: string;
  uid?: string;
  onVerificationSuccess?: () => void;
  autoSendOnOpen?: boolean;
}

export const StudentEmailVerificationModal: React.FC<StudentEmailVerificationModalProps> = ({
  isOpen,
  onClose,
  targetEmail,
  studentName,
  studentId,
  uid,
  onVerificationSuccess,
  autoSendOnOpen = true
}) => {
  const { userProfile, checkAndReloadEmailVerification } = useAuth();
  const { language } = useSchool();

  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [latestSentCode, setLatestSentCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Timers
  const [expiresInSeconds, setExpiresInSeconds] = useState<number>(600); // 10 minutes
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initial code dispatch or load existing active verification
  useEffect(() => {
    if (isOpen && targetEmail) {
      setError(null);
      setSuccessMessage(null);
      setIsVerified(false);
      setDigits(['', '', '', '', '', '']);

      const activeRec = getActiveVerificationForEmail(targetEmail);
      if (activeRec) {
        setLatestSentCode(activeRec.code);
        const remainingSec = Math.max(0, Math.floor((activeRec.expiresAt - Date.now()) / 1000));
        setExpiresInSeconds(remainingSec);
      } else if (autoSendOnOpen) {
        handleSendCode();
      }

      // Focus first input box
      setTimeout(() => {
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }
      }, 200);
    }
  }, [isOpen, targetEmail]);

  // Expiry countdown effect
  useEffect(() => {
    if (!isOpen || isVerified || expiresInSeconds <= 0) return;
    const interval = setInterval(() => {
      setExpiresInSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isVerified, expiresInSeconds]);

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Format seconds as mm:ss
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendCode = async () => {
    if (!targetEmail) return;
    setResending(true);
    setError(null);

    const res = await sendStudentEmailVerificationCode(targetEmail, {
      studentName: studentName || userProfile?.name,
      studentId: studentId || userProfile?.studentId || userProfile?.username,
      uid: uid || userProfile?.uid
    });

    setResending(false);

    if (res.success) {
      if (res.code) setLatestSentCode(res.code);
      setExpiresInSeconds(600); // 10 mins
      setResendCooldown(60); // 60s cooldown
      setSuccessMessage(res.message || (language === 'hi' ? 'सत्यापन कोड ईमेल पर भेजा गया!' : 'Verification code sent to your email!'));
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } else {
      setError(res.error || 'Failed to dispatch code');
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const rawVal = val.replace(/\D/g, ''); // numbers only
    
    // Handle paste of whole 6-digit code
    if (rawVal.length >= 6) {
      const newDigits = rawVal.slice(0, 6).split('');
      setDigits(newDigits);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
      triggerVerifyCode(newDigits.join(''));
      return;
    }

    const singleDigit = rawVal.slice(-1);
    const updated = [...digits];
    updated[index] = singleDigit;
    setDigits(updated);
    setError(null);

    // Auto advance
    if (singleDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all 6 digits filled, trigger verification automatically
    if (singleDigit && index === 5) {
      const fullCode = updated.join('');
      if (fullCode.length === 6) {
        triggerVerifyCode(fullCode);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (pasted.length >= 6) {
      const newDigits = pasted.slice(0, 6).split('');
      setDigits(newDigits);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
      triggerVerifyCode(newDigits.join(''));
    }
  };

  const triggerVerifyCode = async (codeToVerify: string) => {
    if (!targetEmail || codeToVerify.length !== 6) {
      setError(language === 'hi' ? 'कृपया सभी 6 अंक दर्ज करें।' : 'Please enter all 6 digits.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await verifyStudentEmailCode(targetEmail, codeToVerify, {
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
      setSuccessMessage(res.message || (language === 'hi' ? 'ईमेल सफलतापूर्वक सत्यापित हुआ!' : 'Email successfully verified!'));
      if (onVerificationSuccess) {
        onVerificationSuccess();
      }
    } else {
      setError(res.error || (language === 'hi' ? 'सत्यापन कोड अमान्य है।' : 'Invalid verification code.'));
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = digits.join('');
    triggerVerifyCode(fullCode);
  };

  const handleCopyTestCode = () => {
    if (latestSentCode) {
      navigator.clipboard.writeText(latestSentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      
      // Auto populate digits on copy
      const chars = latestSentCode.split('');
      setDigits(chars);
      if (inputRefs.current[5]) inputRefs.current[5].focus();
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
            <span>{language === 'hi' ? 'छात्र ईमेल सत्यापन (Student Email OTP Verification)' : 'Student Verification Code'}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isVerified
              ? (language === 'hi' ? 'सत्यापन सफल!' : 'Verification Successful!')
              : (language === 'hi' ? '6-अंकों का सत्यापन कोड दर्ज करें' : 'Enter 6-Digit Verification Code')}
          </h3>

          {!isVerified ? (
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              {language === 'hi' ? 'हमने छात्र के पंजीकृत ईमेल पर 6-अंकों का सत्यापन कोड भेजा है:' : 'We have dispatched a 6-digit security code to:'}
              <br />
              <strong className="font-mono text-blue-700 font-bold bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100 mt-1 inline-block">
                {targetEmail || 'student@school.gov.in'}
              </strong>
            </p>
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
                <span className="font-mono font-bold text-slate-900">{targetEmail}</span>
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
              <span>{language === 'hi' ? 'आगे बढ़ें (Continue)' : 'Continue to Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* OTP Input Form */
          <form onSubmit={handleManualSubmit} className="space-y-5">
            
            {/* 6 OTP Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  disabled={loading}
                  className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all shadow-xs focus:outline-hidden ${
                    error
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-600'
                      : digit
                      ? 'border-blue-600 bg-blue-50/30 text-blue-950 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-900 focus:border-blue-500 focus:bg-blue-50/10'
                  }`}
                  placeholder="•"
                />
              ))}
            </div>

            {/* Error & Success Messages */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center justify-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && !error && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Timer & Expiry Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {expiresInSeconds > 0 ? (
                    <>
                      {language === 'hi' ? 'कोड की वैधता:' : 'Code expires in:'}{' '}
                      <strong className={`font-mono font-bold ${expiresInSeconds < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                        {formatTime(expiresInSeconds)}
                      </strong>
                    </>
                  ) : (
                    <span className="text-rose-600 font-bold">{language === 'hi' ? 'कोड समाप्त हो चुका है' : 'Code expired'}</span>
                  )}
                </span>
              </div>

              {/* Resend button */}
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resending || resendCooldown > 0}
                className={`font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  resendCooldown > 0 || resending
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-blue-600 hover:text-blue-800 underline'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {resending
                    ? 'भेज रहे हैं...'
                    : resendCooldown > 0
                    ? `पुनः भेजें (${resendCooldown}s)`
                    : (language === 'hi' ? 'कोड पुनः भेजें' : 'Resend Code')}
                </span>
              </button>
            </div>

            {/* Verification Action Button */}
            <button
              type="submit"
              disabled={loading || digits.join('').length !== 6 || expiresInSeconds <= 0}
              className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                loading || digits.join('').length !== 6 || expiresInSeconds <= 0
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

            {/* Simulated Live Inbox Assistant Box (Instant Testing Support) */}
            {latestSentCode && (
              <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'hi' ? 'ईमेल कोड प्रेषण सहायक (Demo Preview)' : 'Sent Code Preview'}:</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyTestCode}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-200/70 hover:bg-amber-200 text-amber-900 font-bold text-[11px] cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'कॉपी व भरा गया' : 'कोड भरें (Auto-Fill)'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white/90 p-2 rounded-xl border border-amber-200 font-mono">
                  <span className="text-slate-500 text-[11px]">OTP Code:</span>
                  <span className="font-black text-base text-slate-900 tracking-widest">{latestSentCode}</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  💡 {language === 'hi' ? 'यह 6-अंकों का कोड छात्र के ईमेल इनबॉक्स पर भी भेजा गया है।' : 'This 6-digit code has been delivered to student email.'}
                </p>
              </div>
            )}

          </form>
        )}

      </div>
    </Modal>
  );
};
