import { normalizeEmail } from '../utils/authErrorUtils';

export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export interface VerificationState {
  email: string;
  purpose: OtpPurpose;
  expiresAt: number; // timestamp in ms (5 minutes)
  cooldownUntil: number; // timestamp in ms (45 seconds)
  verified: boolean;
  resetSessionToken?: string;
}

// Memory / Session cache for client-side timing and session flow
const activeSessionKey = 'sms_gov_active_auth_session';

export const saveActiveSession = (session: VerificationState) => {
  try {
    sessionStorage.setItem(activeSessionKey, JSON.stringify(session));
  } catch (e) {
    // ignore
  }
};

export const getActiveSession = (): VerificationState | null => {
  try {
    const raw = sessionStorage.getItem(activeSessionKey);
    if (!raw) return null;
    const data: VerificationState = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      sessionStorage.removeItem(activeSessionKey);
      return null;
    }
    return data;
  } catch {
    return null;
  }
};

export const clearActiveSession = () => {
  try {
    sessionStorage.removeItem(activeSessionKey);
  } catch (e) {
    // ignore
  }
};

/**
 * 1. Dispatch 6-digit OTP for Email Verification (Registration / Onboarding)
 */
export const sendStudentEmailVerificationCode = async (
  email: string,
  options?: {
    studentName?: string;
    studentId?: string;
    uid?: string;
  }
): Promise<{
  success: boolean;
  expiresAt?: number;
  cooldownSeconds?: number;
  error?: string;
  message?: string;
}> => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      error: 'कृपया एक मान्य ईमेल पता दर्ज करें (Please provide a valid email address).'
    };
  }

  try {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        purpose: 'EMAIL_VERIFICATION',
        username: options?.studentName || cleanEmail,
        schoolName: 'Composite Junior High School Harsinghpur Gova'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'सत्यापन कोड नहीं भेजा जा सका। कृपया कुछ समय बाद पुनः प्रयास करें।'
      };
    }

    const expiresAt = data.expiresAt || (Date.now() + 5 * 60 * 1000);
    const cooldownSeconds = data.cooldownSeconds || 45;

    saveActiveSession({
      email: cleanEmail,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt,
      cooldownUntil: Date.now() + cooldownSeconds * 1000,
      verified: false
    });

    return {
      success: true,
      expiresAt,
      cooldownSeconds,
      message: '6-अंकों का सत्यापन कोड आपके ईमेल पर भेज दिया गया है।'
    };
  } catch (err) {
    return {
      success: false,
      error: 'सर्वर से संपर्क नहीं हो सका। कृपया अपना नेटवर्क जांचकर पुनः प्रयास करें।'
    };
  }
};

/**
 * 2. Validate 6-digit OTP for Email Verification
 */
export const verifyStudentEmailCode = async (
  email: string,
  enteredCode: string,
  options?: {
    uid?: string;
    onSuccessCallback?: () => void;
  }
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  attemptsRemaining?: number;
}> => {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = (enteredCode || '').toString().trim().replace(/\D/g, '');

  if (!cleanEmail) {
    return { success: false, error: 'ईमेल पता आवश्यक है।' };
  }

  if (cleanCode.length !== 6) {
    return {
      success: false,
      error: 'कृपया 6 अंकों का सही सत्यापन कोड दर्ज करें।'
    };
  }

  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
        purpose: 'EMAIL_VERIFICATION'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'गलत सत्यापन कोड। कृपया पुनः प्रयास करें।',
        attemptsRemaining: data.attemptsRemaining
      };
    }

    // Success
    const current = getActiveSession();
    if (current) {
      current.verified = true;
      saveActiveSession(current);
    }

    if (options?.onSuccessCallback) {
      options.onSuccessCallback();
    }

    return {
      success: true,
      message: 'ईमेल सफलतापूर्वक सत्यापित हो गया है!'
    };
  } catch (err) {
    return {
      success: false,
      error: 'सत्यापन प्रक्रिया पूरी नहीं हो सकी। कृपया पुनः प्रयास करें।'
    };
  }
};

/**
 * 3. Dispatch 6-digit Password Reset OTP
 */
