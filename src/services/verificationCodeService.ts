import { db, doc, setDoc, getDoc, updateDoc } from '../lib/firebase';
import { normalizeEmail } from '../utils/authErrorUtils';

export interface EmailVerificationRecord {
  id: string;
  email: string;
  code: string;
  studentName?: string;
  studentId?: string;
  uid?: string;
  createdAt: string;
  expiresAt: number; // timestamp in ms
  attempts: number;
  maxAttempts: number;
  verified: boolean;
  verifiedAt?: string;
}

const LOCAL_STORAGE_VERIFICATIONS_KEY = 'sms_gov_email_verifications';

// Helper to get local records
const getLocalVerifications = (): Record<string, EmailVerificationRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_VERIFICATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

// Helper to save local records
const saveLocalVerifications = (data: Record<string, EmailVerificationRecord>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_VERIFICATIONS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save local verification records:', e);
  }
};

// Generate a safe document key for email
export const getEmailDocId = (email: string): string => {
  return normalizeEmail(email).replace(/[^a-zA-Z0-9_-]/g, '_');
};

/**
 * Generate a 6-digit numeric verification code (OTP)
 */
export const generate6DigitCode = (): string => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return num.toString();
};

/**
 * Create and dispatch a 6-digit verification code to the student's email
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
  code?: string;
  expiresAt?: number;
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

  const code = generate6DigitCode();
  const now = Date.now();
  const expiryDurationMs = 10 * 60 * 1000; // 10 minutes
  const expiresAt = now + expiryDurationMs;
  const docId = getEmailDocId(cleanEmail);

  const verificationRecord: EmailVerificationRecord = {
    id: docId,
    email: cleanEmail,
    code,
    studentName: options?.studentName || 'Student',
    studentId: options?.studentId,
    uid: options?.uid,
    createdAt: new Date().toISOString(),
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    verified: false
  };

  // 1. Save to localStorage for ultra-fast fallback & instant preview
  const localMap = getLocalVerifications();
  localMap[cleanEmail] = verificationRecord;
  saveLocalVerifications(localMap);

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'emailVerifications', docId), verificationRecord, { merge: true });
  } catch (err) {
    console.warn('Firestore email verification save warning (using local fallback):', err);
  }

  // 3. Dispatch Live OTP Email via Backend API (/api/send-otp-email)
  try {
    const apiRes = await fetch('/api/send-otp-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cleanEmail,
        studentName: options?.studentName || 'Student',
        code,
        studentId: options?.studentId,
        schoolName: 'Composite Junior High School Harsinghpur Gova'
      })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('[OTP Service] Backend mailer responded:', data);
    }
  } catch (apiErr) {
    console.warn('[OTP Service] Backend email API dispatch notice:', apiErr);
  }

  // 4. Dispatch official custom event for in-app instant alert toast & demo assistant
  try {
    const event = new CustomEvent('sms:student_verification_code_dispatched', {
      detail: {
        email: cleanEmail,
        code,
        studentName: options?.studentName,
        expiresAt,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  } catch (e) {
    // ignore
  }

  return {
    success: true,
    code,
    expiresAt,
    message: `6-अंकों का सत्यापन कोड (${cleanEmail}) पर भेज दिया गया है। यह कोड 10 मिनट के लिए मान्य है।`
  };
};

/**
 * Validate the 6-digit verification code entered by student
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
  const cleanCode = (enteredCode || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'ईमेल पता आवश्यक है।' };
  }

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      error: 'कृपया 6 अंकों का सही सत्यापन कोड दर्ज करें (Please enter 6-digit numeric OTP).'
    };
  }

  const docId = getEmailDocId(cleanEmail);
  let record: EmailVerificationRecord | null = null;

  // 1. Try fetching from Firestore
  try {
    const snap = await getDoc(doc(db, 'emailVerifications', docId));
    if (snap.exists()) {
      record = snap.data() as EmailVerificationRecord;
    }
  } catch (e) {
    console.warn('Could not read emailVerifications from Firestore, checking local storage:', e);
  }

  // 2. Fallback to localStorage
  if (!record) {
    const localMap = getLocalVerifications();
    record = localMap[cleanEmail] || null;
  }

  if (!record) {
    return {
      success: false,
      error: 'इस ईमेल के लिए कोई सक्रिय सत्यापन कोड नहीं मिला। कृपया "कोड पुनः भेजें" पर क्लिक करें।'
    };
  }

  // 3. Check expiration
  const now = Date.now();
  if (now > record.expiresAt) {
    return {
      success: false,
      error: 'सत्यापन कोड की समय सीमा (10 मिनट) समाप्त हो चुकी है। कृपया नया कोड प्राप्त करने के लिए "कोड पुनः भेजें" पर क्लिक करें।'
    };
  }

  // 4. Check max attempts
  if (record.attempts >= record.maxAttempts) {
    return {
      success: false,
      error: 'अधिकतम गलत प्रयासों (5 बार) के कारण यह कोड अवरुद्ध कर दिया गया है। कृपया नया सत्यापन कोड अनुरोध करें।'
    };
  }

  // 5. Compare Code
  if (record.code !== cleanCode) {
    const newAttempts = (record.attempts || 0) + 1;
    const remaining = Math.max(0, record.maxAttempts - newAttempts);
    
    // Update attempts in local & firestore
    record.attempts = newAttempts;
    const localMap = getLocalVerifications();
    localMap[cleanEmail] = record;
    saveLocalVerifications(localMap);

    try {
      await updateDoc(doc(db, 'emailVerifications', docId), { attempts: newAttempts });
    } catch {
      // ignore
    }

    return {
      success: false,
      attemptsRemaining: remaining,
      error: remaining > 0 
        ? `गलत सत्यापन कोड! आपके पास ${remaining} प्रयास शेष हैं।`
        : 'गलत कोड। कृपया नया कोड प्राप्त करने के लिए "कोड पुनः भेजें" पर क्लिक करें।'
    };
  }

  // 6. SUCCESS! Mark record as verified
  const verifiedTimestamp = new Date().toISOString();
  record.verified = true;
  record.verifiedAt = verifiedTimestamp;

  const localMap = getLocalVerifications();
  localMap[cleanEmail] = record;
  saveLocalVerifications(localMap);

  try {
    await updateDoc(doc(db, 'emailVerifications', docId), {
      verified: true,
      verifiedAt: verifiedTimestamp
    });
  } catch (e) {
    console.warn('Could not update verified flag in Firestore:', e);
  }

  // 7. Update Student/User record in Firestore if UID is available
  const studentUid = options?.uid || record.uid;
  if (studentUid) {
    try {
      await setDoc(doc(db, 'users', studentUid), { emailVerified: true, isApproved: true, status: 'active', updatedAt: verifiedTimestamp }, { merge: true });
      await setDoc(doc(db, 'students', studentUid), { emailVerified: true, status: 'active', updatedAt: verifiedTimestamp }, { merge: true });
    } catch (e) {
      console.warn('Could not update student status in Firestore:', e);
    }
  }

  // 8. Update localStorage lists
  try {
    const localStudentsRaw = localStorage.getItem('sms_gov_students');
    if (localStudentsRaw) {
      const studentsList: any[] = JSON.parse(localStudentsRaw);
      const updated = studentsList.map(s => {
        if ((s.email && normalizeEmail(s.email) === cleanEmail) || (studentUid && (s.id === studentUid || s.uid === studentUid))) {
          return { ...s, emailVerified: true, status: 'active' };
        }
        return s;
      });
      localStorage.setItem('sms_gov_students', JSON.stringify(updated));
    }

    const currentProfileRaw = localStorage.getItem('sms_gova_current_user_profile_v3');
    if (currentProfileRaw) {
      const p = JSON.parse(currentProfileRaw);
      if (p && (normalizeEmail(p.email) === cleanEmail || (studentUid && p.uid === studentUid))) {
        p.emailVerified = true;
        p.isApproved = true;
        localStorage.setItem('sms_gova_current_user_profile_v3', JSON.stringify(p));
      }
    }
  } catch (e) {
    // ignore
  }

  if (options?.onSuccessCallback) {
    options.onSuccessCallback();
  }

  return {
    success: true,
    message: 'बधाई हो! छात्र ईमेल एवं खाता सफलतापूर्वक सत्यापित हो गया है।'
  };
};

/**
 * Get active pending verification record for an email
 */
