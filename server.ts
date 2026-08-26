import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Server Secret for Secure HMAC hashing of OTPs and Session Tokens
const OTP_SECRET = process.env.OTP_SECRET || 'sms_gov_in_secure_otp_salt_v4_composite_jhs_farrukhabad_up';

// -------------------------------------------------------------
// Type Definitions
// -------------------------------------------------------------
export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

export interface StoredOtpRecord {
  id: string;
  identifier: string; // normalized email
  otpHash: string;
  salt: string;
  purpose: OtpPurpose;
  expiresAt: number; // timestamp in ms (5 minutes)
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  verified: boolean;
  verifiedAt?: number;
  invalidated: boolean;
  username?: string;
  schoolName?: string;
}

export interface ResetSessionRecord {
  tokenHash: string;
  identifier: string; // normalized email
  username?: string;
  expiresAt: number; // 10 minutes
  used: boolean;
  createdAt: number;
}

export interface RateLimitEntry {
  resendCount: number;
  lastRequestedAt: number;
  windowStart: number;
}

// -------------------------------------------------------------
// In-Memory Secure Storage & Telemetry (No Plaintext OTPs)
// -------------------------------------------------------------
const otpRecordsStore: Map<string, StoredOtpRecord> = new Map();
const resetSessionsStore: Map<string, ResetSessionRecord> = new Map();
const rateLimitsStore: Map<string, RateLimitEntry> = new Map();

// Admin / Monitoring Metrics (No actual OTP values displayed)
export const authMetrics = {
  otpSentCount: 0,
  otpVerifySuccessCount: 0,
  otpVerifyFailureCount: 0,
  otpResendCount: 0,
  otpExpiredCount: 0,
  passwordResetRequestsCount: 0,
  passwordResetSuccessCount: 0,
  passwordResetFailureCount: 0,
  rateLimitEventsCount: 0,
  suspiciousActivityCount: 0
};

// -------------------------------------------------------------
// Security & Cryptographic Helpers
// -------------------------------------------------------------
function hashOtp(code: string, salt: string): string {
  return crypto.createHmac('sha256', OTP_SECRET)
    .update(`${salt}:${code.trim()}`)
    .digest('hex');
}

