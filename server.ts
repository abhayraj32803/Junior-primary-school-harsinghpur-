import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory verification cache for quick validation
const otpStore: Record<string, { code: string; expiresAt: number; studentName?: string }> = {};
const resetOtpStore: Record<string, { code: string; expiresAt: number; username?: string; email?: string; attempts: number }> = {};

// Helper: Setup Nodemailer Transporter
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
    console.log(`[Email Service] Configured custom SMTP transport (${host}:${port})`);
  } else {
    // Generate test account / fallback transporter
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
      console.log(`[Email Service] Using Ethereal development mailer (${testAccount.user})`);
    } catch (e) {
      console.warn('[Email Service] Fallback transporter creation warning:', e);
      mailTransporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'unix',
        buffer: true
      });
    }
  }

  return mailTransporter;
}

// API Route 1: Send 6-Digit Email Verification Code (OTP) for Student Verification
app.post('/api/send-otp-email', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, studentName, code, studentId, schoolName } = req.body;

    if (!to || !to.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required.' });
      return;
    }

    if (!code || code.length !== 6) {
      res.status(400).json({ success: false, error: '6-digit verification code is required.' });
      return;
    }

    const cleanEmail = to.trim().toLowerCase();
    const displayName = studentName || 'Student';
    const school = schoolName || 'Composite Junior High School Harsinghpur Gova';
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore[cleanEmail] = { code, expiresAt, studentName: displayName };

    const fromAddress = process.env.SMTP_FROM || `"Composite JHS Harsinghpur Gova" <no-reply@harsinghpur-gova.gov.in>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Student Email Verification Code</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f1f5f9; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 30px 24px; text-align: center;">
                    <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; margin-bottom: 6px;">
                      Basic Education Department, Govt. of Uttar Pradesh
                    </div>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0; line-height: 1.3;">
                      ${school}
                    </h1>
                    <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0; font-family: monospace;">
                      UDISE: 09290205902 • Shamsabad, Farrukhabad (U.P.)
                    </p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid #bfdbfe;">
                        छात्र ईमेल सत्यापन (Student Email OTP)
                      </span>
                    </div>

                    <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin: 0 0 12px 0; text-align: center;">
                      नमस्ते, ${displayName}!
                    </h2>

                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      आपके छात्र खाते (Student Account) के ईमेल सत्यापन हेतु 6-अंकों का आधिकारिक वन-टाइम पासवर्ड (OTP) नीचे दिया गया है:
                    </p>

                    <!-- OTP Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
                      <span style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                        आपका 6-अंकों का सत्यापन कोड
                      </span>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #1e3a8a; background: #ffffff; display: inline-block; padding: 8px 24px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        ${code}
                      </div>
                      <div style="font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 10px;">
                        ⏱️ यह कोड अगले 10 मिनट के लिए मान्य है (Valid for 10 minutes)
                      </div>
                    </div>

                    <!-- Instructions -->
                    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
                        <strong>सुरक्षा सूचना:</strong> इस कोड को किसी के साथ साझा न करें। यदि आपने इस पंजीकरण का अनुरोध नहीं किया है, तो कृपया इस ईमेल को अनदेखा करें।
                      </p>
                    </div>

                    ${studentId ? `
                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                      Student Roll / Reg ID: <strong>${studentId}</strong>
                    </p>
                    ` : ''}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                      यह एक स्वचालित सरकारी स्कूल प्रणाली संदेश है। कृपया इस ईमेल का उत्तर न दें।<br/>
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
        subject: `[${code}] छात्र ईमेल सत्यापन कोड - Composite JHS Harsinghpur Gova`,
        text: `नमस्ते ${displayName},\n\nआपके छात्र खाते का 6-अंकों का सत्यापन कोड है: ${code}\n\nयह कोड 10 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें।\n\nComposite Junior High School Harsinghpur Gova, Farrukhabad (UP)`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Verification OTP email dispatched to ${cleanEmail}: ${info.messageId || 'sent'}`);
      
      let previewUrl = null;
      if (nodemailer.getTestMessageUrl(info)) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service] Test Preview URL: ${previewUrl}`);
      }

      res.json({
        success: true,
        message: `सत्यापन कोड (${cleanEmail}) पर भेज दिया गया है।`,
        code,
        expiresAt,
        previewUrl
      });
    } catch (mailError: any) {
      console.error('[Email Service] Error sending verification mail:', mailError);
      res.json({
        success: true,
        code,
        expiresAt,
        message: `सत्यापन कोड उत्पन्न हुआ (${cleanEmail})।`,
        warning: mailError.message
      });
    }
  } catch (error: any) {
    console.error('[API /api/send-otp-email] Internal error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// API Route 2: Send 6-Digit Password Reset OTP via SMTP
app.post('/api/send-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, username, code, role, schoolName } = req.body;

    if (!to || !to.includes('@')) {
      res.status(400).json({ success: false, error: 'Valid email address is required for password reset.' });
      return;
    }

    if (!code || code.length !== 6) {
      res.status(400).json({ success: false, error: '6-digit password reset OTP is required.' });
      return;
    }

    const cleanEmail = to.trim().toLowerCase();
    const displayName = username || 'User';
    const school = schoolName || 'Composite Junior High School Harsinghpur Gova';
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    resetOtpStore[cleanEmail] = { 
      code, 
      expiresAt, 
      username: displayName, 
      email: cleanEmail, 
      attempts: 0 
    };

    const fromAddress = process.env.SMTP_FROM || `"Composite JHS Security" <no-reply@harsinghpur-gova.gov.in>`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset OTP</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%; background-color: #f1f5f9; padding: 30px 10px;">
          <tr>
            <td align="center">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #0f172a; padding: 30px 24px; text-align: center;">
                    <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #fbbf24; margin-bottom: 6px;">
                      Basic Education Department, Govt. of Uttar Pradesh
                    </div>
                    <h1 style="color: #ffffff; font-size: 20px; font-weight: 900; margin: 0; line-height: 1.3;">
                      ${school}
                    </h1>
                    <p style="color: #94a3b8; font-size: 12px; margin: 6px 0 0 0; font-family: monospace;">
                      UDISE: 09290205902 • Shamsabad, Farrukhabad (U.P.)
                    </p>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <span style="display: inline-block; background-color: #fef2f2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 4px 14px; border-radius: 9999px; border: 1px solid #fecaca;">
                        🔐 पासवर्ड रीसेट सुरक्षा कोड (Password Reset OTP)
                      </span>
                    </div>

                    <h2 style="color: #0f172a; font-size: 18px; font-weight: 800; margin: 0 0 12px 0; text-align: center;">
                      नमस्ते, ${displayName}!
                    </h2>

                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; text-align: center;">
                      आपके विद्यालय खाते (School Account) का पासवर्ड रीसेट करने अथवा नया पासवर्ड बनाने हेतु 6-अंकों का आधिकारिक सत्यापन कोड (OTP) नीचे दिया गया है:
                    </p>

                    <!-- OTP Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #f59e0b; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 24px;">
                      <span style="font-size: 12px; font-weight: 700; color: #b45309; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                        आपका 6-अंकों का पासवर्ड रीसेट कोड
                      </span>
                      <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #b45309; background: #ffffff; display: inline-block; padding: 10px 26px; border-radius: 8px; border: 1px solid #fde68a;">
                        ${code}
                      </div>
                      <div style="font-size: 12px; color: #dc2626; font-weight: 700; margin-top: 12px;">
                        ⏱️ यह कोड अगले 10 मिनट के लिए मान्य है (Valid for 10 minutes)
                      </div>
                    </div>

                    <!-- Instructions -->
                    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 24px;">
                      <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
                        <strong>सुरक्षा चेतावनी:</strong> यदि आपने पासवर्ड रीसेट का अनुरोध नहीं किया है, तो कृपया तुरंत अपने स्कूल प्रशासक को सूचित करें। इस कोड को किसी के भी साथ साझा न करें।
                      </p>
                    </div>

                    <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
                      Account Role: <strong>${(role || 'student').toUpperCase()}</strong> • User ID: <strong>${displayName}</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center;">
                    <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                      यह एक स्वचालित सरकारी स्कूल सुरक्षा प्रणाली संदेश है। कृपया इस ईमेल का उत्तर न दें।<br/>
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
        subject: `[${code}] पासवर्ड रीसेट सत्यापन कोड - Composite JHS Harsinghpur Gova`,
        text: `नमस्ते ${displayName},\n\nआपके विद्यालय खाते का 6-अंकों का पासवर्ड रीसेट कोड है: ${code}\n\nयह कोड 10 मिनट के लिए मान्य है। कृपया इसे किसी के साथ साझा न करें।\n\nComposite Junior High School Harsinghpur Gova, Farrukhabad (UP)`,
        html: htmlContent
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Password Reset OTP email dispatched to ${cleanEmail}: ${info.messageId || 'sent'}`);
      
      let previewUrl = null;
      if (nodemailer.getTestMessageUrl(info)) {
        previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`[Email Service] Password Reset Test Preview URL: ${previewUrl}`);
      }

      res.json({
        success: true,
        message: `पासवर्ड रीसेट कोड (${cleanEmail}) पर सफलतापूर्वक भेज दिया गया है।`,
        code,
        expiresAt,
        previewUrl
      });
    } catch (mailError: any) {
      console.error('[Email Service] Error sending password reset mail:', mailError);
      res.json({
        success: true,
        code,
        expiresAt,
        message: `पासवर्ड रीसेट कोड उत्पन्न हुआ (${cleanEmail})।`,
        warning: mailError.message
      });
    }
  } catch (error: any) {
    console.error('[API /api/send-reset-otp] Internal error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

// API Route 3: Verify Password Reset OTP
app.post('/api/verify-reset-otp', (req: Request, res: Response): void => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({ success: false, error: 'Email and 6-digit OTP code are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();
  const record = resetOtpStore[cleanEmail];

  if (!record) {
    res.status(404).json({ success: false, error: 'No active password reset request found for this email.' });
    return;
  }

  if (Date.now() > record.expiresAt) {
    res.status(400).json({ success: false, error: 'Password reset OTP has expired. Please request a new code.' });
    return;
  }

  if (record.code !== cleanCode) {
    record.attempts += 1;
    const rem = Math.max(0, 5 - record.attempts);
    res.status(400).json({ success: false, error: `Invalid OTP code. ${rem} attempts remaining.`, attemptsRemaining: rem });
    return;
  }

  res.json({ success: true, message: 'OTP verified successfully.', email: cleanEmail });
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
