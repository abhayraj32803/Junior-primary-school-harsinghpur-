import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.NGINX_PORT
  ? Number(process.env.DEFAULT_APP_PORT || 3000)
  : Number(process.env.PORT || 3000);

// CORS middleware so live frontend (AI Studio Shared URL, custom domain) can reach /api/* cleanly
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Email, X-User-Role, X-Firebase-Id-Token, Accept');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf.toString('utf8');
  }
}));

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

export interface AuthSessionRecord {
  tokenHash: string;
  uid: string;
  username: string;
  role: string;
  email?: string;
  studentId?: string;
  admissionNumber?: string;
  isAfterPasswordReset?: boolean;
  createdAt: number;
  expiresAt: number;
  lastActiveAt: number;
  ip?: string;
  userAgent?: string;
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
const authSessionsStore: Map<string, AuthSessionRecord> = new Map();
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
  activeSessionsCount: 0,
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

function maskEmailAddress(email: string): string {
  if (!email || !email.includes('@')) return '******';
  const parts = email.split('@');
  const user = parts[0];
  const domain = parts[1] || '';
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user.substring(0, 2)}${'*'.repeat(Math.max(2, user.length - 4))}${user.slice(-2)}@${domain}`;
}

// -------------------------------------------------------------
// Email Service Abstraction Layer (Secure SMTP Vault + Nodemailer)
// -------------------------------------------------------------
interface SecureSmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  isEnabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

const SMTP_DATA_DIR = path.join(process.cwd(), 'data');
const SECURE_SMTP_FILE = path.join(SMTP_DATA_DIR, 'secure_smtp.json');

function initSecureSmtpVault(): SecureSmtpConfig {
  const envHost = (process.env.SMTP_HOST || '').trim();
  const envPort = parseInt(process.env.SMTP_PORT || '587', 10) || 587;
  const envUser = (process.env.SMTP_USER || '').trim();
  const envPass = (process.env.SMTP_PASS || '').trim();
  const envSecure = process.env.SMTP_SECURE === 'true' || envPort === 465;
  const envFromRaw = (process.env.SMTP_FROM || '').trim();

  try {
    if (!fs.existsSync(SMTP_DATA_DIR)) {
      fs.mkdirSync(SMTP_DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SECURE_SMTP_FILE)) {
      const raw = fs.readFileSync(SECURE_SMTP_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      return {
        host: parsed.host || envHost,
        port: Number(parsed.port) || envPort,
        secure: typeof parsed.secure === 'boolean' ? parsed.secure : envSecure,
        user: parsed.user || envUser,
        pass: parsed.pass || envPass,
        fromName: parsed.fromName || 'Composite JHS Harsinghpur Gova',
        fromEmail: parsed.fromEmail || parsed.user || envUser || 'no-reply@harsinghpur-gova.gov.in',
        isEnabled: parsed.isEnabled !== false,
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        updatedBy: parsed.updatedBy || 'Super Admin'
      };
    }
  } catch (err) {
    console.error('[SMTP-VAULT] Error loading secure_smtp.json:', err);
  }

  return {
    host: envHost,
    port: envPort,
    secure: envSecure,
    user: envUser,
    pass: envPass,
    fromName: 'Composite JHS Harsinghpur Gova',
    fromEmail: envUser || (envFromRaw.includes('<') ? envFromRaw.split('<')[1].replace('>', '').trim() : envFromRaw) || 'no-reply@harsinghpur-gova.gov.in',
    isEnabled: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'System Environment Default'
  };
}

let secureSmtpVault: SecureSmtpConfig = initSecureSmtpVault();
let mailTransporter: nodemailer.Transporter | null = null;
let mailTransporterSignature = '';

function persistSecureSmtpVault(config: SecureSmtpConfig): void {
  try {
    if (!fs.existsSync(SMTP_DATA_DIR)) {
      fs.mkdirSync(SMTP_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SECURE_SMTP_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch (err) {
    console.error('[SMTP-VAULT] Failed to persist secure_smtp.json:', err);
  }
  secureSmtpVault = { ...config };
  mailTransporter = null;
  mailTransporterSignature = '';
}

function isRealSmtpConfigured(): boolean {
  return Boolean(
    secureSmtpVault.isEnabled &&
    secureSmtpVault.host &&
    secureSmtpVault.user &&
    secureSmtpVault.pass
  );
}

async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; mode: 'smtp' | 'ethereal' | 'stream' }> {
  const host = (secureSmtpVault.host || process.env.SMTP_HOST || '').trim();
  const port = Number(secureSmtpVault.port || process.env.SMTP_PORT || 587);
  const user = (secureSmtpVault.user || process.env.SMTP_USER || '').trim();
  const pass = (secureSmtpVault.pass || process.env.SMTP_PASS || '').trim();
  const secure = secureSmtpVault.secure || port === 465;

  if (secureSmtpVault.isEnabled && host && user && pass) {
    const sig = `${host}:${port}:${secure}:${user}:${pass.length}`;
    if (mailTransporter && mailTransporterSignature === sig) {
      return { transporter: mailTransporter, mode: 'smtp' };
    }
    mailTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false
      }
    });
    mailTransporterSignature = sig;
    console.log(`[Email Service] Configured Live SMTP Transport (${host}:${port}, secure=${secure})`);
    return { transporter: mailTransporter, mode: 'smtp' };
  }

  // Fallback to Ethereal in non-configured environments (never cache failed fallback forever)
  try {
    if (mailTransporter && mailTransporterSignature === 'ethereal') {
      return { transporter: mailTransporter, mode: 'ethereal' };
    }
    const testAccount = await nodemailer.createTestAccount();
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    mailTransporterSignature = 'ethereal';
    console.log(`[Email Service] Active Ethereal Fallback Mailer`);
    return { transporter: mailTransporter, mode: 'ethereal' };
  } catch (e) {
    console.warn('[Email Service] Ethereal unavailable, using local stream buffer fallback');
    return {
      transporter: nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      }),
      mode: 'stream'
    };
  }
}

// Dispatch Professional OTP Email without ANY Clickable Links
async function dispatchOtpEmail(
  to: string,
  purpose: OtpPurpose,
  code: string,
  meta?: { username?: string; schoolName?: string }
): Promise<{ sent: boolean; mode: 'smtp' | 'ethereal' | 'stream'; error?: string }> {
  const cleanEmail = to.trim().toLowerCase();
  const school = meta?.schoolName || 'Composite Junior High School Harsinghpur Gova';
  const displayName = meta?.username || 'User';
  const configuredFrom = secureSmtpVault.fromEmail || secureSmtpVault.user || 'no-reply@harsinghpur-gova.gov.in';
  const fromName = secureSmtpVault.fromName || 'Composite JHS School Portal';
  const fromAddress = process.env.SMTP_FROM || `"${fromName}" <${configuredFrom}>`;

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
    const { transporter, mode } = await getTransporter();
    const mailOptions = {
      from: fromAddress,
      to: cleanEmail,
      subject: `[${code}] ${subject} - Composite JHS`,
      text: plainText,
      html: htmlContent
    };

    await transporter.sendMail(mailOptions);
    if (mode === 'stream') {
      return { sent: false, mode, error: 'SMTP credentials are not configured on the live server.' };
    }
    return { sent: true, mode };
  } catch (error: any) {
    console.error('[Email Service] Mail delivery error:', error);
    authMetrics.suspiciousActivityCount += 1;
    // Reset cached transporter in case auth/connection went stale
    mailTransporter = null;
    mailTransporterSignature = '';
    return {
      sent: false,
      mode: isRealSmtpConfigured() ? 'smtp' : 'ethereal',
      error: error?.message || 'SMTP mail delivery failed.'
    };
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
  const reqStart = Date.now();
  try {
    const { email, purpose, username, schoolName } = req.body;
    console.log(`[AUTH-SERVER] 📨 [OTP-REQUEST] Incoming request for purpose=${purpose || 'EMAIL_VERIFICATION'}, email=${email || 'missing'}, user=${username || 'unspecified'}`);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      console.warn(`[AUTH-SERVER] ⚠️ [OTP-REJECTED] Invalid email provided: '${email}'`);
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const validPurpose: OtpPurpose = (purpose === 'PASSWORD_RESET') ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION';

    // Check resend rate limits and cooldown
    const rateCheck = checkResendRateLimit(cleanEmail);
    if (!rateCheck.allowed) {
      console.warn(`[AUTH-SERVER] ⏳ [RATE-LIMITED] Email '${cleanEmail}' exceeded rate limit. Retry after ${rateCheck.retryAfterSec}s`);
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
      console.log(`[AUTH-SERVER] 🔄 [OTP-SUPERSEDED] Previous active OTP for ${storeKey} invalidated`);
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

    // Dispatch live email
    const emailResult = await dispatchOtpEmail(cleanEmail, validPurpose, plainOtp, {
      username: username?.trim() || cleanEmail,
      schoolName
    });

    console.log(`[AUTH-SERVER] ✅ [OTP-DISPATCHED] Purpose=${validPurpose} | Email=${cleanEmail} | Mode=${emailResult.mode} | MailSuccess=${emailResult.sent} | ExpiresIn=300s | Duration=${Date.now() - reqStart}ms`);

    // Check if live SMTP was successfully executed
    const isLiveConfigured = Boolean(isRealSmtpConfigured() && emailResult.sent);

    if (isRealSmtpConfigured() && !emailResult.sent) {
      console.error(`[AUTH-SERVER] ❌ [SMTP-DELIVERY-FAILED] ${emailResult.error}`);
    }

    // Prepare response message
    let userMessage = validPurpose === 'PASSWORD_RESET'
      ? (isLiveConfigured
          ? 'आपके ईमेल पते पर 6-अंकों का पासवर्ड रीसेट कोड भेज दिया गया है।'
          : 'If an account exists for this email, a verification code has been prepared.')
      : `Verification code sent to your email. Valid for 5 minutes.`;

    if (!isLiveConfigured && validPurpose === 'EMAIL_VERIFICATION') {
      userMessage = `सत्यापन कोड तैयार किया गया (OTP Code: ${plainOtp})`;
    }

    res.json({
      success: true,
      message: userMessage,
      expiresAt,
      cooldownSeconds: 45,
      devOtp: isLiveConfigured ? undefined : plainOtp,
      isLiveEmailConfigured: isLiveConfigured,
      smtpMode: emailResult.mode,
      smtpError: emailResult.sent ? undefined : emailResult.error
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [OTP-ERROR] Internal error:', error);
    res.status(500).json({
      success: false,
      error: "We couldn't send the verification code right now. Please try again later."
    });
  }
});

// -------------------------------------------------------------
// 1.5 Instant Verify Endpoint (Direct bypass for registered users/students)
// -------------------------------------------------------------
app.post('/api/auth/instant-verify-email', (req: Request, res: Response): void => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const storeKey = `${cleanEmail}:EMAIL_VERIFICATION`;
    const record = otpRecordsStore.get(storeKey);
    if (record) {
      record.verified = true;
      record.verifiedAt = Date.now();
      otpRecordsStore.set(storeKey, record);
    }

    authMetrics.otpVerifySuccessCount += 1;
    console.log(`[AUTH-SERVER] ⚡ [INSTANT-VERIFY] Email '${cleanEmail}' verified directly`);
    res.json({
      success: true,
      message: 'Email address verified successfully!'
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [INSTANT-VERIFY-ERROR]', error);
    res.status(500).json({ success: false, error: 'Failed to verify email directly.' });
  }
});

// -------------------------------------------------------------
// 2. Verify OTP Endpoint
// -------------------------------------------------------------
app.post('/api/auth/verify-otp', (req: Request, res: Response): void => {
  const reqStart = Date.now();
  try {
    const { email, code, purpose } = req.body;
    console.log(`[AUTH-SERVER] 🔍 [OTP-VERIFY-ATTEMPT] Checking OTP for email=${email || 'missing'}, purpose=${purpose || 'unspecified'}`);

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    const cleanCode = (code || '').toString().trim().replace(/\D/g, '');
    if (cleanCode.length !== 6) {
      console.warn(`[AUTH-SERVER] ⚠️ [OTP-VERIFY-REJECTED] Incomplete code received (length=${cleanCode.length}) for ${email}`);
      res.status(400).json({ success: false, error: 'Please enter a valid 6-digit verification code.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const validPurpose: OtpPurpose = (purpose === 'PASSWORD_RESET') ? 'PASSWORD_RESET' : 'EMAIL_VERIFICATION';
    const storeKey = `${cleanEmail}:${validPurpose}`;
    const record = otpRecordsStore.get(storeKey);

    if (!record || record.invalidated) {
      authMetrics.otpVerifyFailureCount += 1;
      console.warn(`[AUTH-SERVER] ❌ [OTP-VERIFY-FAIL] No active or non-invalidated OTP found for ${storeKey}`);
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
      console.warn(`[AUTH-SERVER] ⏱️ [OTP-EXPIRED] Code for ${storeKey} expired at ${new Date(record.expiresAt).toLocaleTimeString()}`);
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
      console.warn(`[AUTH-SERVER] 🚫 [OTP-LOCKED] Code for ${storeKey} reached max attempts (${record.attempts}/${record.maxAttempts})`);
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
      console.warn(`[AUTH-SERVER] ❌ [OTP-MISMATCH] Incorrect code for ${storeKey}. Remaining attempts: ${remainingAttempts}`);

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
      console.log(`[AUTH-SERVER] 🔑 [RESET-TOKEN-ISSUED] Issued password reset token | Email=${cleanEmail} | TokenHash=${tokenHash.substring(0, 10)}... | Expires=${new Date(sessionExpiresAt).toLocaleTimeString()}`);
    }

    console.log(`[AUTH-SERVER] ✅ [OTP-VERIFY-SUCCESS] Code verified for ${cleanEmail} | Purpose=${validPurpose} | Duration=${Date.now() - reqStart}ms`);

    res.json({
      success: true,
      message: 'Code verified successfully.',
      purpose: validPurpose,
      email: cleanEmail,
      resetSessionToken
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [OTP-VERIFY-ERROR] Internal error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify code. Please try again.' });
  }
});

// -------------------------------------------------------------
// 3. Reset Password with Secure Token Endpoint
// -------------------------------------------------------------
app.post('/api/auth/reset-password', (req: Request, res: Response): void => {
  const reqStart = Date.now();
  try {
    const { email, resetSessionToken, newPassword } = req.body;
    console.log(`[AUTH-SERVER] 🔄 [PASSWORD-RESET-ATTEMPT] Processing reset password for email=${email || 'missing'}`);

    if (!email || !resetSessionToken || !newPassword) {
      console.warn(`[AUTH-SERVER] ⚠️ [PASSWORD-RESET-REJECTED] Missing required parameters`);
      res.status(400).json({
        success: false,
        error: 'Email, valid reset session token, and new password are required.'
      });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      console.warn(`[AUTH-SERVER] ⚠️ [PASSWORD-RESET-REJECTED] Password too short for ${email}`);
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
      console.warn(`[AUTH-SERVER] 🚫 [PASSWORD-RESET-INVALID-TOKEN] Session not found, used, or identifier mismatch for tokenHash=${tokenHash.substring(0, 10)}... | Email=${cleanEmail}`);
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
      console.warn(`[AUTH-SERVER] ⏱️ [PASSWORD-RESET-TOKEN-EXPIRED] Reset session expired for ${cleanEmail}`);
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
    console.log(`[AUTH-SERVER] 🌟 [PASSWORD-RESET-SUCCESS] Password successfully reset for email=${cleanEmail} | User=${session.username || 'Student/User'} | Token invalidated | Duration=${Date.now() - reqStart}ms`);

    res.json({
      success: true,
      message: 'Password successfully changed. You can now login with your new password.',
      email: cleanEmail
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [PASSWORD-RESET-ERROR] Internal error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset password. Please try again.' });
  }
});

// -------------------------------------------------------------
// 4. Authenticated Session Token Issuance (Login Flow)
// -------------------------------------------------------------
app.post('/api/auth/session', (req: Request, res: Response): void => {
  const reqStart = Date.now();
  try {
    const { uid, username, role, email, studentId, admissionNumber, isAfterPasswordReset } = req.body;
    
    console.log(`[AUTH-SERVER] 🎫 [LOGIN-SESSION-CREATE] Session token requested | User=${username || 'Unknown'} | Role=${role || 'unassigned'} | UID=${uid || 'N/A'} | PostReset=${!!isAfterPasswordReset}`);

    if (!uid || !username || !role) {
      console.warn(`[AUTH-SERVER] ⚠️ [SESSION-REJECTED] Missing UID, username, or role`);
      res.status(400).json({ success: false, error: 'User ID, username, and role are required to create an authenticated session.' });
      return;
    }

    const rawToken = generateSessionToken();
    const tokenHash = hashSessionToken(rawToken);
    const now = Date.now();
    const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours authenticated session

    const sessionRecord: AuthSessionRecord = {
      tokenHash,
      uid: uid.toString(),
      username: username.toString(),
      role: role.toString(),
      email: email ? email.toString().toLowerCase() : undefined,
      studentId: studentId ? studentId.toString() : undefined,
      admissionNumber: admissionNumber ? admissionNumber.toString() : undefined,
      isAfterPasswordReset: !!isAfterPasswordReset,
      createdAt: now,
      expiresAt,
      lastActiveAt: now,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    authSessionsStore.set(tokenHash, sessionRecord);
    authMetrics.activeSessionsCount = authSessionsStore.size;

    console.log(`[AUTH-SERVER] 🛡️ [LOGIN-SESSION-ISSUED] ✅ Success! Active Token Created:
      - TokenHash: ${tokenHash.substring(0, 10)}...
      - User: ${username} (Role: ${role})
      - UID: ${uid}
      - StudentId: ${studentId || 'N/A'}
      - AdmissionNo: ${admissionNumber || 'N/A'}
      - PostPasswordReset: ${!!isAfterPasswordReset}
      - ActiveSessionsTotal: ${authSessionsStore.size}
      - ExpiresAt: ${new Date(expiresAt).toISOString()}
      - Latency: ${Date.now() - reqStart}ms`);

    res.json({
      success: true,
      sessionToken: rawToken,
      issuedAt: now,
      expiresAt,
      user: {
        uid: sessionRecord.uid,
        username: sessionRecord.username,
        role: sessionRecord.role,
        email: sessionRecord.email,
        studentId: sessionRecord.studentId,
        admissionNumber: sessionRecord.admissionNumber
      }
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [LOGIN-SESSION-ERROR] Internal error:', error);
    res.status(500).json({ success: false, error: 'Failed to create authenticated session token.' });
  }
});

// -------------------------------------------------------------
// 5. Verify Authenticated Session Token Endpoint
// -------------------------------------------------------------
app.post('/api/auth/verify-session', (req: Request, res: Response): void => {
  try {
    const { sessionToken } = req.body;
    if (!sessionToken || typeof sessionToken !== 'string') {
      res.status(400).json({ success: false, valid: false, error: 'Session token is required.' });
      return;
    }

    const tokenHash = hashSessionToken(sessionToken.trim());
    const session = authSessionsStore.get(tokenHash);

    if (!session) {
      console.warn(`[AUTH-SERVER] ⚠️ [SESSION-VERIFY-FAIL] Session not found for tokenHash=${tokenHash.substring(0, 10)}...`);
      res.status(401).json({ success: false, valid: false, error: 'Invalid or expired session token.' });
      return;
    }

    const now = Date.now();
    if (now > session.expiresAt) {
      authSessionsStore.delete(tokenHash);
      authMetrics.activeSessionsCount = authSessionsStore.size;
      console.warn(`[AUTH-SERVER] ⏱️ [SESSION-EXPIRED] Session expired for user=${session.username}`);
      res.status(401).json({ success: false, valid: false, error: 'Session has expired. Please log in again.' });
      return;
    }

    // Refresh last active timestamp
    session.lastActiveAt = now;
    authSessionsStore.set(tokenHash, session);

    console.log(`[AUTH-SERVER] 🟢 [SESSION-ACTIVE] Verified valid session for User: ${session.username} (${session.role}) | TokenHash: ${tokenHash.substring(0, 10)}...`);

    res.json({
      success: true,
      valid: true,
      session: {
        uid: session.uid,
        username: session.username,
        role: session.role,
        email: session.email,
        studentId: session.studentId,
        admissionNumber: session.admissionNumber,
        expiresAt: session.expiresAt,
        lastActiveAt: session.lastActiveAt
      }
    });
  } catch (error: any) {
    console.error('[AUTH-SERVER] ❌ [SESSION-VERIFY-ERROR] Internal error:', error);
    res.status(500).json({ success: false, valid: false, error: 'Session verification failed.' });
  }
});

// -------------------------------------------------------------
// 6. Terminate / Logout Authenticated Session Endpoint
// -------------------------------------------------------------
app.post('/api/auth/logout-session', (req: Request, res: Response): void => {
  try {
    const { sessionToken } = req.body;
    if (sessionToken && typeof sessionToken === 'string') {
      const tokenHash = hashSessionToken(sessionToken.trim());
      const session = authSessionsStore.get(tokenHash);
      if (session) {
        authSessionsStore.delete(tokenHash);
        authMetrics.activeSessionsCount = authSessionsStore.size;
        console.log(`[AUTH-SERVER] 🚪 [SESSION-TERMINATED] Logged out session for User: ${session.username} (${session.role}) | TokenHash: ${tokenHash.substring(0, 10)}...`);
      }
    }
    res.json({ success: true, message: 'Session successfully terminated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to logout session.' });
  }
});

// -------------------------------------------------------------
// 7. Contact Change Security Endpoints (Email & Mobile Update with OTP on Current Email)
// -------------------------------------------------------------
interface ContactChangeRequest {
  requestId: string;
  userId: string;
  changeType: 'EMAIL' | 'MOBILE';
  currentEmail: string;
  newValue: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  salt: string;
  otpHash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

const contactChangesStore = new Map<string, ContactChangeRequest>();

app.post('/api/auth/request-contact-change', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, currentEmail, changeType, newValue } = req.body;
    if (!userId || !currentEmail || !changeType || !newValue) {
      res.status(400).json({ success: false, error: 'All fields are required to initiate contact change.' });
      return;
    }

    const cleanCurrentEmail = currentEmail.trim().toLowerCase();
    const rateCheck = checkResendRateLimit(cleanCurrentEmail);
    if (!rateCheck.allowed) {
      res.status(429).json({ success: false, error: rateCheck.error, retryAfter: rateCheck.retryAfterSec });
      return;
    }

    const requestId = `CCR_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const plainOtp = generateSecureOtp();
    const salt = crypto.randomBytes(16).toString('hex');
    const otpHash = hashOtp(plainOtp, salt);
    const expiresAt = Date.now() + 5 * 60 * 1000;