function generateSecureOtp(): string {
  // Generate random 6-digit numeric OTP (100000 to 999999)
  const randNum = crypto.randomInt(100000, 1000000);
  return randNum.toString();
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// Email Service Abstraction Layer (Nodemailer Transporter)
// -------------------------------------------------------------
let mailTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (mailTransporter) return mailTransporter;

  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false
      }
    });
    console.log(`[Email Service] Configured SMTP Transport`);
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      mailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email Service] Active Fallback Mailer`);
    } catch (e) {
      mailTransporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  return mailTransporter;
}

// Dispatch Professional OTP Email without ANY Clickable Links
async function dispatchOtpEmail(
  to: string,
  purpose: OtpPurpose,
  code: string,
  meta?: { username?: string; schoolName?: string }
): Promise<boolean> {
  const cleanEmail = to.trim().toLowerCase();
  const school = meta?.schoolName || 'Composite Junior High School Harsinghpur Gova';
  const displayName = meta?.username || 'User';
  const fromAddress = process.env.SMTP_FROM || `"Composite JHS School Portal" <no-reply@harsinghpur-gova.gov.in>`;

  const isRegistration = purpose === 'EMAIL_VERIFICATION';
  const emailTitle = isRegistration 
    ? 'Student Email Verification Code' 
    : 'Password Reset Verification Code';
  const badgeText = isRegistration
    ? 'छात्र ईमेल सत्यापन (Student Email Verification)'
    : 'पासवर्ड रीसेट कोड (Password Reset Code)';
  const subject = isRegistration
    ? `Your verification code`
    : `Your password reset code`;
  const plainText = isRegistration
    ? `Your verification code is: ${code}\n\nDo not share this code with anyone.\nThis code is valid for 5 minutes.\n\n${school}`
    : `Your password reset code is: ${code}\n\nDo not share this code with anyone.\nThis code is valid for 5 minutes.\n\n${school}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${emailTitle}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f1f5f9; padding: 32px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background-color: #0f172a; padding: 28px 24px; text-align: center;">
                  <div style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; margin-bottom: 6px;">
                    Basic Education Department, Govt. of Uttar Pradesh
                  </div>
                  <h1 style="color: #ffffff; font-size: 19px; font-weight: 900; margin: 0; line-height: 1.3;">
                    ${school}
                  </h1>
                  <p style="color: #94a3b8; font-size: 11px; margin: 4px 0 0 0; font-family: monospace;">
                    UDISE: 09290205902 • Shamsabad, Farrukhabad (U.P.)
                  </p>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <div style="text-align: center; margin-bottom: 18px;">
                    <span style="display: inline-block; background-color: ${isRegistration ? '#eff6ff' : '#fef2f2'}; color: ${isRegistration ? '#1d4ed8' : '#b91c1c'}; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 9999px; border: 1px solid ${isRegistration ? '#bfdbfe' : '#fecaca'};">
                      ${badgeText}
                    </span>
                  </div>

                  <h2 style="color: #0f172a; font-size: 17px; font-weight: 800; margin: 0 0 10px 0; text-align: center;">
                    नमस्ते, ${displayName}!
                  </h2>

                  <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 22px 0; text-align: center;">
                    ${isRegistration 
                      ? 'आपके छात्र खाते के सत्यापन हेतु 6-अंकों का आधिकारिक वन-टाइम पासवर्ड (OTP) नीचे दिया गया है:' 
                      : 'आपके खाते का पासवर्ड रीसेट करने हेतु 6-अंकों का आधिकारिक सत्यापन कोड (OTP) नीचे दिया गया है:'}
                  </p>

                  <!-- OTP Display Box (NO LINKS) -->
                  <div style="background-color: #f8fafc; border: 2px dashed ${isRegistration ? '#93c5fd' : '#fcd34d'}; border-radius: 12px; padding: 22px 16px; text-align: center; margin-bottom: 24px;">
                    <span style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.2px; display: block; margin-bottom: 8px;">
                      ${isRegistration ? 'Your Verification Code' : 'Your Password Reset Code'}
                    </span>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: ${isRegistration ? '#1e3a8a' : '#b45309'}; background: #ffffff; display: inline-block; padding: 8px 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
                      ${code}
                    </div>
                    <div style="font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 10px;">
                      ⏱️ यह कोड 5 मिनट के लिए मान्य है (Valid for 5 minutes)
                    </div>
                  </div>

                  <!-- Security Advisory -->
                  <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
                    <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
                      <strong>सुरक्षा सूचना (Security Notice):</strong> इस 6-अंकों के कोड को किसी के भी साथ साझा न करें। विद्यालय प्रशासन या पोर्टल कभी भी आपका पासवर्ड या कोड नहीं पूछता है।
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 24px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                    यह एक स्वचालित सुरक्षा प्रणाली संदेश है। कृपया इस ईमेल का उत्तर न दें।<br/>
                    © ${new Date().getFullYear()} Composite JHS Harsinghpur Gova. All Rights Reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: fromAddress,
      to: cleanEmail,
      subject: `[${code}] ${subject} - Composite JHS`,
      text: plainText,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('[Email Service] Mail delivery error:', error);
    authMetrics.suspiciousActivityCount += 1;
    return false;
  }
}

// -------------------------------------------------------------
// Rate Limiter Middleware Helper
// -------------------------------------------------------------
function checkResendRateLimit(email: string): { allowed: boolean; retryAfterSec?: number; error?: string } {
  const now = Date.now();
  const clean = email.trim().toLowerCase();
  const entry = rateLimitsStore.get(clean);

  if (!entry) {
    rateLimitsStore.set(clean, { resendCount: 1, lastRequestedAt: now, windowStart: now });
    return { allowed: true };
  }

  // 15-minute sliding window (900,000 ms)
  const windowMs = 15 * 60 * 1000;
  if (now - entry.windowStart > windowMs) {
    rateLimitsStore.set(clean, { resendCount: 1, lastRequestedAt: now, windowStart: now });
    return { allowed: true };
  }

  // Cooldown check (45 seconds)
  const cooldownSec = 45;
  const timeSinceLastSec = Math.floor((now - entry.lastRequestedAt) / 1000);
  if (timeSinceLastSec < cooldownSec) {
    const remaining = cooldownSec - timeSinceLastSec;
    authMetrics.rateLimitEventsCount += 1;
    return {
      allowed: false,
      retryAfterSec: remaining,
      error: `Please wait ${remaining} seconds before requesting another code.`
    };
  }

  // Excessive resend limit (max 5 resends per 15 min window)
  if (entry.resendCount >= 5) {
    const remainingWindowSec = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
    authMetrics.rateLimitEventsCount += 1;
    return {
      allowed: false,
      retryAfterSec: remainingWindowSec,
      error: 'Too many attempts. Please request a new code later.'
    };
  }

  entry.resendCount += 1;
  entry.lastRequestedAt = now;
  rateLimitsStore.set(clean, entry);
  return { allowed: true };
}