export const getActiveVerificationForEmail = (email: string): EmailVerificationRecord | null => {
  const clean = normalizeEmail(email);
  if (!clean) return null;
  const localMap = getLocalVerifications();
  const rec = localMap[clean];
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) return null;
  return rec;
};

// ==========================================
// Password Reset OTP Services (via SMTP)
// ==========================================

export interface PasswordResetOtpRecord {
  id: string;
  email: string;
  code: string;
  username?: string;
  role?: string;
  createdAt: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  verified: boolean;
  verifiedAt?: string;
}

const LOCAL_STORAGE_RESET_OTPS_KEY = 'sms_gov_password_reset_otps';

const getLocalResetOtps = (): Record<string, PasswordResetOtpRecord> => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RESET_OTPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLocalResetOtps = (data: Record<string, PasswordResetOtpRecord>) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_RESET_OTPS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save local reset OTPs:', e);
  }
};

/**
 * Dispatch 6-digit Password Reset OTP to registered email via SMTP
 */
export const sendPasswordResetOtpEmail = async (
  email: string,
  options?: {
    username?: string;
    role?: string;
  }
): Promise<{
  success: boolean;
  code?: string;
  expiresAt?: number;
  error?: string;
  message?: string;
}> => {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      error: 'कृपया एक मान्य पंजीकृत ईमेल पता दर्ज करें (Please provide a valid email address).'
    };
  }

  const code = generate6DigitCode();
  const now = Date.now();
  const expiryDurationMs = 10 * 60 * 1000; // 10 minutes
  const expiresAt = now + expiryDurationMs;
  const docId = getEmailDocId(cleanEmail);

  const resetRecord: PasswordResetOtpRecord = {
    id: docId,
    email: cleanEmail,
    code,
    username: options?.username || cleanEmail,
    role: options?.role || 'student',
    createdAt: new Date().toISOString(),
    expiresAt,
    attempts: 0,
    maxAttempts: 5,
    verified: false
  };

  // 1. Save locally for instant access & fallback
  const localMap = getLocalResetOtps();
  localMap[cleanEmail] = resetRecord;
  saveLocalResetOtps(localMap);

  // 2. Persist to Firestore
  try {
    await setDoc(doc(db, 'passwordResetOtps', docId), resetRecord, { merge: true });
  } catch (err) {
    console.warn('Firestore passwordResetOtps save warning (using local cache):', err);
  }

  // 3. Dispatch Live Password Reset Email via SMTP Endpoint
  try {
    const apiRes = await fetch('/api/send-reset-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: cleanEmail,
        username: options?.username || cleanEmail,
        code,
        role: options?.role || 'student',
        schoolName: 'Composite Junior High School Harsinghpur Gova'
      })
    });
    if (apiRes.ok) {
      const data = await apiRes.json();
      console.log('[Password Reset SMTP] Server response:', data);
    }
  } catch (apiErr) {
    console.warn('[Password Reset SMTP] Server dispatch warning:', apiErr);
  }

  // 4. Dispatch event for UI notifications
  try {
    const event = new CustomEvent('sms:password_reset_otp_dispatched', {
      detail: {
        email: cleanEmail,
        code,
        username: options?.username,
        expiresAt,
        timestamp: new Date().toISOString()
      }
    });
    window.dispatchEvent(event);
  } catch {
    // ignore
  }

  return {
    success: true,
    code,
    expiresAt,
    message: `6-अंकों का पासवर्ड रीसेट कोड आपके ईमेल (${cleanEmail}) पर भेज दिया गया है।`
  };
};