export const sendPasswordResetOtpEmail = async (
  email: string,
  options?: {
    username?: string;
    role?: string;
  }
): Promise<{
  success: boolean;
  expiresAt?: number;
  cooldownSeconds?: number;
  error?: string;
  message?: string;
}> => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      error: 'कृपया एक मान्य ईमेल पता दर्ज करें।'
    };
  }

  try {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        purpose: 'PASSWORD_RESET',
        username: options?.username || cleanEmail,
        schoolName: 'Composite Junior High School Harsinghpur Gova'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'पासवर्ड रीसेट कोड नहीं भेजा जा सका।'
      };
    }

    const expiresAt = data.expiresAt || (Date.now() + 5 * 60 * 1000);
    const cooldownSeconds = data.cooldownSeconds || 45;

    saveActiveSession({
      email: cleanEmail,
      purpose: 'PASSWORD_RESET',
      expiresAt,
      cooldownUntil: Date.now() + cooldownSeconds * 1000,
      verified: false
    });

    return {
      success: true,
      expiresAt,
      cooldownSeconds,
      // Generic privacy message
      message: data.message || 'यदि यह ईमेल पंजीकृत है, तो 6-अंकों का सत्यापन कोड भेज दिया गया है।'
    };
  } catch (err) {
    return {
      success: false,
      error: 'सर्वर से संपर्क नहीं हो सका। कृपया बाद में पुनः प्रयास करें।'
    };
  }
};

/**
 * 4. Verify 6-digit Password Reset OTP and obtain secure Reset Session Token
 */
export const verifyPasswordResetOtpCode = async (
  email: string,
  enteredCode: string
): Promise<{
  success: boolean;
  resetSessionToken?: string;
  error?: string;
  message?: string;
  attemptsRemaining?: number;
}> => {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = (enteredCode || '').toString().trim().replace(/\D/g, '');

  if (!cleanEmail) {
    return { success: false, error: 'पंजीकृत ईमेल पता आवश्यक है।' };
  }

  if (cleanCode.length !== 6) {
    return {
      success: false,
      error: 'कृपया 6 अंकों का सही सत्यापन कोड (OTP) दर्ज करें।'
    };
  }

  try {
    const response = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        code: cleanCode,
        purpose: 'PASSWORD_RESET'
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'गलत सत्यापन कोड। कृपया पुनः प्रयास करें।',
        attemptsRemaining: data.attemptsRemaining
      };
    }

    const resetSessionToken = data.resetSessionToken;
    saveActiveSession({
      email: cleanEmail,
      purpose: 'PASSWORD_RESET',
      expiresAt: Date.now() + 10 * 60 * 1000,
      cooldownUntil: 0,
      verified: true,
      resetSessionToken
    });

    return {
      success: true,
      resetSessionToken,
      message: 'सत्यापन सफल! अब आप अपना नया पासवर्ड दर्ज कर सकते हैं।'
    };
  } catch (err) {
    return {
      success: false,
      error: 'सत्यापन विफल रहा। कृपया पुनः प्रयास करें।'
    };
  }
};

/**
 * 5. Complete Password Reset using Secure Reset Session Token
 */
export const completePasswordResetWithToken = async (
  email: string,
  resetSessionToken: string,
  newPassword: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> => {
  const cleanEmail = normalizeEmail(email);
  console.log('[AUTH-CLIENT] 🔄 [PASSWORD-RESET-SUBMIT]', { email: cleanEmail, resetSessionTokenPrefix: resetSessionToken ? resetSessionToken.substring(0, 8) + '...' : 'none' });

  if (!cleanEmail || !resetSessionToken || !newPassword) {
    return { success: false, error: 'सभी आवश्यक विवरण दर्ज करें।' };
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' };
  }

  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: cleanEmail,
        resetSessionToken,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.warn('[AUTH-CLIENT] ❌ [PASSWORD-RESET-FAIL]', data);
      return {
        success: false,
        error: data.error || 'पासवर्ड सुरक्षित नहीं हो सका। कृपया पुनः प्रयास करें।'
      };
    }

    clearActiveSession();
    console.log('[AUTH-CLIENT] ✅ [PASSWORD-RESET-SUCCESS]', { email: cleanEmail, message: data.message });

    return {
      success: true,
      message: 'पासवर्ड सफलतापूर्वक बदल दिया गया है! अब आप नए पासवर्ड के साथ लॉगिन कर सकते हैं।'
    };
  } catch (err) {
    console.error('[AUTH-CLIENT] ❌ [PASSWORD-RESET-NETWORK-ERROR]', err);
    return {
      success: false,
      error: 'सर्वर त्रुटि। कृपया पुनः प्रयास करें।'
    };
  }
};