// -------------------------------------------------------------
// 1. Send OTP Endpoint (Registration & Password Reset)
// -------------------------------------------------------------
app.post('/api/auth/send-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, purpose, username, schoolName } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const validPurpose: OtpPurpose = (purpose === 'PASSWORD_RESET') ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION';

    // Check resend rate limits and cooldown
    const rateCheck = checkResendRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      res.status(429).json({
        success: false,
        error: rateCheck.error || 'Please wait before requesting another code.',
        retryAfter: rateCheck.retryAfterSec
      });
      return;
    }

    // Invalidate previous active OTPs for this email and purpose
    const storeKey = `${cleanEmail}:${validPurpose}`;
    const previousRecord = otpRecordsStore.get(storeKey);
    if (previousRecord) {
      previousRecord.invalidated = true;
      otpRecordsStore.set(storeKey, previousRecord);
    }

    // Generate fresh 6-digit OTP & Salt
    const plainOtp = generateSecureOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(plainOtp, salt);
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000; // 5 minutes validity

    const newRecord: StoredOtpRecord = {
      id: `${storeKey}_${now}`,
      identifier: cleanEmail,
      otpHash,
      salt,
      purpose: validPurpose,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      verified: false,
      invalidated: false,
      username: username?.trim() || cleanEmail,
      schoolName: schoolName || 'Composite Junior High School Harsinghpur Gova'
    };

    otpRecordsStore.set(storeKey, newRecord);
    authMetrics.otpSentCount += 1;
    if (validPurpose === 'PASSWORD_RESET') {
      authMetrics.passwordResetRequestsCount += 1;
    }

    // Dispatch live email in background
    await dispatchOtpEmail(cleanEmail, validPurpose, plainOtp, {
      username: username?.trim() || cleanEmail,
      schoolName
    });

    // Forgot Password Privacy: Always generic response
    const userMessage = validPurpose === 'PASSWORD_RESET'
      ? 'If an account exists for this email, a verification code has been sent.'
      : `Verification code sent to your email. Valid for 5 minutes.`;

    // NEVER return actual OTP in response
    res.json({
      success: true,
      message: userMessage,
      expiresAt,
      cooldownSeconds: 45
    });
  } catch (error: any) {
    console.error('[API /api/auth/send-otp] Internal error:', error);
    res.status(500).json({
      success: false,
      error: "We couldn't send the verification code right now. Please try again later."
    });
  }
});