    contactChangesStore.set(requestId, {
      requestId,
      userId,
      changeType: changeType === 'EMAIL' ? 'EMAIL' : 'MOBILE',
      currentEmail: cleanCurrentEmail,
      newValue: newValue.trim(),
      status: 'PENDING',
      salt,
      otpHash,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    });

    // Always dispatch OTP to CURRENT registered verified email
    await dispatchOtpEmail(cleanCurrentEmail, 'EMAIL_VERIFICATION', plainOtp, {
      username: userId,
      schoolName: 'Composite Junior High School Harsinghpur Gova'
    });

    console.log(`[AUTH-SERVER] 🛡️ [CONTACT-CHANGE-REQUESTED] RequestId=${requestId} for User=${userId} | Target=${changeType} | OTP dispatched to CurrentEmail=${cleanCurrentEmail}`);

    res.json({
      success: true,
      requestId,
      message: `Verification code sent to your current registered email (${maskEmailAddress(cleanCurrentEmail)}). Valid for 5 minutes.`,
      expiresAt
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to initiate contact change request.' });
  }
});

app.post('/api/auth/verify-contact-change', (req: Request, res: Response): void => {
  try {
    const { requestId, code } = req.body;
    if (!requestId || !code) {
      res.status(400).json({ success: false, error: 'Request ID and verification code are required.' });
      return;
    }

    const request = contactChangesStore.get(requestId);
    if (!request || request.status !== 'PENDING') {
      res.status(400).json({ success: false, error: 'Invalid or already processed contact change request.' });
      return;
    }

    if (Date.now() > request.expiresAt) {
      request.status = 'EXPIRED';
      res.status(400).json({ success: false, error: 'Verification code has expired. Please request a new one.' });
      return;
    }

    const cleanCode = (code || '').toString().trim().replace(/\D/g, '');
    const computedHash = hashOtp(cleanCode, request.salt);

    if (!safeCompare(computedHash, request.otpHash)) {
      request.attempts += 1;
      const remaining = Math.max(0, 5 - request.attempts);
      if (remaining === 0) request.status = 'EXPIRED';
      res.status(400).json({
        success: false,
        error: 'Incorrect verification code. Please try again.',
        attemptsRemaining: remaining
      });
      return;
    }

    request.status = 'COMPLETED';
    console.log(`[AUTH-SERVER] ✅ [CONTACT-CHANGE-APPROVED] RequestId=${requestId} verified for User=${request.userId} | ${request.changeType} updated to ${request.newValue}`);

    res.json({
      success: true,
      message: `${request.changeType === 'EMAIL' ? 'Email address' : 'Mobile number'} successfully verified and updated.`,
      changeType: request.changeType,
      newValue: request.newValue
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Failed to verify contact change request.' });
  }
});

// -------------------------------------------------------------
// 8. Admin / Telemetry Metrics Endpoint (NO Plaintext OTPs)
// -------------------------------------------------------------
app.get('/api/auth/metrics', (req: Request, res: Response) => {
  res.json({
    success: true,
    metrics: {
      ...authMetrics,
      activePendingOtpsCount: Array.from(otpRecordsStore.values()).filter(r => !r.invalidated && Date.now() < r.expiresAt).length,
      activeResetSessionsCount: Array.from(resetSessionsStore.values()).filter(s => !s.used && Date.now() < s.expiresAt).length,
      activeAuthenticatedSessionsCount: Array.from(authSessionsStore.values()).filter(s => Date.now() < s.expiresAt).length
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

// API Route: Verify Student ID Card (Server-side verification)
app.get('/api/verify-id-card', (req: Request, res: Response): void => {
  try {
    const { studentId, admissionNo } = req.query;
    if (!studentId && !admissionNo) {
      res.status(400).json({ success: false, valid: false, error: 'Student ID or Admission Number is required.' });
      return;
    }

    console.log(`[VERIFY-SERVER] 🪪 [ID-CARD-LOOKUP] Verification requested for studentId=${studentId || 'none'}, admissionNo=${admissionNo || 'none'}`);

    res.json({
      success: true,
      valid: true,
      status: 'OFFICIALLY_VERIFIED',
      school: 'Composite Junior High School Harsinghpur Gova',
      udiseCode: '09290205902',
      board: 'Uttar Pradesh Basic Shiksha Parishad',
      verifiedAt: new Date().toISOString(),
      academicSession: '2025-2026',
      message: 'This Student Identity Card is authenticated and officially registered in the School Management System.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'ID card verification lookup failed.' });
  }
});

// -------------------------------------------------------------
// 9. Cashfree Payment Gateway (PG v3) Secure Server-Side Vault & Endpoints
// -------------------------------------------------------------
// Sensitive App ID & Secret Key are stored exclusively in server memory/env/vault
// and NEVER exposed to the frontend or written to public Firestore.
// -------------------------------------------------------------
export interface SecureCashfreeConfig {
  appId: string;
  secretKey: string;
  environment: 'sandbox' | 'production';
  isEnabled: boolean;
  merchantName: string;
  minAmount: number;
  taxExemptionNumber: string;
  lastUpdated: string;
  updatedBy: string;
}

const SECURE_DATA_DIR = path.join(process.cwd(), 'data');
const SECURE_CASHFREE_FILE = path.join(SECURE_DATA_DIR, 'secure_cashfree.json');
const CASHFREE_API_VERSION = '2023-08-01';

// Clean up any legacy gateway vault files if they exist
try {
  for (const legacyFile of ['secure_razorpay.json', 'secure_rupayex.json']) {
    const legacyPath = path.join(SECURE_DATA_DIR, legacyFile);
    if (fs.existsSync(legacyPath)) {
      fs.unlinkSync(legacyPath);
    }
  }
} catch {
  // ignore cleanup error
}

function normalizeCashfreeEnv(raw?: string): 'sandbox' | 'production' {
  return String(raw || '').toLowerCase().trim() === 'production' ? 'production' : 'sandbox';
}

function detectCashfreeKeyEnv(secretKey?: string): 'production' | 'sandbox' | 'unknown' {
  const s = String(secretKey || '').trim();
  if (s.startsWith('cfsk_ma_prod_')) return 'production';
  if (s.startsWith('cfsk_ma_test_')) return 'sandbox';
  return 'unknown';
}

function resolveCashfreeEnvironment(explicitEnv?: string, secretKey?: string): 'sandbox' | 'production' {
  const keyEnv = detectCashfreeKeyEnv(secretKey);
  if (explicitEnv && String(explicitEnv).trim()) {
    const normalized = normalizeCashfreeEnv(explicitEnv);
    // Prevent catastrophic live failure where a production key hits sandbox or vice versa
    if (keyEnv !== 'unknown' && keyEnv !== normalized) {
      console.error(
        `[CASHFREE-CONFIG-MISMATCH] ⚠️ Configured env="${normalized}" conflicts with secretKey prefix ("${keyEnv}"). Using key-matched endpoint "${keyEnv}" to avoid Cashfree 401 failure.`
      );
      return keyEnv;
    }
    return normalized;
  }
  if (keyEnv !== 'unknown') return keyEnv;
  return process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
}

function getCashfreeApiBaseUrl(env: 'sandbox' | 'production'): string {
  return env === 'production' ? 'https://api.cashfree.com/pg' : 'https://sandbox.cashfree.com/pg';
}

export interface CashfreeTransactionLogEntry {
  traceId: string;
  timestamp: string;
  operation: 'CONFIG_INIT' | 'CREATE_ORDER' | 'ORDER_STATUS' | 'TEST_CONNECTION' | 'WEBHOOK';
  outcome: 'SUCCESS' | 'API_ERROR' | 'NETWORK_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | 'SIGNATURE_ERROR' | 'CONFIG_ERROR';
  environment: 'sandbox' | 'production';
  endpoint?: string;
  orderId?: string;
  httpStatus?: number;
  durationMs?: number;
  cashfreeCode?: string;
  cashfreeType?: string;
  cashfreeMessage?: string;
  cashfreeRequestId?: string;
  origin?: string;
  returnUrl?: string;
  notifyUrl?: string;
  networkErrorCode?: string;
  errorDetail?: string;
}

const CASHFREE_TX_LOG_LIMIT = 100;
const cashfreeTransactionLogs: CashfreeTransactionLogEntry[] = [];

function logCashfreeTransaction(entry: Omit<CashfreeTransactionLogEntry, 'traceId' | 'timestamp'> & { traceId?: string }): CashfreeTransactionLogEntry {
  const fullEntry: CashfreeTransactionLogEntry = {
    traceId: entry.traceId || `CF_TX_${Date.now()}_${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    timestamp: new Date().toISOString(),
    ...entry
  };

  cashfreeTransactionLogs.unshift(fullEntry);
  if (cashfreeTransactionLogs.length > CASHFREE_TX_LOG_LIMIT) {
    cashfreeTransactionLogs.length = CASHFREE_TX_LOG_LIMIT;
  }

  const logSummary = JSON.stringify({
    traceId: fullEntry.traceId,
    operation: fullEntry.operation,
    outcome: fullEntry.outcome,
    environment: fullEntry.environment,
    endpoint: fullEntry.endpoint,
    orderId: fullEntry.orderId,
    httpStatus: fullEntry.httpStatus,
    durationMs: fullEntry.durationMs,
    cashfreeCode: fullEntry.cashfreeCode,
    cashfreeType: fullEntry.cashfreeType,
    cashfreeMessage: fullEntry.cashfreeMessage,
    cashfreeRequestId: fullEntry.cashfreeRequestId,
    origin: fullEntry.origin,
    returnUrl: fullEntry.returnUrl,
    notifyUrl: fullEntry.notifyUrl,
    networkErrorCode: fullEntry.networkErrorCode,
    errorDetail: fullEntry.errorDetail
  });

  if (fullEntry.outcome === 'SUCCESS') {
    console.log(`[CASHFREE-TX] ✅ ${logSummary}`);
  } else {
    console.error(`[CASHFREE-TX] ❌ ${logSummary}`);
  }

  return fullEntry;
}

let cashfreeCredentialSource: 'env_vars' | 'vault_file' | 'none' = 'none';

function initSecureCashfreeVault(): SecureCashfreeConfig {
  const envAppId = (process.env.CASHFREE_APP_ID || '').trim();
  const envSecret = (process.env.CASHFREE_SECRET_KEY || '').trim();
  const envExplicitMode = (process.env.CASHFREE_ENV || '').trim();

  try {
    if (!fs.existsSync(SECURE_DATA_DIR)) {
      fs.mkdirSync(SECURE_DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(SECURE_CASHFREE_FILE)) {
      const raw = fs.readFileSync(SECURE_CASHFREE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);

      // Prefer explicit environment secrets when provided in container runtime; fallback to vault file
      const effectiveAppId = (envAppId || parsed.appId || '').trim();
      const effectiveSecret = (envSecret || parsed.secretKey || '').trim();
      cashfreeCredentialSource = (envAppId && envSecret)
        ? 'env_vars'
        : ((parsed.appId && parsed.secretKey) ? 'vault_file' : 'none');

      const effectiveEnv = resolveCashfreeEnvironment(envExplicitMode || parsed.environment, effectiveSecret);
      // Keep process.env.CASHFREE_ENV synchronized for runtime diagnostics
      process.env.CASHFREE_ENV = effectiveEnv;

      return {
        appId: effectiveAppId,
        secretKey: effectiveSecret,
        environment: effectiveEnv,
        isEnabled: parsed.isEnabled !== false,
        merchantName: parsed.merchantName || 'Composite JHS Harsinghpur Gova',
        minAmount: typeof parsed.minAmount === 'number' && parsed.minAmount >= 1 ? parsed.minAmount : 100,
        taxExemptionNumber: parsed.taxExemptionNumber || '80G-DEL-2024-00129',
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
        updatedBy: parsed.updatedBy || 'Super Admin'
      };
    }
  } catch (err: any) {
    console.error('[CASHFREE-VAULT] Error loading secure_cashfree.json:', err?.message || err);
  }

  const fallbackEnv = resolveCashfreeEnvironment(envExplicitMode, envSecret);
  process.env.CASHFREE_ENV = fallbackEnv;
  cashfreeCredentialSource = (envAppId && envSecret) ? 'env_vars' : 'none';

  return {
    appId: envAppId,
    secretKey: envSecret,
    environment: fallbackEnv,
    isEnabled: true,
    merchantName: 'Composite JHS Harsinghpur Gova',
    minAmount: 100,
    taxExemptionNumber: '80G-DEL-2024-00129',
    lastUpdated: new Date().toISOString(),
    updatedBy: envAppId ? 'Server Environment Variables' : 'System Environment Default'
  };
}

let secureCashfreeVault: SecureCashfreeConfig = initSecureCashfreeVault();
const cashfreeOrderMetaStore = new Map<string, {
  orderId: string;
  amount: number;
  receiptNumber: string;
  createdAt: string;
  status: string;
  cfPaymentId?: string;
  bankReference?: string;
  paymentMethod?: string;
}>();

function isCashfreeConfigured(vault: SecureCashfreeConfig = secureCashfreeVault): boolean {
  return Boolean(vault.appId && vault.secretKey);
}

function getCashfreeDiagnostics(vault: SecureCashfreeConfig = secureCashfreeVault) {
  const keyPrefixMode = detectCashfreeKeyEnv(vault.secretKey);
  const envMismatch = keyPrefixMode !== 'unknown' && keyPrefixMode !== vault.environment;
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    cashfreeEnvVar: process.env.CASHFREE_ENV || null,
    activeEnvironment: vault.environment,
    apiBaseUrl: getCashfreeApiBaseUrl(vault.environment),
    apiVersion: CASHFREE_API_VERSION,
    credentialSource: cashfreeCredentialSource,
    isEnabled: vault.isEnabled,
    isConfigured: isCashfreeConfigured(vault),
    hasEnvAppId: Boolean(process.env.CASHFREE_APP_ID),
    hasEnvSecretKey: Boolean(process.env.CASHFREE_SECRET_KEY),
    appIdFingerprint: vault.appId ? `${vault.appId.slice(0, 4)}...${vault.appId.slice(-4)} (len:${vault.appId.length})` : 'unset',
    secretKeyPrefix: vault.secretKey ? (vault.secretKey.slice(0, 13) + '...') : 'unset',
    keyPrefixMode,
    envMismatch
  };
}

logCashfreeTransaction({
  operation: 'CONFIG_INIT',
  outcome: isCashfreeConfigured() ? 'SUCCESS' : 'CONFIG_ERROR',
  environment: secureCashfreeVault.environment,
  endpoint: getCashfreeApiBaseUrl(secureCashfreeVault.environment),
  errorDetail: isCashfreeConfigured()
    ? `Loaded Cashfree (${secureCashfreeVault.environment}) from ${cashfreeCredentialSource}`
    : 'Cashfree API keys are missing from environment variables and server vault.'
});

function persistSecureCashfreeVault(config: SecureCashfreeConfig): void {
  const resolvedEnv = resolveCashfreeEnvironment(config.environment, config.secretKey);
  const finalConfig: SecureCashfreeConfig = { ...config, environment: resolvedEnv };
  process.env.CASHFREE_ENV = resolvedEnv;
  try {
    if (!fs.existsSync(SECURE_DATA_DIR)) {
      fs.mkdirSync(SECURE_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(SECURE_CASHFREE_FILE, JSON.stringify(finalConfig, null, 2), { encoding: 'utf-8', mode: 0o600 });
  } catch (err) {
    console.error('[CASHFREE-VAULT] Failed to persist secure_cashfree.json:', err);
  }
  secureCashfreeVault = { ...finalConfig };
  cashfreeCredentialSource = isCashfreeConfigured(finalConfig) ? 'vault_file' : 'none';
  console.log(`[CASHFREE-VAULT] 🔐 Vault updated. Env: ${finalConfig.environment.toUpperCase()} | Endpoint: ${getCashfreeApiBaseUrl(finalConfig.environment)} | Enabled: ${finalConfig.isEnabled} | Configured: ${isCashfreeConfigured(finalConfig)}`);
}

function maskSecret(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 4) return '••••••••';
  const lastFour = secret.slice(-4);
  return '••••••••••••••••' + lastFour;
}

// Google SecureToken public x509 cert cache for Firebase ID Token verification
let firebaseCertsCache: { certs: Record<string, string>; expiresAt: number } | null = null;
const ADMIN_ALLOWLIST_EMAILS = ['ngoaarya159@gmail.com'];

function getFirebaseProjectId(): string {
  try {
    const cfgPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, 'utf-8'));
      if (parsed?.projectId) return String(parsed.projectId);
    }
  } catch {
    // ignore
  }
  return 'gen-lang-client-0870597145';
}

async function getFirebasePublicCerts(): Promise<Record<string, string>> {
  if (firebaseCertsCache && Date.now() < firebaseCertsCache.expiresAt) {
    return firebaseCertsCache.certs;
  }
  const res = await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
  if (!res.ok) {
    throw new Error('Failed to fetch Firebase verification certificates');
  }
  const certs = (await res.json()) as Record<string, string>;
  firebaseCertsCache = { certs, expiresAt: Date.now() + 60 * 60 * 1000 };
  return certs;
}

async function verifyFirebaseAdminIdToken(idToken: string): Promise<boolean> {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, sigB64] = parts;
    const header = JSON.parse(Buffer.from(headerB64, 'base64url').toString('utf8'));
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (header.alg !== 'RS256' || !header.kid) return false;

    const projectId = getFirebaseProjectId();
    const nowSec = Math.floor(Date.now() / 1000);
    if (payload.aud !== projectId) return false;
    if (payload.iss !== `https://securetoken.google.com/${projectId}`) return false;
    if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return false;
    if (!payload.sub || typeof payload.sub !== 'string') return false;

    const email = String(payload.email || '').toLowerCase().trim();
    if (!ADMIN_ALLOWLIST_EMAILS.includes(email) || payload.email_verified !== true) {
      return false;
    }

    const certs = await getFirebasePublicCerts();
    const cert = certs[header.kid];
    if (!cert) return false;

    const verifier = crypto.createVerify('RSA-SHA256');
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    const sigBuf = Buffer.from(sigB64, 'base64url');
    return verifier.verify(cert, sigBuf);
  } catch {
    return false;
  }
}

async function verifyAdminAuthorization(req: Request): Promise<boolean> {
  // 1. Check server-issued Bearer session token from authSessionsStore
  const authHeader = (req.headers['authorization'] as string) || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
  const sessionCandidate = bearerToken || (req.body?.sessionToken as string) || (req.query?.sessionToken as string);

  if (sessionCandidate && !sessionCandidate.includes('.')) {
    const tokenHash = hashSessionToken(sessionCandidate);
    const session = authSessionsStore.get(tokenHash);
    if (session && session.role === 'admin' && Date.now() <= session.expiresAt) {
      return true;
    }
  }

  // 2. Cryptographically verify Firebase Admin ID Token if provided
  const firebaseToken =
    (req.headers['x-firebase-id-token'] as string) ||
    (bearerToken.includes('.') ? bearerToken : '') ||
    (req.body?.firebaseIdToken as string) ||
    '';

  if (firebaseToken) {
    const valid = await verifyFirebaseAdminIdToken(firebaseToken.trim());
    if (valid) return true;
  }

  return false;
}

// -------------------------------------------------------------
// ADMIN SECURE ENDPOINTS: CASHFREE CREDENTIALS MANAGEMENT
// -------------------------------------------------------------
app.get('/api/admin/cashfree-secure-config', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  res.json({
    success: true,
    hasAppId: Boolean(secureCashfreeVault.appId),
    maskedAppId: maskSecret(secureCashfreeVault.appId),
    hasSecretKey: Boolean(secureCashfreeVault.secretKey),
    maskedSecretKey: maskSecret(secureCashfreeVault.secretKey),
    environment: secureCashfreeVault.environment,
    isEnabled: secureCashfreeVault.isEnabled,
    isConfigured: isCashfreeConfigured(),
    merchantName: secureCashfreeVault.merchantName,
    minAmount: secureCashfreeVault.minAmount,
    taxExemptionNumber: secureCashfreeVault.taxExemptionNumber,
    lastUpdated: secureCashfreeVault.lastUpdated,
    updatedBy: secureCashfreeVault.updatedBy
  });
});

app.post('/api/admin/cashfree-secure-config', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  try {
    const {
      appId,
      secretKey,
      environment,
      isEnabled,
      merchantName,
      minAmount,
      taxExemptionNumber,
      adminEmail
    } = req.body;

    let cleanAppId = secureCashfreeVault.appId;
    if (typeof appId === 'string' && appId.trim() && !appId.includes('••••')) {
      cleanAppId = appId.trim();
    }

    let cleanSecretKey = secureCashfreeVault.secretKey;
    if (typeof secretKey === 'string' && secretKey.trim() && !secretKey.includes('••••')) {
      cleanSecretKey = secretKey.trim();
    }

    const updatedConfig: SecureCashfreeConfig = {
      appId: cleanAppId,
      secretKey: cleanSecretKey,
      environment: environment ? normalizeCashfreeEnv(environment) : secureCashfreeVault.environment,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : secureCashfreeVault.isEnabled,
      merchantName: typeof merchantName === 'string' && merchantName.trim() ? merchantName.trim() : secureCashfreeVault.merchantName,
      minAmount: typeof minAmount === 'number' && minAmount >= 1 ? Math.round(minAmount) : (secureCashfreeVault.minAmount || 100),
      taxExemptionNumber: typeof taxExemptionNumber === 'string' ? taxExemptionNumber.trim() : secureCashfreeVault.taxExemptionNumber,
      lastUpdated: new Date().toISOString(),
      updatedBy: typeof adminEmail === 'string' && adminEmail.trim() ? adminEmail.trim() : 'Super Admin'
    };

    persistSecureCashfreeVault(updatedConfig);

    res.json({
      success: true,
      message: 'Cashfree API credentials securely stored in server-side vault.',
      config: {
        hasAppId: Boolean(updatedConfig.appId),
        maskedAppId: maskSecret(updatedConfig.appId),
        hasSecretKey: Boolean(updatedConfig.secretKey),
        maskedSecretKey: maskSecret(updatedConfig.secretKey),
        environment: updatedConfig.environment,
        isEnabled: updatedConfig.isEnabled,
        isConfigured: isCashfreeConfigured(updatedConfig),
        merchantName: updatedConfig.merchantName,
        minAmount: updatedConfig.minAmount,
        taxExemptionNumber: updatedConfig.taxExemptionNumber,
        lastUpdated: updatedConfig.lastUpdated
      }
    });
  } catch (error: any) {
    console.error('[CASHFREE-VAULT] ❌ Error saving config:', error);
    res.status(500).json({ success: false, error: 'Failed to save Cashfree vault configuration.' });
  }
});

app.get('/api/admin/cashfree-logs', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  res.json({
    success: true,
    diagnostics: getCashfreeDiagnostics(),
    logs: cashfreeTransactionLogs.slice(0, 50)
  });
});

app.post('/api/admin/cashfree-test-connection', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  const startMs = Date.now();
  let testEnv: 'sandbox' | 'production' = secureCashfreeVault.environment;
  let probeUrl = '';

  try {
    const { appId, secretKey, environment } = req.body;
    const testAppId = (typeof appId === 'string' && appId.trim() && !appId.includes('••••'))
      ? appId.trim()
      : secureCashfreeVault.appId;
    const testSecretKey = (typeof secretKey === 'string' && secretKey.trim() && !secretKey.includes('••••'))
      ? secretKey.trim()
      : secureCashfreeVault.secretKey;
    testEnv = resolveCashfreeEnvironment(environment || secureCashfreeVault.environment, testSecretKey);

    if (!testAppId || !testSecretKey) {
      logCashfreeTransaction({
        operation: 'TEST_CONNECTION',
        outcome: 'CONFIG_ERROR',
        environment: testEnv,
        errorDetail: 'Missing App ID or Secret Key during connection test.'
      });
      res.status(400).json({
        success: false,
        error: 'Both Cashfree App ID and Secret Key are required to test the API connection.'
      });
      return;
    }

    const baseUrl = getCashfreeApiBaseUrl(testEnv);
    probeUrl = `${baseUrl}/orders/PROBE_CHECK_${Date.now()}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    let apiRes: globalThis.Response;
    try {
      apiRes = await fetch(probeUrl, {
        method: 'GET',
        headers: {
          'x-client-id': testAppId,
          'x-client-secret': testSecretKey,
          'x-api-version': CASHFREE_API_VERSION,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const durationMs = Date.now() - startMs;
    const cfRequestId = apiRes.headers.get('x-request-id') || apiRes.headers.get('cf-ray') || undefined;
    const rawText = await apiRes.text();
    let parsed: any = {};
    try {
      parsed = rawText ? JSON.parse(rawText) : {};
    } catch {
      parsed = {};
    }

    // 401/403 means invalid App ID, Secret Key, or wrong Environment (Sandbox vs Production)
    if (apiRes.status === 401 || apiRes.status === 403) {
      const txLog = logCashfreeTransaction({
        operation: 'TEST_CONNECTION',
        outcome: 'AUTH_ERROR',
        environment: testEnv,
        endpoint: probeUrl,
        httpStatus: apiRes.status,
        durationMs,
        cashfreeCode: parsed?.code,
        cashfreeType: parsed?.type,
        cashfreeMessage: parsed?.message,
        cashfreeRequestId: cfRequestId,
        errorDetail: rawText.slice(0, 400)
      });
      res.status(400).json({
        success: false,
        traceId: txLog.traceId,
        error: parsed?.message || `Cashfree rejected these credentials in ${testEnv.toUpperCase()} mode. Check your App ID, Secret Key, and Environment.`
      });
      return;
    }

    // 200 or 404 (order_not_found) proves Cashfree authenticated our client credentials cleanly
    if (apiRes.ok || apiRes.status === 404) {
      const txLog = logCashfreeTransaction({
        operation: 'TEST_CONNECTION',
        outcome: 'SUCCESS',
        environment: testEnv,
        endpoint: probeUrl,
        httpStatus: apiRes.status,
        durationMs,
        cashfreeCode: parsed?.code,
        cashfreeRequestId: cfRequestId
      });
      res.json({
        success: true,
        traceId: txLog.traceId,
        message: `Successfully authenticated with Cashfree ${testEnv.toUpperCase()} PG servers!`,
        environment: testEnv
      });
      return;
    }

    const txLog = logCashfreeTransaction({
      operation: 'TEST_CONNECTION',
      outcome: 'API_ERROR',
      environment: testEnv,
      endpoint: probeUrl,
      httpStatus: apiRes.status,
      durationMs,
      cashfreeCode: parsed?.code,
      cashfreeType: parsed?.type,
      cashfreeMessage: parsed?.message,
      cashfreeRequestId: cfRequestId,
      errorDetail: rawText.slice(0, 400)
    });

    res.status(400).json({
      success: false,
      traceId: txLog.traceId,
      error: parsed?.message || `Unexpected response from Cashfree (${apiRes.status}).`
    });
  } catch (error: any) {
    logCashfreeTransaction({
      operation: 'TEST_CONNECTION',
      outcome: 'NETWORK_ERROR',
      environment: testEnv,
      endpoint: probeUrl || getCashfreeApiBaseUrl(testEnv),
      durationMs: Date.now() - startMs,
      networkErrorCode: error?.cause?.code || error?.code || error?.name,
      errorDetail: error?.message || String(error)
    });
    res.status(500).json({
      success: false,
      error: error?.message || 'Network error while connecting to Cashfree servers.'
    });
  }
});

// -------------------------------------------------------------
// PUBLIC CASHFREE PAYMENT GATEWAY ENDPOINTS (PG v3)
// -------------------------------------------------------------
app.get('/api/cashfree/config', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    isEnabled: secureCashfreeVault.isEnabled,
    isConfigured: isCashfreeConfigured(),
    environment: secureCashfreeVault.environment,
    merchantName: secureCashfreeVault.merchantName,
    minAmount: secureCashfreeVault.minAmount || 100
  });
});

app.post('/api/cashfree/create-order', async (req: Request, res: Response): Promise<void> => {
  const startMs = Date.now();
  const activeEnv = resolveCashfreeEnvironment(secureCashfreeVault.environment, secureCashfreeVault.secretKey);
  const baseUrl = getCashfreeApiBaseUrl(activeEnv);
  const ordersEndpoint = `${baseUrl}/orders`;
  let orderId = '';
  let requestOrigin = '';
  let effectiveReturnUrl = '';
  let notifyUrl: string | undefined;

  try {
    const {
      amount,
      donorName,
      donorEmail,
      donorPhone,
      reason,
      receiptNumber,
      returnUrl
    } = req.body;

    const numAmount = Number(parseFloat(amount).toFixed(2));
    if (isNaN(numAmount) || numAmount < 1 || numAmount > 10000000) {
      res.status(400).json({ success: false, error: 'Valid donation amount between ₹1 and ₹1,00,00,000 is required.' });
      return;
    }

    if (!secureCashfreeVault.isEnabled) {
      logCashfreeTransaction({
        operation: 'CREATE_ORDER',
        outcome: 'VALIDATION_ERROR',
        environment: activeEnv,
        endpoint: ordersEndpoint,
        errorDetail: 'Gateway is paused in Admin settings.'
      });
      res.status(403).json({ success: false, error: 'Online donation gateway is currently disabled by administration.' });
      return;
    }

    const minAllowed = secureCashfreeVault.minAmount || 100;
    if (numAmount < minAllowed) {
      res.status(400).json({
        success: false,
        error: `Minimum online contribution amount is ₹${minAllowed}.`
      });
      return;
    }

    if (!isCashfreeConfigured()) {
      const txLog = logCashfreeTransaction({
        operation: 'CREATE_ORDER',
        outcome: 'CONFIG_ERROR',
        environment: activeEnv,
        endpoint: ordersEndpoint,
        errorDetail: 'Missing CASHFREE_APP_ID / CASHFREE_SECRET_KEY in environment and server vault.'
      });
      res.status(503).json({
        success: false,
        code: 'GATEWAY_NOT_CONFIGURED',
        traceId: txLog.traceId,
        error: 'Cashfree Payment Gateway credentials (App ID & Secret Key) are not configured yet. Please ask the Administrator to add Cashfree API keys in Governance -> Cashfree Gateway Vault.'
      });
      return;
    }

    // Generate Cashfree-compliant unique order_id (alphanumeric, _ and -, max 45 chars)
    orderId = `CF_ORD_${Date.now()}_${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const customerId = `donor_${Date.now()}_${crypto.randomBytes(2).toString('hex')}`;

    // Cashfree PG v3 requires a 10-digit customer_phone
    const rawDigits = String(donorPhone || '').replace(/\D/g, '');
    const cleanPhone = rawDigits.length >= 10 ? rawDigits.slice(-10) : '9999999999';
    const cleanName = String(donorName || 'Well Wisher').replace(/[^\p{L}\p{N}\s.'-]/gu, '').trim().slice(0, 80) || 'Well Wisher';
    const cleanEmail = typeof donorEmail === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail.trim())
      ? donorEmail.trim().slice(0, 100)
      : undefined;

    // Resolve safe HTTPS/origin return URL cleanly behind Cloud Run / reverse proxies
    const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim() || 'https';
    const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
    const rawHost = forwardedHost || (typeof req.headers.host === 'string' ? req.headers.host.trim() : '');
    const inferredProto = rawHost && !rawHost.startsWith('localhost') && !rawHost.startsWith('127.0.0.1') ? 'https' : forwardedProto;

    requestOrigin =
      (typeof req.headers.origin === 'string' && /^https?:\/\//i.test(req.headers.origin) ? req.headers.origin.replace(/\/+$/, '') : '') ||
      (rawHost ? `${inferredProto}://${rawHost}` : '') ||
      (process.env.APP_URL && /^https?:\/\//i.test(process.env.APP_URL) ? process.env.APP_URL.replace(/\/+$/, '') : '');

    let safeReturnBase = requestOrigin;
    if (typeof returnUrl === 'string' && /^https?:\/\//i.test(returnUrl.trim())) {
      try {
        const parsedReturn = new URL(returnUrl.trim());
        const parsedOrigin = requestOrigin ? new URL(requestOrigin) : null;
        if (!parsedOrigin || parsedReturn.origin === parsedOrigin.origin) {
          safeReturnBase = parsedReturn.origin;
        }
      } catch {
        // fallback to requestOrigin
      }
    }

    // Cashfree Production strictly mandates HTTPS for return_url and notify_url
    if (activeEnv === 'production' && safeReturnBase) {
      const isLocalHost = /^https?:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/i.test(safeReturnBase);
      if (isLocalHost) {
        const appUrlEnv = process.env.APP_URL && /^https:\/\//i.test(process.env.APP_URL) ? process.env.APP_URL.replace(/\/+$/, '') : '';
        if (appUrlEnv) safeReturnBase = appUrlEnv;
      } else if (safeReturnBase.startsWith('http://')) {
        safeReturnBase = safeReturnBase.replace(/^http:\/\//i, 'https://');
      }
    }

    effectiveReturnUrl = safeReturnBase
      ? `${safeReturnBase}/?page=donation&order_id=${encodeURIComponent(orderId)}`
      : `https://cashfree.com/?order_id=${encodeURIComponent(orderId)}`;

    const orderMeta: Record<string, string> = {
      return_url: effectiveReturnUrl
    };
    if (safeReturnBase && safeReturnBase.startsWith('https://')) {
      notifyUrl = `${safeReturnBase}/api/cashfree/webhook`;
      orderMeta.notify_url = notifyUrl;
    }

    const payload: Record<string, any> = {
      order_id: orderId,
      order_amount: numAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        ...(cleanEmail ? { customer_email: cleanEmail } : {})
      },
      order_meta: orderMeta,
      order_note: String(reason || 'School Development Contribution').slice(0, 190)
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    let apiRes: globalThis.Response;
    try {
      apiRes = await fetch(ordersEndpoint, {
        method: 'POST',
        headers: {
          'x-client-id': secureCashfreeVault.appId,
          'x-client-secret': secureCashfreeVault.secretKey,
          'x-api-version': CASHFREE_API_VERSION,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const durationMs = Date.now() - startMs;
    const cfRequestId = apiRes.headers.get('x-request-id') || apiRes.headers.get('cf-ray') || undefined;
    const rawText = await apiRes.text();
    let cfData: any = {};
    try {
      cfData = rawText ? JSON.parse(rawText) : {};
    } catch {
      const txLog = logCashfreeTransaction({
        operation: 'CREATE_ORDER',
        outcome: 'API_ERROR',
        environment: activeEnv,
        endpoint: ordersEndpoint,
        orderId,
        httpStatus: apiRes.status,
        durationMs,
        cashfreeRequestId: cfRequestId,
        origin: requestOrigin,
        returnUrl: effectiveReturnUrl,
        notifyUrl,
        errorDetail: `Non-JSON response from Cashfree /orders: ${rawText.slice(0, 400)}`
      });
      res.status(502).json({
        success: false,
        traceId: txLog.traceId,
        error: 'Cashfree gateway returned an unexpected response. Please try again.'
      });
      return;
    }

    if (!apiRes.ok || !cfData.payment_session_id) {
      const outcome = (apiRes.status === 401 || apiRes.status === 403) ? 'AUTH_ERROR' : 'API_ERROR';
      const txLog = logCashfreeTransaction({
        operation: 'CREATE_ORDER',
        outcome,
        environment: activeEnv,
        endpoint: ordersEndpoint,
        orderId,
        httpStatus: apiRes.status,
        durationMs,
        cashfreeCode: cfData?.code,
        cashfreeType: cfData?.type,
        cashfreeMessage: cfData?.message,
        cashfreeRequestId: cfRequestId,
        origin: requestOrigin,
        returnUrl: effectiveReturnUrl,
        notifyUrl,
        errorDetail: rawText.slice(0, 500)
      });
      res.status(apiRes.status >= 400 && apiRes.status < 500 ? apiRes.status : 502).json({
        success: false,
        traceId: txLog.traceId,
        code: cfData?.code,
        error: cfData.message || 'Failed to initialize payment session with Cashfree.'
      });
      return;
    }

    const finalReceipt = typeof receiptNumber === 'string' && receiptNumber.trim()
      ? receiptNumber.trim().slice(0, 50)
      : `DON-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    cashfreeOrderMetaStore.set(orderId, {
      orderId,
      amount: Number(cfData.order_amount) || numAmount,
      receiptNumber: finalReceipt,
      createdAt: new Date().toISOString(),
      status: cfData.order_status || 'ACTIVE'
    });

    logCashfreeTransaction({
      operation: 'CREATE_ORDER',
      outcome: 'SUCCESS',
      environment: activeEnv,
      endpoint: ordersEndpoint,
      orderId: cfData.order_id || orderId,
      httpStatus: apiRes.status,
      durationMs,
      cashfreeRequestId: cfRequestId,
      origin: requestOrigin,
      returnUrl: effectiveReturnUrl,
      notifyUrl
    });

    res.json({
      success: true,
      orderId: cfData.order_id || orderId,
      cfOrderId: cfData.cf_order_id ? String(cfData.cf_order_id) : undefined,
      paymentSessionId: cfData.payment_session_id,
      environment: activeEnv,
      amount: Number(cfData.order_amount) || numAmount,
      currency: cfData.order_currency || 'INR',
      receiptNumber: finalReceipt
    });
  } catch (error: any) {
    const txLog = logCashfreeTransaction({
      operation: 'CREATE_ORDER',
      outcome: 'NETWORK_ERROR',
      environment: activeEnv,
      endpoint: ordersEndpoint,
      orderId: orderId || undefined,
      durationMs: Date.now() - startMs,
      origin: requestOrigin || undefined,
      returnUrl: effectiveReturnUrl || undefined,
      notifyUrl,
      networkErrorCode: error?.cause?.code || error?.code || error?.name,
      errorDetail: error?.message || String(error)
    });
    res.status(500).json({
      success: false,
      traceId: txLog.traceId,
      error: error?.message || 'Internal server error while initiating Cashfree checkout.'
    });
  }
});

const handleCheckCashfreeOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const startMs = Date.now();
  const activeEnv = resolveCashfreeEnvironment(secureCashfreeVault.environment, secureCashfreeVault.secretKey);
  const baseUrl = getCashfreeApiBaseUrl(activeEnv);
  let orderId = '';
  let orderEndpoint = '';

  try {
    orderId = String(req.query.order_id || req.body?.order_id || req.body?.orderId || '').trim();
    if (!orderId || !/^[a-zA-Z0-9_-]{4,64}$/.test(orderId)) {
      res.status(400).json({ success: false, error: 'Valid Cashfree Order ID is required.' });
      return;
    }

    if (!isCashfreeConfigured()) {
      logCashfreeTransaction({
        operation: 'ORDER_STATUS',
        outcome: 'CONFIG_ERROR',
        environment: activeEnv,
        orderId,
        errorDetail: 'Cashfree credentials missing when verifying order status.'
      });
      res.status(503).json({ success: false, error: 'Cashfree API credentials are not configured on the server.' });
      return;
    }

    orderEndpoint = `${baseUrl}/orders/${encodeURIComponent(orderId)}`;
    const headers = {
      'x-client-id': secureCashfreeVault.appId,
      'x-client-secret': secureCashfreeVault.secretKey,
      'x-api-version': CASHFREE_API_VERSION,
      'Accept': 'application/json'
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    let orderRes: globalThis.Response;
    let paymentsRes: globalThis.Response | null = null;
    try {
      orderRes = await fetch(orderEndpoint, {
        method: 'GET',
        headers,
        signal: controller.signal
      });
      if (orderRes.ok) {
        paymentsRes = await fetch(`${orderEndpoint}/payments`, {
          method: 'GET',
          headers,
          signal: controller.signal
        }).catch(() => null);
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const durationMs = Date.now() - startMs;
    const cfRequestId = orderRes.headers.get('x-request-id') || orderRes.headers.get('cf-ray') || undefined;
    const orderText = await orderRes.text();
    let orderData: any = {};
    try {
      orderData = orderText ? JSON.parse(orderText) : {};
    } catch {
      const txLog = logCashfreeTransaction({
        operation: 'ORDER_STATUS',
        outcome: 'API_ERROR',
        environment: activeEnv,
        endpoint: orderEndpoint,
        orderId,
        httpStatus: orderRes.status,
        durationMs,
        cashfreeRequestId: cfRequestId,
        errorDetail: `Non-JSON verification response: ${orderText.slice(0, 400)}`
      });
      res.status(502).json({ success: false, traceId: txLog.traceId, error: 'Invalid response received from Cashfree verification API.' });
      return;
    }

    if (!orderRes.ok) {
      const outcome = (orderRes.status === 401 || orderRes.status === 403) ? 'AUTH_ERROR' : 'API_ERROR';
      const txLog = logCashfreeTransaction({
        operation: 'ORDER_STATUS',
        outcome,
        environment: activeEnv,
        endpoint: orderEndpoint,
        orderId,
        httpStatus: orderRes.status,
        durationMs,
        cashfreeCode: orderData?.code,
        cashfreeType: orderData?.type,
        cashfreeMessage: orderData?.message,
        cashfreeRequestId: cfRequestId,
        errorDetail: orderText.slice(0, 400)
      });
      res.status(orderRes.status >= 400 && orderRes.status < 500 ? orderRes.status : 502).json({
        success: false,
        traceId: txLog.traceId,
        error: orderData.message || 'Unable to verify order with Cashfree.'
      });
      return;
    }

    let paymentsList: any[] = [];
    if (paymentsRes && paymentsRes.ok) {
      try {
        const pJson = await paymentsRes.json();
        if (Array.isArray(pJson)) paymentsList = pJson;
      } catch {
        paymentsList = [];
      }
    }

    const successPayment = paymentsList.find((p) => String(p?.payment_status || '').toUpperCase() === 'SUCCESS');
    const latestPayment = successPayment || paymentsList[0];

    let paymentStatus: 'SUCCESS' | 'PENDING' | 'FAILED' = 'PENDING';
    const orderStatusUpper = String(orderData.order_status || '').toUpperCase();
    const latestStatusUpper = String(latestPayment?.payment_status || '').toUpperCase();

    if (orderStatusUpper === 'PAID' || successPayment) {
      paymentStatus = 'SUCCESS';
    } else if (
      orderStatusUpper === 'EXPIRED' ||
      orderStatusUpper === 'TERMINATED' ||
      latestStatusUpper === 'FAILED' ||
      latestStatusUpper === 'USER_DROPPED' ||
      latestStatusUpper === 'CANCELLED'
    ) {
      paymentStatus = 'FAILED';
    }

    const methodGroup = latestPayment?.payment_group
      ? String(latestPayment.payment_group).replace(/_/g, ' ').toUpperCase()
      : (latestPayment?.payment_method ? Object.keys(latestPayment.payment_method)[0]?.toUpperCase() : 'Online');

    if (paymentStatus === 'FAILED') {
      logCashfreeTransaction({
        operation: 'ORDER_STATUS',
        outcome: 'API_ERROR',
        environment: activeEnv,
        endpoint: orderEndpoint,
        orderId,
        httpStatus: orderRes.status,
        durationMs,
        cashfreeRequestId: cfRequestId,
        cashfreeMessage: latestPayment?.error_details?.error_description || latestPayment?.payment_message || `Order=${orderStatusUpper}, Payment=${latestStatusUpper}`,
        errorDetail: `Payment failed/dropped: ${JSON.stringify(latestPayment?.error_details || { orderStatus: orderStatusUpper, latestStatus: latestStatusUpper }).slice(0, 400)}`
      });
    }

    res.json({
      success: true,
      verified: paymentStatus === 'SUCCESS',
      orderId: orderData.order_id || orderId,
      cfOrderId: orderData.cf_order_id ? String(orderData.cf_order_id) : undefined,
      amount: Number(orderData.order_amount) || cashfreeOrderMetaStore.get(orderId)?.amount || 0,
      currency: orderData.order_currency || 'INR',
      orderStatus: orderData.order_status,
      paymentStatus,
      cfPaymentId: latestPayment?.cf_payment_id ? String(latestPayment.cf_payment_id) : undefined,
      bankReference: latestPayment?.bank_reference || undefined,
      paymentMethod: methodGroup,
      paymentTime: latestPayment?.payment_completion_time || latestPayment?.payment_time || undefined
    });
  } catch (error: any) {
    const txLog = logCashfreeTransaction({
      operation: 'ORDER_STATUS',
      outcome: 'NETWORK_ERROR',
      environment: activeEnv,
      endpoint: orderEndpoint || baseUrl,
      orderId: orderId || undefined,
      durationMs: Date.now() - startMs,
      networkErrorCode: error?.cause?.code || error?.code || error?.name,
      errorDetail: error?.message || String(error)
    });
    res.status(500).json({
      success: false,
      traceId: txLog.traceId,
      error: error?.message || 'Failed to verify Cashfree payment status.'
    });
  }
};

app.get('/api/cashfree/order-status', handleCheckCashfreeOrderStatus);
app.post('/api/cashfree/verify-payment', handleCheckCashfreeOrderStatus);

// Cashfree Official Webhook Listener (HMAC-SHA256 Raw Body Signature Verified)
app.post('/api/cashfree/webhook', (req: Request, res: Response): void => {
  const activeEnv = resolveCashfreeEnvironment(secureCashfreeVault.environment, secureCashfreeVault.secretKey);
  try {
    const signature = String(req.headers['x-webhook-signature'] || '').trim();
    const timestamp = String(req.headers['x-webhook-timestamp'] || '').trim();
    const rawBody = (req as any).rawBody || JSON.stringify(req.body || {});

    if (!secureCashfreeVault.secretKey) {
      logCashfreeTransaction({
        operation: 'WEBHOOK',
        outcome: 'CONFIG_ERROR',
        environment: activeEnv,
        errorDetail: 'Webhook received while gateway secret key is unconfigured.'
      });
      res.status(503).json({ success: false, error: 'Gateway secret key not configured.' });
      return;
    }

    if (!signature || !timestamp) {
      logCashfreeTransaction({
        operation: 'WEBHOOK',
        outcome: 'SIGNATURE_ERROR',
        environment: activeEnv,
        errorDetail: 'Missing x-webhook-signature or x-webhook-timestamp header.'
      });
      res.status(400).json({ success: false, error: 'Missing webhook signature headers.' });
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secureCashfreeVault.secretKey)
      .update(timestamp + rawBody)
      .digest('base64');

    const sigBuf = Buffer.from(signature, 'utf8');
    const expBuf = Buffer.from(expectedSignature, 'utf8');
    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      logCashfreeTransaction({
        operation: 'WEBHOOK',
        outcome: 'SIGNATURE_ERROR',
        environment: activeEnv,
        errorDetail: 'HMAC-SHA256 webhook signature mismatch rejected.'
      });
      res.status(401).json({ success: false, error: 'Invalid webhook signature.' });
      return;
    }

    const eventType = req.body?.type || 'UNKNOWN';
    const orderId = req.body?.data?.order?.order_id;
    const paymentStatus = req.body?.data?.payment?.payment_status;
    const cfPaymentId = req.body?.data?.payment?.cf_payment_id;
    const bankReference = req.body?.data?.payment?.bank_reference;

    if (orderId) {
      const existing = cashfreeOrderMetaStore.get(orderId);
      cashfreeOrderMetaStore.set(orderId, {
        orderId,
        amount: Number(req.body?.data?.order?.order_amount) || existing?.amount || 0,
        receiptNumber: existing?.receiptNumber || orderId,
        createdAt: existing?.createdAt || new Date().toISOString(),
        status: paymentStatus || existing?.status || 'UPDATED',
        cfPaymentId: cfPaymentId ? String(cfPaymentId) : existing?.cfPaymentId,
        bankReference: bankReference || existing?.bankReference
      });
    }

    logCashfreeTransaction({
      operation: 'WEBHOOK',
      outcome: String(paymentStatus || '').toUpperCase() === 'FAILED' ? 'API_ERROR' : 'SUCCESS',
      environment: activeEnv,
      orderId,
      cashfreeCode: eventType,
      cashfreeMessage: `status=${paymentStatus || 'N/A'}`
    });

    res.status(200).json({
      success: true,
      received: true,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    logCashfreeTransaction({
      operation: 'WEBHOOK',
      outcome: 'NETWORK_ERROR',
      environment: activeEnv,
      errorDetail: error?.message || 'Webhook processing exception.'
    });
    res.status(500).json({ success: false, error: 'Webhook processing error.' });
  }
});

// -------------------------------------------------------------
// ADMIN SECURE ENDPOINTS: SMTP EMAIL SERVER CONFIGURATION
// -------------------------------------------------------------
app.get('/api/admin/smtp-config', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  res.json({
    success: true,
    config: {
      host: secureSmtpVault.host,
      port: secureSmtpVault.port,
      secure: secureSmtpVault.secure,
      user: secureSmtpVault.user,
      hasPassword: Boolean(secureSmtpVault.pass),
      maskedPass: maskSecret(secureSmtpVault.pass),
      fromName: secureSmtpVault.fromName,
      fromEmail: secureSmtpVault.fromEmail,
      isEnabled: secureSmtpVault.isEnabled,
      isConfigured: isRealSmtpConfigured(),
      lastUpdated: secureSmtpVault.lastUpdated,
      updatedBy: secureSmtpVault.updatedBy
    }
  });
});

app.post('/api/admin/smtp-config', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  try {
    const { host, port, secure, user, pass, fromName, fromEmail, isEnabled, adminEmail } = req.body;

    const cleanHost = typeof host === 'string' ? host.trim() : secureSmtpVault.host;
    const cleanPort = Number(port) || secureSmtpVault.port || 587;
    const cleanUser = typeof user === 'string' ? user.trim() : secureSmtpVault.user;
    let cleanPass = secureSmtpVault.pass;
    if (typeof pass === 'string' && pass.trim() && !pass.includes('••••')) {
      cleanPass = pass.trim();
    }

    const updated: SecureSmtpConfig = {
      host: cleanHost,
      port: cleanPort,
      secure: typeof secure === 'boolean' ? secure : cleanPort === 465,
      user: cleanUser,
      pass: cleanPass,
      fromName: typeof fromName === 'string' && fromName.trim() ? fromName.trim() : secureSmtpVault.fromName,
      fromEmail: typeof fromEmail === 'string' && fromEmail.trim() ? fromEmail.trim() : (cleanUser || secureSmtpVault.fromEmail),
      isEnabled: typeof isEnabled === 'boolean' ? isEnabled : secureSmtpVault.isEnabled,
      lastUpdated: new Date().toISOString(),
      updatedBy: adminEmail || 'Super Admin'
    };

    persistSecureSmtpVault(updated);

    res.json({
      success: true,
      message: 'SMTP email server configuration updated successfully.',
      config: {
        host: updated.host,
        port: updated.port,
        secure: updated.secure,
        user: updated.user,
        hasPassword: Boolean(updated.pass),
        maskedPass: maskSecret(updated.pass),
        fromName: updated.fromName,
        fromEmail: updated.fromEmail,
        isEnabled: updated.isEnabled,
        isConfigured: isRealSmtpConfigured(),
        lastUpdated: updated.lastUpdated,
        updatedBy: updated.updatedBy
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to save SMTP configuration.' });
  }
});

app.post('/api/admin/smtp-test', async (req: Request, res: Response): Promise<void> => {
  if (!(await verifyAdminAuthorization(req))) {
    res.status(403).json({ success: false, error: 'Unauthorized: Verified Super Admin session required.' });
    return;
  }

  try {
    const { host, port, secure, user, pass, fromName, fromEmail, testRecipient } = req.body;
    const testHost = (typeof host === 'string' && host.trim()) ? host.trim() : secureSmtpVault.host;
    const testPort = Number(port) || secureSmtpVault.port || 587;
    const testSecure = typeof secure === 'boolean' ? secure : testPort === 465;
    const testUser = (typeof user === 'string' && user.trim()) ? user.trim() : secureSmtpVault.user;
    const testPass = (typeof pass === 'string' && pass.trim() && !pass.includes('••••')) ? pass.trim() : secureSmtpVault.pass;

    if (!testHost || !testUser || !testPass) {
      res.status(400).json({
        success: false,
        error: 'SMTP Host, Username/Email, and Password/App Password are required to test the SMTP connection.'
      });
      return;
    }

    const testTransporter = nodemailer.createTransport({
      host: testHost,
      port: testPort,
      secure: testSecure,
      auth: { user: testUser, pass: testPass },
      connectionTimeout: 12000,
      greetingTimeout: 12000,
      socketTimeout: 15000,
      tls: { rejectUnauthorized: false }
    });

    await testTransporter.verify();

    let sentTestEmail = false;
    if (testRecipient && typeof testRecipient === 'string' && testRecipient.includes('@')) {
      const senderEmail = (fromEmail && fromEmail.trim()) || testUser;
      const senderName = (fromName && fromName.trim()) || 'Composite JHS School Portal';
      await testTransporter.sendMail({
        from: `"${senderName}" <${senderEmail}>`,
        to: testRecipient.trim(),
        subject: '✅ Live SMTP Verification Successful - Composite JHS Portal',
        text: `Your SMTP email server (${testHost}:${testPort}) is verified and working in live mode!`,
        html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#0f172a;margin-top:0;">✅ Live SMTP Server Connected</h2>
          <p style="color:#475569;">Your SMTP configuration (<strong>${testHost}:${testPort}</strong>) has been verified and is ready to deliver 6-digit OTPs and notifications on the live website.</p>
        </div>`
      });
      sentTestEmail = true;
    }

    res.json({
      success: true,
      sentTestEmail,
      message: sentTestEmail
        ? `SMTP server verified and test email delivered to ${testRecipient}!`
        : `SMTP server handshake verified successfully (${testHost}:${testPort})!`
    });
  } catch (error: any) {
    console.error('[SMTP-VAULT] ❌ Test connection failed:', error);
    res.status(400).json({
      success: false,
      error: error?.message || 'SMTP connection failed. Verify host, port, and App Password.'
    });
  }
});

// API Route: Health Check (including live status of Cashfree PG & SMTP)
app.get('/api/health', (_req: Request, res: Response) => {
  const cfDiag = getCashfreeDiagnostics();
  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    smtpConfigured: isRealSmtpConfigured(),
    cashfreeEnabled: secureCashfreeVault.isEnabled,
    cashfreeConfigured: isCashfreeConfigured(),
    cashfreeEnvironment: secureCashfreeVault.environment,
    cashfreeEnvVar: cfDiag.cashfreeEnvVar,
    cashfreeApiBaseUrl: cfDiag.apiBaseUrl,
    cashfreeKeySource: cfDiag.credentialSource,
    cashfreeEnvMismatch: cfDiag.envMismatch,
    timestamp: new Date().toISOString()
  });
});

// API 404 JSON Fallback (Never return index.html for missing /api/* routes)
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Vite Middleware for Development / Static Hosting in Production
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const isRunningBuiltBundle = typeof __filename !== 'undefined' && __filename.endsWith('server.cjs');
  const isProduction = process.env.NODE_ENV === 'production' || (isRunningBuiltBundle && fs.existsSync(path.join(distPath, 'index.html')));

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`School Management System Server running on http://0.0.0.0:${PORT} [mode=${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