/**
 * 6. Authenticated User Session Token Management
 */
export interface UserSessionPayload {
  uid: string;
  username: string;
  role: string;
  email?: string;
  studentId?: string;
  admissionNumber?: string;
  isAfterPasswordReset?: boolean;
}

export const createAuthenticatedSession = async (
  payload: UserSessionPayload
): Promise<{
  success: boolean;
  sessionToken?: string;
  issuedAt?: number;
  expiresAt?: number;
  error?: string;
}> => {
  try {
    console.log('[AUTH-CLIENT] 🎫 [SESSION-CREATE-REQ]', {
      uid: payload.uid,
      username: payload.username,
      role: payload.role,
      studentId: payload.studentId,
      admissionNumber: payload.admissionNumber,
      isAfterPasswordReset: payload.isAfterPasswordReset
    });

    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok && data.success && data.sessionToken) {
      console.log('[AUTH-CLIENT] 🛡️ [SESSION-CREATED-SUCCESS]', {
        tokenPreview: data.sessionToken.substring(0, 10) + '...',
        user: data.user,
        expiresAt: new Date(data.expiresAt).toLocaleString()
      });
      return {
        success: true,
        sessionToken: data.sessionToken,
        issuedAt: data.issuedAt,
        expiresAt: data.expiresAt
      };
    }

    console.warn('[AUTH-CLIENT] ⚠️ [SESSION-CREATE-WARN] Server did not issue token:', data);
    return { success: false, error: data.error || 'Could not issue session token' };
  } catch (e) {
    console.warn('[AUTH-CLIENT] ⚠️ [SESSION-CREATE-FETCH-ERR] Fallback to local session token:', e);
    // Offline/fallback session token generation
    const fallbackToken = `sess_local_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    return { success: true, sessionToken: fallbackToken, issuedAt: Date.now(), expiresAt: Date.now() + 86400000 };
  }
};

export const verifyAuthenticatedSession = async (
  sessionToken: string
): Promise<{
  success: boolean;
  valid: boolean;
  session?: any;
  error?: string;
}> => {
  if (!sessionToken) return { success: false, valid: false };

  try {
    const res = await fetch('/api/auth/verify-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken })
    });
    const data = await res.json();
    console.log('[AUTH-CLIENT] 🔍 [SESSION-VERIFY-RES]', { valid: data.valid, user: data.session?.username });
    return data;
  } catch (e) {
    console.warn('[AUTH-CLIENT] ⚠️ [SESSION-VERIFY-NETWORK-ERR]', e);
    return { success: true, valid: true }; // Permissive fallback if offline
  }
};

export const terminateAuthenticatedSession = async (sessionToken: string): Promise<boolean> => {
  if (!sessionToken) return true;
  try {
    await fetch('/api/auth/logout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken })
    });
    console.log('[AUTH-CLIENT] 🚪 [SESSION-TERMINATED-CLIENT]');
    return true;
  } catch {
    return true;
  }
};

/**
 * Helper to get active pending verification for UI timers
 */
export const getActiveVerificationForEmail = (email: string) => {
  const current = getActiveSession();
  if (current && normalizeEmail(current.email) === normalizeEmail(email) && !current.verified) {
    return current;
  }
  return null;
};

export const getActivePasswordResetForEmail = (email: string) => {
  const current = getActiveSession();
  if (current && current.purpose === 'PASSWORD_RESET' && normalizeEmail(current.email) === normalizeEmail(email)) {
    return current;
  }
  return null;
};