// -------------------------------------------------------------
// 2. Verify OTP Endpoint
// -------------------------------------------------------------
app.post('/api/auth/verify-otp', (req: Request, res: Response): void => {
  try {
    const { email, code, purpose } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanCode = (code || '').toString().trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      res.status(400).json({ success: false, error: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const validPurpose: OtpPurpose = (purpose === 'PASSWORD_RESET') ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION';
    const storeKey = `${cleanEmail}:${validPurpose}`;
    const record = otpRecordsStore.get(storeKey);

    if (!record || record.invalidated) {
      authMetrics.otpVerifyFailureCount += 1;
      res.status(400).json({
        success: false,
        error: 'Incorrect verification code. Please try again.'
      });
      return;
    }

    // Check expiry
    const now = Date.now();
    if (now > record.expiresAt) {
      authMetrics.otpExpiredCount += 1;
      record.invalidated = true;
      otpRecordsStore.set(storeKey, record);
      res.status(400).json({
        success: false,
        error: 'This verification code has expired. Please request a new code.'
      });
      return;
    }

    // Check max attempts
    if (record.attempts >= record.maxAttempts) {
      authMetrics.otpVerifyFailureCount += 1;
      record.invalidated = true;
      otpRecordsStore.set(storeKey, record);
      res.status(429).json({
        success: false,
        error: 'Too many attempts. Please request a new code later.'
      });
      return;
    }

    // Compare Hash securely
    const computedHash = hashOtp(cleanCode, record.salt);
    const isMatch = safeCompare(computedHash, record.otpHash);

    if (!isMatch) {
      record.attempts += 1;
      const remainingAttempts = Math.max(0, record.maxAttempts - record.attempts);
      authMetrics.otpVerifyFailureCount += 1;

      if (remainingAttempts === 0) {
        record.invalidated = true;
        otpRecordsStore.set(storeKey, record);
        res.status(429).json({
          success: false,
          error: 'Too many attempts. Please request a new code later.'
        });
        return;
      }

      otpRecordsStore.set(storeKey, record);
      res.status(400).json({
        success: false,
        error: 'Incorrect verification code. Please try again.',
        attemptsRemaining: remainingAttempts
      });
      return;
    }

    // SUCCESS! Mark single-use and invalidate OTP
    record.verified = true;
    record.verifiedAt = now;
    record.invalidated = true; // Cannot be reused
    otpRecordsStore.set(storeKey, record);
    authMetrics.otpVerifySuccessCount += 1;

    let resetSessionToken: string | undefined = undefined;

    // If Password Reset, create a short-lived secure reset token (10 mins)
    if (validPurpose === 'PASSWORD_RESET') {
      const rawToken = generateSessionToken();
      const tokenHash = hashSessionToken(rawToken);
      const sessionExpiresAt = now + 10 * 60 * 1000; // 10 minutes

      resetSessionsStore.set(tokenHash, {
        tokenHash,
        identifier: cleanEmail,
        username: record.username,
        expiresAt: sessionExpiresAt,
        used: false,
        createdAt: now
      });

      resetSessionToken = rawToken;
    }

    res.json({
      success: true,
      message: 'Code verified successfully.',
      purpose: validPurpose,
      email: cleanEmail,
      resetSessionToken
    });
  } catch (error: any) {
    console.error('[API /api/auth/verify-otp] Internal error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify code. Please try again.' });
  }
});

// -------------------------------------------------------------
// 3. Reset Password with Secure Token Endpoint
// -------------------------------------------------------------
app.post('/api/auth/reset-password', (req: Request, res: Response): void => {
  try {
    const { email, resetSessionToken, newPassword } = req.body;

    if (!email || !resetSessionToken || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Email, valid reset session token, and new password are required.'
      });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters.'
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const tokenHash = hashSessionToken(resetSessionToken.trim());
    const session = resetSessionsStore.get(tokenHash);

    if (!session || session.used || session.identifier !== cleanEmail) {
      authMetrics.passwordResetFailureCount += 1;
      res.status(403).json({
        success: false,
        error: 'Invalid or expired password reset session. Please request a new code.'
      });
      return;
    }

    // Check expiration (10 minutes)
    if (Date.now() > session.expiresAt) {
      authMetrics.passwordResetFailureCount += 1;
      resetSessionsStore.delete(tokenHash);
      res.status(403).json({
        success: false,
        error: 'Password reset session has expired. Please request a new code.'
      });
      return;
    }

    // Mark token as used immediately (Single-use)
    session.used = true;
    resetSessionsStore.delete(tokenHash); // Invalidate token

    authMetrics.passwordResetSuccessCount += 1;

    res.json({
      success: true,
      message: 'Password successfully changed. You can now login with your new password.',
      email: cleanEmail
    });
  } catch (error: any) {
    console.error('[API /api/auth/reset-password] Internal error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password. Please try again.' });
  }
});

