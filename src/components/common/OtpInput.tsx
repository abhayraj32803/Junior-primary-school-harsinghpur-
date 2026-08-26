import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (val: string) => void;
  onComplete?: (code: string) => void;
  onResend?: () => Promise<boolean | void>;
  expiresInSeconds?: number;
  cooldownSeconds?: number;
  isLoading?: boolean;
  isResending?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
  autoFocus?: boolean;
  disabled?: boolean;
  lang?: 'hi' | 'en';
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  value = '',
  onChange,
  onComplete,
  onResend,
  expiresInSeconds = 300, // 5 minutes
  cooldownSeconds = 0,
  isLoading = false,
  isResending = false,
  errorMessage = null,
  successMessage = null,
  autoFocus = true,
  disabled = false,
  lang = 'hi'
}) => {
  const [digits, setDigits] = useState<string[]>(() => {
    const arr = Array(length).fill('');
    if (value) {
      const clean = value.replace(/\D/g, '').slice(0, length).split('');
      clean.forEach((ch, idx) => {
        arr[idx] = ch;
      });
    }
    return arr;
  });

  const [remainingTime, setRemainingTime] = useState(expiresInSeconds);
  const [resendCooldown, setResendCooldown] = useState(cooldownSeconds);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync external value
  useEffect(() => {
    if (value !== undefined) {
      const clean = value.replace(/\D/g, '').slice(0, length);
      const arr = Array(length).fill('');
      for (let i = 0; i < clean.length; i++) {
        arr[i] = clean[i];
      }
      setDigits(arr);
    }
  }, [value, length]);

  // Sync cooldown and expiry
  useEffect(() => {
    setRemainingTime(expiresInSeconds);
  }, [expiresInSeconds]);

  useEffect(() => {
    setResendCooldown(cooldownSeconds);
  }, [cooldownSeconds]);

  // Countdown timer for expiry
  useEffect(() => {
    if (remainingTime <= 0) return;
    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingTime]);

  // Resend cooldown timer
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

  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, val: string) => {
    const rawDigits = val.replace(/\D/g, '');

    // Handle full paste inside a single box
    if (rawDigits.length >= length) {
      const pasted = rawDigits.slice(0, length).split('');
      setDigits(pasted);
      const fullCode = pasted.join('');
      if (onChange) onChange(fullCode);
      if (inputRefs.current[length - 1]) {
        inputRefs.current[length - 1]?.focus();
      }
      if (onComplete) onComplete(fullCode);
      return;
    }

    const singleDigit = rawDigits.slice(-1);
    const updated = [...digits];
    updated[index] = singleDigit;
    setDigits(updated);

    const fullCode = updated.join('');
    if (onChange) onChange(fullCode);

    // Auto advance
    if (singleDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Trigger onComplete when all digits entered
    if (singleDigit && index === length - 1 && fullCode.length === length) {
      if (onComplete) onComplete(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pasted.length > 0) {
      const arr = Array(length).fill('');
      for (let i = 0; i < pasted.length; i++) {
        arr[i] = pasted[i];
      }
      setDigits(arr);
      const fullCode = arr.join('');
      if (onChange) onChange(fullCode);
      const targetFocusIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[targetFocusIdx]?.focus();

      if (pasted.length === length && onComplete) {
        onComplete(fullCode);
      }
    }
  };

  const handleResendClick = async () => {
    if (disabled || isResending || resendCooldown > 0 || !onResend) return;
    await onResend();
    setResendCooldown(45);
    setRemainingTime(300);
    setDigits(Array(length).fill(''));
    if (onChange) onChange('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const isExpired = remainingTime <= 0;

  return (
    <div className="w-full space-y-4">
      {/* 6 Digit Input Boxes */}
      <div 
        className="flex items-center justify-center gap-2 sm:gap-3" 
        onPaste={handlePaste}
      >
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputRefs.current[idx] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleDigitChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            disabled={disabled || isLoading}
            className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-mono font-black rounded-2xl border-2 transition-all shadow-xs focus:outline-hidden ${
              errorMessage
                ? 'border-rose-400 bg-rose-50/40 text-rose-950 focus:border-rose-600'
                : digit
                ? 'border-indigo-600 bg-indigo-50/30 text-indigo-950 shadow-sm'
                : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500 focus:bg-indigo-50/10'
            } ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="•"
          />
        ))}
      </div>

      {/* Error & Success Messages */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-start gap-2 animate-shake">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMessage}</span>
        </div>
      )}

      {successMessage && !errorMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span className="flex-1">{successMessage}</span>
        </div>
      )}

      {/* Timer and Resend Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
        {/* Countdown */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>
            {!isExpired ? (
              <>
                {lang === 'hi' ? 'वैधता:' : 'Valid for:'}{' '}
                <strong className={`font-mono font-bold ${remainingTime < 60 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatTimer(remainingTime)}
                </strong>
              </>
            ) : (
              <span className="text-rose-600 font-bold">
                {lang === 'hi' ? 'समय समाप्त (Expired)' : 'Code expired'}
              </span>
            )}
          </span>
        </div>

        {/* Resend Link */}
        {onResend && (
          <button
            type="button"
            onClick={handleResendClick}
            disabled={disabled || isResending || resendCooldown > 0}
            className={`inline-flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
              resendCooldown > 0 || isResending || disabled
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-800 underline'
            }`}
          >
            <RefreshCw className={`w-3 h-3 ${isResending ? 'animate-spin' : ''}`} />
            <span>
              {isResending
                ? (lang === 'hi' ? 'भेज रहे हैं...' : 'Sending...')
                : resendCooldown > 0
                ? (lang === 'hi' ? `पुनः भेजें (${resendCooldown}s)` : `Resend (${resendCooldown}s)`)
                : (lang === 'hi' ? 'कोड पुनः भेजें' : 'Resend Code')}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