/**
 * Verify 6-digit Password Reset OTP
 */
export const verifyPasswordResetOtpCode = async (
  email: string,
  enteredCode: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  attemptsRemaining?: number;
}> => {
  const cleanEmail = normalizeEmail(email);
  const cleanCode = (enteredCode || '').trim();

  if (!cleanEmail) {
    return { success: false, error: 'पंजीकृत ईमेल पता आवश्यक है।' };
  }

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      error: 'कृपया 6 अंकों का सही पासवर्ड रीसेट कोड (OTP) दर्ज करें।'
    };
  }

  const docId = getEmailDocId(cleanEmail);
  let record: PasswordResetOtpRecord | null = null;

  // 1. Try Firestore
  try {
    const snap = await getDoc(doc(db, 'passwordResetOtps', docId));
    if (snap.exists()) {
      record = snap.data() as PasswordResetOtpRecord;
    }
  } catch (e) {
    console.warn('Could not read passwordResetOtps from Firestore, checking local storage:', e);
  }

  // 2. Fallback to localStorage
  if (!record) {
    const localMap = getLocalResetOtps();
    record = localMap[cleanEmail] || null;
  }

  if (!record) {
    return {
      success: false,
      error: 'इस ईमेल के लिए कोई सक्रिय पासवर्ड रीसेट कोड नहीं मिला। कृपया पुनः अनुरोध करें।'
    };
  }

  // 3. Check expiration
  if (Date.now() > record.expiresAt) {
    return {
      success: false,
      error: 'पासवर्ड रीसेट कोड की समय सीमा (10 मिनट) समाप्त हो चुकी है। कृपया नया कोड प्राप्त करें।'
    };
  }

  // 4. Check max attempts
  if (record.attempts >= record.maxAttempts) {
    return {
      success: false,
      error: 'अधिकतम गलत प्रयासों (5 बार) के कारण यह कोड अमान्य कर दिया गया है। कृपया नया कोड अनुरोध करें।'
    };
  }

  // 5. Compare Code
  if (record.code !== cleanCode) {
    const newAttempts = (record.attempts || 0) + 1;
    const remaining = Math.max(0, record.maxAttempts - newAttempts);
    
    record.attempts = newAttempts;
    const localMap = getLocalResetOtps();
    localMap[cleanEmail] = record;
    saveLocalResetOtps(localMap);

    try {
      await updateDoc(doc(db, 'passwordResetOtps', docId), { attempts: newAttempts });
    } catch {}

    return {
      success: false,
      attemptsRemaining: remaining,
      error: remaining > 0 
        ? `गलत OTP कोड! आपके पास ${remaining} प्रयास शेष हैं।`
        : 'गलत कोड। कृपया नया कोड पुनः भेजें।'
    };
  }

  // 6. Success
  const verifiedTimestamp = new Date().toISOString();
  record.verified = true;
  record.verifiedAt = verifiedTimestamp;

  const localMap = getLocalResetOtps();
  localMap[cleanEmail] = record;
  saveLocalResetOtps(localMap);

  try {
    await updateDoc(doc(db, 'passwordResetOtps', docId), {
      verified: true,
      verifiedAt: verifiedTimestamp
    });
  } catch {}

  return {
    success: true,
    message: 'OTP सफलतापूर्वक सत्यापित हो गया है। अब आप अपना नया पासवर्ड सेट कर सकते हैं।'
  };
};

/**
 * Get active pending password reset OTP for email
 */
export const getActivePasswordResetForEmail = (email: string): PasswordResetOtpRecord | null => {
  const clean = normalizeEmail(email);
  if (!clean) return null;
  const localMap = getLocalResetOtps();
  const rec = localMap[clean];
  if (!rec) return null;
  if (Date.now() > rec.expiresAt) return null;
  return rec;
};