// -------------------------------------------------------------
// 4. Admin / Telemetry Metrics Endpoint (NO Plaintext OTPs)
// -------------------------------------------------------------
app.get('/api/auth/metrics', (req: Request, res: Response) => {
  res.json({
    success: true,
    metrics: {
      ...authMetrics,
      activePendingOtpsCount: Array.from(otpRecordsStore.values()).filter(r => !r.invalidated && Date.now() < r.expiresAt).length,
      activeResetSessionsCount: Array.from(resetSessionsStore.values()).filter(s => !s.used && Date.now() < s.expiresAt).length
    },
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// Backward Compatibility Handlers for legacy endpoints
// (Rewired to use secure hashing and no leaks)
// -------------------------------------------------------------
app.post('/api/send-otp-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, studentName, studentId, schoolName } = req.body;
    if (!to || !to.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }
    const cleanEmail = to.trim().toLowerCase();
    const rateCheck = checkResendRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      res.status(429).json({ success: false, error: rateCheck.error, retryAfter: rateCheck.retryAfterSec });
      return;
    }

    const storeKey = `${cleanEmail}:EMAIL_VERIFICATION`;
    const plainOtp = generateSecureOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(plainOtp, salt);
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000;

    otpRecordsStore.set(storeKey, {
      id: `${storeKey}_${now}`,
      identifier: cleanEmail,
      otpHash,
      salt,
      purpose: 'EMAIL_VERIFICATION',
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      verified: false,
      invalidated: false,
      username: studentName || 'Student',
      schoolName: schoolName || 'Composite Junior High School Harsinghpur Gova'
    });
    authMetrics.otpSentCount += 1;

    await dispatchOtpEmail(cleanEmail, 'EMAIL_VERIFICATION', plainOtp, {
      username: studentName,
      schoolName
    });

    res.json({
      success: true,
      message: 'Verification code sent to your email.',
      expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/api/send-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, username, schoolName } = req.body;
    if (!to || !to.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email is required.' });
      return;
    }
    const cleanEmail = to.trim().toLowerCase();
    const rateCheck = checkResendRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      res.status(429).json({ success: false, error: rateCheck.error, retryAfter: rateCheck.retryAfterSec });
      return;
    }

    const storeKey = `${cleanEmail}:PASSWORD_RESET`;
    const plainOtp = generateSecureOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(plainOtp, salt);
    const now = Date.now();
    const expiresAt = now + 5 * 60 * 1000;

    otpRecordsStore.set(storeKey, {
      id: `${storeKey}_${now}`,
      identifier: cleanEmail,
      otpHash,
      salt,
      purpose: 'PASSWORD_RESET',
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      verified: false,
      invalidated: false,
      username: username || 'User',
      schoolName: schoolName || 'Composite Junior High School Harsinghpur Gova'
    });
    authMetrics.otpSentCount += 1;
    authMetrics.passwordResetRequestsCount += 1;

    await dispatchOtpEmail(cleanEmail, 'PASSWORD_RESET', plainOtp, {
      username,
      schoolName
    });

    // Generic response for privacy
    res.json({
      success: true,
      message: 'If an account exists for this email, a verification code has been sent.',
      expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Internal error' });
  }
});

app.post('/api/verify-reset-otp', (req: Request, res: Response): void => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = (code || '').toString().trim().replace(/\D/g, '');
  const storeKey = `${cleanEmail}:PASSWORD_RESET`;
  const record = otpRecordsStore.get(storeKey);

  if (!record || record.invalidated) {
    res.status(400).json({ success: false, error: 'Incorrect verification code. Please try again.' });
    return;
  }

  if (Date.now() > record.expiresAt) {
    record.invalidated = true;
    res.status(400).json({ success: false, error: 'This verification code has expired. Please request a new code.' });
    return;
  }

  const computedHash = hashOtp(cleanCode, record.salt);
  if (!safeCompare(computedHash, record.otpHash)) {
    record.attempts += 1;
    const remaining = Math.max(0, record.maxAttempts - record.attempts);
    if (remaining === 0) record.invalidated = true;
    res.status(400).json({
      success: false,
      error: 'Incorrect verification code. Please try again.',
      attemptsRemaining: remaining
    });
    return;
  }

  record.verified = true;
  record.invalidated = true;
  const rawToken = generateSessionToken();
  const tokenHash = hashSessionToken(rawToken);
  resetSessionsStore.set(tokenHash, {
    tokenHash,
    identifier: cleanEmail,
    username: record.username,
    expiresAt: Date.now() + 10 * 60 * 1000,
    used: false,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    message: 'OTP verified successfully.',
    email: cleanEmail,
    resetSessionToken: rawToken
  });
});

// API Route: Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vite Middleware for Development / Static Hosting in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Management System Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
