import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import { auth } from '../../../lib/firebase';
import { apiUrl, safeParseJson, getApiBaseUrl, setCustomApiBaseUrl } from '../../../utils/apiClient';
import {
  Mail,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Info,
  Zap
} from 'lucide-react';

interface SmtpVaultResponse {
  success: boolean;
  config?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    hasPassword: boolean;
    maskedPass: string;
    fromName: string;
    fromEmail: string;
    isEnabled: boolean;
    isConfigured: boolean;
    lastUpdated: string;
    updatedBy: string;
  };
  error?: string;
}

interface HealthResponse {
  status: string;
  environment: string;
  smtpConfigured: boolean;
  cashfreeEnabled: boolean;
  cashfreeConfigured: boolean;
  cashfreeEnvironment?: 'sandbox' | 'production';
}

export const AdminSmtpSettings: React.FC = () => {
  const { language, settings, updateSettings, addAuditLog } = useSchool();
  const { currentUser, role, sessionToken } = useAuth();

  const isSuperAdmin =
    role === 'admin' ||
    currentUser?.email === 'ngoaarya159@gmail.com' ||
    currentUser?.email === 'admin@school.gov.in';

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // SMTP fields
  const [host, setHost] = useState('');
  const [port, setPort] = useState<number>(465);
  const [secure, setSecure] = useState<boolean>(true);
  const [user, setUser] = useState('');
  const [hasExistingPass, setHasExistingPass] = useState(false);
  const [maskedPass, setMaskedPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [fromName, setFromName] = useState('Composite JHS Harsinghpur Gova');
  const [fromEmail, setFromEmail] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Test email state
  const [testRecipient, setTestRecipient] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  // Live backend health & static host API URL override
  const [healthStatus, setHealthStatus] = useState<HealthResponse | null>(null);
  const [customApiBase, setCustomApiBase] = useState(() => getApiBaseUrl() || settings.liveApiBaseUrl || '');
  const [apiBaseSaved, setApiBaseSaved] = useState(false);

  const buildAuthHeaders = async (isJson = false) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (isJson) headers['Content-Type'] = 'application/json';
    if (sessionToken) headers['Authorization'] = `Bearer ${sessionToken}`;
    try {
      const fbToken = await auth.currentUser?.getIdToken?.();
      if (fbToken) {
        headers['X-Firebase-Id-Token'] = fbToken;
        if (!headers['Authorization']) {
          headers['Authorization'] = `Bearer ${fbToken}`;
        }
      }
    } catch {
      // ignore if firebase auth user isn't active
    }
    if (currentUser?.email) headers['x-admin-email'] = currentUser.email;
    if (role) headers['x-user-role'] = role;
    return headers;
  };

  const loadConfigAndHealth = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const headers = await buildAuthHeaders();
      const [cfgRes, healthRes] = await Promise.all([
        fetch(apiUrl('/api/admin/smtp-config'), { method: 'GET', headers }),
        fetch(apiUrl('/api/health'), { method: 'GET', headers: { Accept: 'application/json' } })
      ]);

      const parsedHealth = await safeParseJson<HealthResponse>(healthRes);
      if (parsedHealth.ok && parsedHealth.data) {
        setHealthStatus(parsedHealth.data);
      } else {
        setHealthStatus(null);
      }

      const parsedCfg = await safeParseJson<SmtpVaultResponse>(cfgRes);
      if (parsedCfg.isHtmlFallback) {
        setErrorMessage(
          language === 'hi'
            ? 'लाइव बैकएंड सर्वर (/api/*) से संपर्क नहीं हो सका। यदि वेबसाइट Netlify जैसी स्टैटिक होस्टिंग पर है, तो नीचे Backend Server URL दर्ज करें।'
            : 'Unable to reach live backend (/api/*). If hosted on static hosting like Netlify, set your live Node Backend Server URL below.'
        );
      } else if (parsedCfg.data?.success && parsedCfg.data.config) {
        const cfg = parsedCfg.data.config;
        setHost(cfg.host || '');
        setPort(cfg.port || 465);
        setSecure(Boolean(cfg.secure));
        setUser(cfg.user || '');
        setHasExistingPass(cfg.hasPassword);
        setMaskedPass(cfg.maskedPass || '');
        setFromName(cfg.fromName || 'Composite JHS Harsinghpur Gova');
        setFromEmail(cfg.fromEmail || cfg.user || '');
        setIsEnabled(cfg.isEnabled !== false);
        setIsConfigured(Boolean(cfg.isConfigured));
        setLastUpdated(cfg.lastUpdated || '');
        if (!testRecipient && (cfg.user || currentUser?.email)) {
          setTestRecipient(currentUser?.email || cfg.user || '');
        }
      } else if (parsedCfg.data?.error) {
        setErrorMessage(parsedCfg.data.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load SMTP configuration from backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfigAndHealth();
  }, [currentUser]);

  const applyPreset = (preset: 'gmail-ssl' | 'gmail-tls' | 'brevo' | 'zoho') => {
    if (preset === 'gmail-ssl') {
      setHost('smtp.gmail.com');
      setPort(465);
      setSecure(true);
    } else if (preset === 'gmail-tls') {
      setHost('smtp.gmail.com');
      setPort(587);
      setSecure(false);
    } else if (preset === 'brevo') {
      setHost('smtp-relay.brevo.com');
      setPort(587);
      setSecure(false);
    } else if (preset === 'zoho') {
      setHost('smtp.zoho.in');
      setPort(465);
      setSecure(true);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSaveSuccess(false);

    if (!host.trim() || !user.trim()) {
      setErrorMessage('SMTP Host and Username/Email are required.');
      return;
    }
    if (!hasExistingPass && !newPass.trim()) {
      setErrorMessage('SMTP Password or App Password is required.');
      return;
    }

    setIsSaving(true);
    try {
      const headers = await buildAuthHeaders(true);
      const res = await fetch(apiUrl('/api/admin/smtp-config'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          host: host.trim(),
          port: Number(port) || 465,
          secure,
          user: user.trim(),
          pass: isChangingPass && newPass.trim() ? newPass.trim() : undefined,
          fromName: fromName.trim() || 'Composite JHS Harsinghpur Gova',
          fromEmail: fromEmail.trim() || user.trim(),
          isEnabled,
          adminEmail: currentUser?.email || 'Super Admin',
          userRole: role || undefined,
          sessionToken: sessionToken || undefined
        })
      });

      const parsed = await safeParseJson<SmtpVaultResponse & { message?: string }>(res);
      if (parsed.isHtmlFallback) {
        throw new Error('Backend /api/admin/smtp-config returned HTML instead of JSON.');
      }

      if (parsed.data?.success && parsed.data.config) {
        const cfg = parsed.data.config;
        setHasExistingPass(cfg.hasPassword);
        setMaskedPass(cfg.maskedPass);
        setIsConfigured(cfg.isConfigured);
        setLastUpdated(cfg.lastUpdated);
        setIsChangingPass(false);
        setNewPass('');
        setSaveSuccess(true);

        if (addAuditLog) {
          await addAuditLog(
            'UPDATE_SMTP_EMAIL_CONFIG',
            'SMTPSettings',
            'smtp-vault',
            `Updated Live SMTP Server (${cfg.host}:${cfg.port}) for OTP & notifications.`
          );
        }

        // Refresh health check
        const healthRes = await fetch(apiUrl('/api/health'));
        const hParsed = await safeParseJson<HealthResponse>(healthRes);
        if (hParsed.ok && hParsed.data) setHealthStatus(hParsed.data);

        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(parsed.data?.error || 'Failed to save SMTP configuration.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error saving SMTP configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSmtpConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const headers = await buildAuthHeaders(true);
      const res = await fetch(apiUrl('/api/admin/smtp-test'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          host: host.trim() || undefined,
          port: Number(port) || 465,
          secure,
          user: user.trim() || undefined,
          pass: isChangingPass && newPass.trim() ? newPass.trim() : undefined,
          fromName: fromName.trim() || undefined,
          fromEmail: fromEmail.trim() || user.trim() || undefined,
          testRecipient: testRecipient.trim() || undefined,
          adminEmail: currentUser?.email || undefined,
          userRole: role || undefined,
          sessionToken: sessionToken || undefined
        })
      });

      const parsed = await safeParseJson<{ success: boolean; message?: string; error?: string }>(res);
      if (parsed.isHtmlFallback) {
        setTestResult({
          success: false,
          error: 'Backend API unreachable from this domain. Verify server deployment or Backend API URL.'
        });
      } else {
        setTestResult({
          success: Boolean(parsed.data?.success),
          message: parsed.data?.message,
          error: parsed.data?.error
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err?.message || 'SMTP connection probe failed.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveApiBase = async () => {
    const clean = customApiBase.trim().replace(/\/+$/, '');
    setCustomApiBaseUrl(clean);
    setApiBaseSaved(true);
    try {
      await updateSettings({ liveApiBaseUrl: clean });
    } catch {
      // ignore Firestore fallback errors
    }
    setTimeout(() => setApiBaseSaved(false), 3000);
    loadConfigAndHealth();
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-sm text-center max-w-xl mx-auto my-8 space-y-3">
        <Lock className="w-10 h-10 text-rose-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">
          {language === 'hi' ? 'केवल सुपर एडमिन के लिए' : 'Super Admin Access Only'}
        </h3>
        <p className="text-xs text-slate-600">
          SMTP credentials can only be viewed or modified by authorized Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Live Diagnostics */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-7 rounded-3xl shadow-md border border-blue-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/30 rounded-lg text-[11px] font-bold uppercase tracking-wide">
              <Mail className="w-3.5 h-3.5" />
              <span>Live OTP & Notification Mailer</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <Server className="w-6 h-6 text-amber-400" />
              <span>{language === 'hi' ? 'SMTP ईमेल सर्वर कॉन्फ़िगरेशन (Live Mode)' : 'SMTP Email Server Configuration'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {language === 'hi'
                ? 'लाइव वेबसाइट पर छात्र सत्यापन OTP और पासवर्ड रीसेट ईमेल भेजने के लिए वास्तविक SMTP सर्वर (जैसे Gmail App Password, Brevo, Zoho) यहाँ सेट करें।'
                : 'Configure a real SMTP server (Gmail App Password, Brevo, Zoho) so student registration OTPs and password reset emails deliver reliably on the live site.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                isConfigured
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isConfigured ? 'Live SMTP Active' : 'SMTP Not Configured'}</span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400">
                Updated: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Live Health Pill Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-blue-900/60 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Backend API</span>
            <span className={`font-bold ${healthStatus?.status === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {healthStatus?.status === 'ok' ? `Connected (${healthStatus.environment})` : 'Unreachable'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">SMTP Mailer</span>
            <span className={`font-bold ${healthStatus?.smtpConfigured ? 'text-emerald-400' : 'text-amber-300'}`}>
              {healthStatus?.smtpConfigured ? 'Live Ready' : 'Needs Credentials'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Cashfree PG</span>
            <span className={`font-bold ${healthStatus?.cashfreeConfigured && healthStatus?.cashfreeEnabled ? 'text-emerald-400' : 'text-amber-300'}`}>
              {healthStatus?.cashfreeConfigured
                ? (healthStatus?.cashfreeEnabled ? 'Configured & Live' : 'Paused')
                : 'Needs Keys'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Gateway Mode</span>
            <span className="font-bold text-sky-300 uppercase">
              {healthStatus?.cashfreeEnvironment || 'sandbox'}
            </span>
          </div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold block">SMTP Configuration Saved!</span>
            <span>Live OTP and password reset emails will immediately use these credentials.</span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main SMTP Config Card */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {language === 'hi' ? 'SMTP सर्वर विवरण व त्वरित प्रीसेट' : 'SMTP Server Credentials & Quick Presets'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a preset or enter your custom SMTP server host, port, and App Password.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => applyPreset('gmail-ssl')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Gmail (SSL 465)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('gmail-tls')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Gmail (TLS 587)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('brevo')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Brevo SMTP
            </button>
            <button
              type="button"
              onClick={() => applyPreset('zoho')}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-800 text-[11px] font-bold cursor-pointer transition-colors"
            >
              Zoho Mail
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading server SMTP vault...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveSmtpConfig} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">SMTP Host *</label>
                <input
                  type="text"
                  required
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Port *</label>
                <input
                  type="number"
                  required
                  value={port}
                  onChange={(e) => {
                    const p = Number(e.target.value) || 587;
                    setPort(p);
                    if (p === 465) setSecure(true);
                    else if (p === 587) setSecure(false);
                  }}
                  placeholder="465 or 587"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>Use SSL/TLS (Port 465)</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">SMTP Username / Email *</label>
                <input
                  type="text"
                  required
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="school.portal@gmail.com"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">SMTP Password / App Password *</label>
                  {hasExistingPass && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPass(!isChangingPass);
                        setNewPass('');
                      }}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {isChangingPass ? 'Keep Existing' : 'Replace'}
                    </button>
                  )}
                </div>

                {!isChangingPass && hasExistingPass ? (
                  <input
                    type="text"
                    disabled
                    value={maskedPass || '••••••••••••••••'}
                    className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                ) : (
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required={!hasExistingPass}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="16-char Gmail App Password"
                      className="w-full px-3.5 py-2 pr-9 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Sender Display Name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="Composite JHS Harsinghpur Gova"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">Sender Reply/From Email</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="no-reply@gmail.com (usually same as SMTP Username)"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>{language === 'hi' ? 'लाइव ईमेल सेवा सक्रिय रखें' : 'Enable Live Email Delivery'}</span>
                </label>
              </div>
            </div>

            {/* Live SMTP Probe + Send Test Email */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                <input
                  type="email"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                  placeholder="Enter test recipient email (e.g. yourname@gmail.com)"
                  className="flex-1 min-w-0 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleTestSmtpConnection}
                  disabled={isTesting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${isTesting ? 'animate-pulse' : ''}`} />
                  <span>{isTesting ? 'Verifying & Sending...' : 'Verify & Send Test Email'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{testResult.message || testResult.error}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving SMTP Vault...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? 'SMTP सेटिंग्स सेव करें' : 'Save SMTP Settings'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Static Hosting / Cross-Origin Backend API URL + Production Secrets Note */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>External Static Hosting Backend Override (Optional)</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            If the website frontend is hosted separately on Netlify or another static CDN without Node.js, paste your live Express backend URL below so Payment Gateway & OTP routes work seamlessly. Leave blank when running directly on the live Node server.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={customApiBase}
              onChange={(e) => setCustomApiBase(e.target.value)}
              placeholder="https://your-live-backend.run.app (leave blank for same-origin)"
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleSaveApiBase}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
            >
              {apiBaseSaved ? 'Saved!' : 'Apply URL'}
            </button>
          </div>
        </div>

        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600" />
            <span>Permanent Cloud Environment Variables Guide</span>
          </h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Settings saved above apply immediately in the active live server. To persist across fresh container rebuilds, also set these environment variables in your hosting Secrets:
          </p>
          <div className="bg-white p-3 rounded-xl border border-slate-200 font-mono text-[11px] text-slate-700 space-y-0.5">
            <div>SMTP_HOST=smtp.gmail.com</div>
            <div>SMTP_PORT=465</div>
            <div>SMTP_SECURE=true</div>
            <div>SMTP_USER=your-school-email@gmail.com</div>
            <div>SMTP_PASS=your-16-digit-app-password</div>
          </div>
        </div>
      </div>
    </div>
  );
};
