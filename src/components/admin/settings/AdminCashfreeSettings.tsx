import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import {
  fetchSecureCashfreeConfig,
  saveSecureCashfreeConfig,
  testSecureCashfreeConnection,
  fetchCashfreeServerLogs,
  SecureCashfreeVaultData,
  CashfreeDiagnostics,
  CashfreeServerLogEntry
} from '../../../utils/cashfree';
import {
  apiUrl,
  getApiBaseUrl,
  setCustomApiBaseUrl,
  probeBackendHealth,
  BackendHealthResult
} from '../../../utils/apiClient';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Zap,
  ExternalLink,
  Info,
  Building2,
  FileCheck,
  Globe
} from 'lucide-react';

export const AdminCashfreeSettings: React.FC = () => {
  const { language, settings, updateSettings, updatePaymentConfig, addAuditLog } = useSchool();
  const { currentUser, role, sessionToken } = useAuth();

  const isSuperAdmin =
    role === 'admin' ||
    currentUser?.email === 'ngoaarya159@gmail.com';

  // Vault state from server
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Masked Vault Indicators
  const [hasExistingAppId, setHasExistingAppId] = useState<boolean>(false);
  const [maskedAppId, setMaskedAppId] = useState<string>('');
  const [newAppId, setNewAppId] = useState<string>('');
  const [isChangingAppId, setIsChangingAppId] = useState<boolean>(false);

  const [hasExistingSecret, setHasExistingSecret] = useState<boolean>(false);
  const [maskedSecretKey, setMaskedSecretKey] = useState<string>('');
  const [newSecretKey, setNewSecretKey] = useState<string>('');
  const [isChangingSecret, setIsChangingSecret] = useState<boolean>(false);
  const [showNewSecret, setShowNewSecret] = useState<boolean>(false);

  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [merchantName, setMerchantName] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number>(100);
  const [taxExemptionNumber, setTaxExemptionNumber] = useState<string>('80G-DEL-2024-00129');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    environment?: string;
    error?: string;
  } | null>(null);
  const [diagnostics, setDiagnostics] = useState<CashfreeDiagnostics | null>(null);
  const [serverLogs, setServerLogs] = useState<CashfreeServerLogEntry[]>([]);
  const [showServerLogs, setShowServerLogs] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthResult | null>(null);
  const [customApiBase, setCustomApiBase] = useState<string>(() => getApiBaseUrl() || settings.liveApiBaseUrl || '');
  const [apiBaseSaved, setApiBaseSaved] = useState<boolean>(false);

  useEffect(() => {
    loadSecureConfig();
  }, [currentUser, sessionToken, settings.liveApiBaseUrl]);

  const loadSecureConfig = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const authMeta = {
        token: sessionToken || undefined,
        adminEmail: currentUser?.email || undefined,
        userRole: role || undefined
      };
      const [data, logRes, healthRes] = await Promise.all([
        fetchSecureCashfreeConfig(authMeta),
        fetchCashfreeServerLogs(authMeta),
        probeBackendHealth()
      ]);
      setBackendHealth(healthRes);
      if (logRes.success) {
        if (logRes.diagnostics) setDiagnostics(logRes.diagnostics);
        if (logRes.logs) setServerLogs(logRes.logs);
      }

      if (data.success) {
        setHasExistingAppId(data.hasAppId);
        setMaskedAppId(data.maskedAppId || '');
        setHasExistingSecret(data.hasSecretKey);
        setMaskedSecretKey(data.maskedSecretKey || '');
        setEnvironment(data.environment === 'production' ? 'production' : 'sandbox');
        setIsEnabled(data.isEnabled !== false);
        setMerchantName(data.merchantName || settings.schoolName || 'Composite JHS Harsinghpur Gova');
        setMinAmount(data.minAmount || 100);
        setTaxExemptionNumber(data.taxExemptionNumber || '80G-DEL-2024-00129');
        setLastUpdated(data.lastUpdated || '');
      } else if (data.error) {
        setErrorMessage(data.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to communicate with Cashfree secure server vault.');
    } finally {
      setIsLoading(false);
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
    loadSecureConfig();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const res = await testSecureCashfreeConnection({
        appId: (isChangingAppId || !hasExistingAppId) && newAppId.trim() ? newAppId.trim() : undefined,
        secretKey: (isChangingSecret || !hasExistingSecret) && newSecretKey.trim() ? newSecretKey.trim() : undefined,
        environment,
        adminEmail: currentUser?.email || undefined,
        userRole: role || undefined,
        sessionToken: sessionToken || undefined
      });
      setTestResult(res);
      const logRes = await fetchCashfreeServerLogs({
        token: sessionToken || undefined,
        adminEmail: currentUser?.email || undefined,
        userRole: role || undefined
      });
      if (logRes.success) {
        if (logRes.diagnostics) setDiagnostics(logRes.diagnostics);
        if (logRes.logs) setServerLogs(logRes.logs);
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err?.message || 'Failed to verify Cashfree API credentials.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasExistingAppId && !newAppId.trim()) {
      setErrorMessage('Cashfree App ID (Client ID) is required.');
      return;
    }
    if (!hasExistingSecret && !newSecretKey.trim()) {
      setErrorMessage('Cashfree Secret Key (Client Secret) is required.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const payload = {
        appId: (isChangingAppId || !hasExistingAppId) && newAppId.trim() ? newAppId.trim() : undefined,
        secretKey: (isChangingSecret || !hasExistingSecret) && newSecretKey.trim() ? newSecretKey.trim() : undefined,
        environment,
        isEnabled,
        merchantName: merchantName.trim() || settings.schoolName,
        minAmount: Number(minAmount) >= 1 ? Math.round(Number(minAmount)) : 100,
        taxExemptionNumber: taxExemptionNumber.trim(),
        adminEmail: currentUser?.email || 'Super Admin',
        userRole: role || undefined,
        sessionToken: sessionToken || undefined
      };

      const res = await saveSecureCashfreeConfig(payload);

      if (res.success) {
        setSaveSuccess(true);
        setIsChangingAppId(false);
        setIsChangingSecret(false);
        setNewAppId('');
        setNewSecretKey('');

        if (res.config) {
          setHasExistingAppId(res.config.hasAppId);
          setMaskedAppId(res.config.maskedAppId);
          setHasExistingSecret(res.config.hasSecretKey);
          setMaskedSecretKey(res.config.maskedSecretKey);
          setLastUpdated(res.config.lastUpdated);
        }

        // Sync ONLY non-sensitive metadata to SchoolContext / Firestore (NEVER keys!)
        await updatePaymentConfig({
          ...settings.paymentConfig,
          enabled: isEnabled,
          isEnabled,
          environment,
          merchantName: merchantName.trim() || settings.schoolName,
          minAmount: Number(minAmount) >= 1 ? Math.round(Number(minAmount)) : 100,
          taxExemptionNumber: taxExemptionNumber.trim()
        });

        if (addAuditLog) {
          await addAuditLog(
            'UPDATE_CASHFREE_CREDENTIALS',
            'PaymentGateway',
            'cashfree',
            `Updated Cashfree PG configuration (${environment.toUpperCase()} mode, Enabled: ${isEnabled})`
          );
        }

        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to save Cashfree credentials in server vault.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unexpected error while saving Cashfree vault configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4 text-center max-w-xl mx-auto my-8">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          {language === 'hi' ? 'प्रतिबंधित क्षेत्र - केवल सुपर एडमिन' : 'Access Restricted: Super Admin Only'}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {language === 'hi'
            ? 'वित्तीय सुरक्षा के लिए Cashfree App ID और Secret Key प्रबंधन केवल अधिकृत सुपर एडमिन द्वारा ही किया जा सकता है।'
            : 'For financial security, Cashfree payment gateway credentials can only be viewed or updated by designated Super Administrators.'}
        </p>
      </div>
    );
  }

  const activeBase = getApiBaseUrl();
  const webhookEndpoint = activeBase
    ? apiUrl('/api/cashfree/webhook')
    : (typeof window !== 'undefined'
        ? `${window.location.origin}/api/cashfree/webhook`
        : '/api/cashfree/webhook');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-indigo-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cashfree PG v3 Server Vault</span>
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Zero Browser Key Exposure</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Key className="w-6 h-6 text-amber-400" />
              <span>{language === 'hi' ? 'कैशफ्री पेमेंट गेटवे सिक्योर वॉल्ट' : 'Cashfree Payment Gateway Secure Vault'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {language === 'hi'
                ? 'यहाँ सुपर एडमिन सुरक्षित रूप से Cashfree App ID और Secret Key दर्ज कर सकते हैं। सभी API कुंजियाँ केवल बैकएंड सर्वर वॉल्ट में सुरक्षित रहती हैं और कभी भी ब्राउज़र या पब्लिक Firestore में नहीं भेजी जातीं।'
                : 'Configure your Cashfree Payments App ID and Secret Key here. All credentials remain strictly inside the isolated server vault and are never sent to the browser or Firestore.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
                !hasExistingAppId || !hasExistingSecret
                  ? 'bg-slate-700/60 text-slate-300 border-slate-600'
                  : environment === 'production'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>
                {!hasExistingAppId || !hasExistingSecret
                  ? 'Keys Required'
                  : environment === 'production'
                  ? 'Production (Live Mode)'
                  : 'Sandbox (Test Mode)'}
              </span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400">
                Last Sync: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Security Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-900/60 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Isolated Server Vault</span>
              <span className="text-[11px] text-slate-400">App ID & Secret Key are kept strictly server-side (`process.env` / vault).</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Webhook & API Verification</span>
              <span className="text-[11px] text-slate-400">Order status & HMAC-SHA256 webhook signatures verified on backend.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <FileCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Official Cashfree PG v3 SDK</span>
              <span className="text-[11px] text-slate-400">Instant UPI, Cards, NetBanking & Wallets checkout with 80G receipts.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Cashfree API credentials saved securely in server vault!</span>
            <span className="text-emerald-700">
              Donation checkout now uses Cashfree {environment.toUpperCase()} PG v3. Secret credentials were omitted from Firestore.
            </span>
          </div>
        </div>
      )}

      {backendHealth?.isHtmlFallback && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-950 space-y-2 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">
                {language === 'hi'
                  ? 'स्टैटिक होस्टिंग पर बैकएंड सर्वर (/api/*) उपलब्ध नहीं है (HTML <!doctype> प्राप्त हुआ)'
                  : 'Static Hosting Detected: /api/* returned HTML (<!doctype>) instead of JSON'}
              </span>
              <p className="text-amber-900 leading-relaxed">
                {language === 'hi'
                  ? 'जब वेबसाइट Netlify या Firebase Hosting जैसी स्टैटिक होस्टिंग पर लाइव होती है, तो /api/cashfree/* अनुरोध बैकएंड सर्वर के बजाय index.html लौटाते हैं (जिससे "Unexpected token \'<\', <!doctype..." त्रुटि आती है)। समाधान के लिए वेबसाइट को Node सर्वर (npm start) पर होस्ट करें या नीचे अपना लाइव Node Backend Server URL सेव करें।'
                  : 'This happens when the built frontend is deployed on static hosting (like Netlify or Firebase Hosting) without the Express Node server running at /api/*. Deploy the full-stack Node server (npm start) or enter your live Node Backend Server URL below.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Cashfree Vault Notice</span>
            <span className="text-rose-700">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Cashfree Config Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? 'Cashfree API कुंजी व सेटिंग्स' : 'Cashfree App ID, Secret Key & Environment'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'Cashfree Merchant Dashboard (Developers -> API Keys) से App ID और Secret Key यहाँ दर्ज करें।'
                : 'Enter your App ID and Secret Key from Cashfree Merchant Dashboard (Developers -> Payment Gateway -> API Keys).'}
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none transition-colors">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <span>{language === 'hi' ? 'ऑनलाइन भुगतान पोर्टल सक्रिय रखें' : 'Cashfree Checkout Active'}</span>
          </label>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-xs font-medium">Loading Cashfree server vault...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* App ID Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Cashfree App ID (Client ID)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {hasExistingAppId && !isChangingAppId && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingAppId(true);
                        setNewAppId('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{language === 'hi' ? 'App ID बदलें' : 'Replace App ID'}</span>
                    </button>
                  )}
                  {isChangingAppId && hasExistingAppId && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingAppId(false);
                        setNewAppId('');
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Keep Existing
                    </button>
                  )}
                </div>

                {!isChangingAppId && hasExistingAppId ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      value={maskedAppId}
                      className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 select-none cursor-not-allowed"
                    />
                    <div className="absolute right-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Vault Protected</span>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    required={!hasExistingAppId}
                    placeholder="Paste Cashfree App ID (e.g. TEST10... or PROD...)"
                    value={newAppId}
                    onChange={(e) => setNewAppId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors"
                  />
                )}
                <span className="text-[11px] text-slate-500 block">
                  Stored exclusively in backend server vault; never sent to browser.
                </span>
              </div>

              {/* Secret Key Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Cashfree Secret Key (Client Secret)</span>
                    <span className="text-rose-500">*</span>
                  </label>

                  {hasExistingSecret && !isChangingSecret && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSecret(true);
                        setNewSecretKey('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{language === 'hi' ? 'Secret बदलें' : 'Replace Secret'}</span>
                    </button>
                  )}

                  {isChangingSecret && hasExistingSecret && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSecret(false);
                        setNewSecretKey('');
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Keep Existing Secret
                    </button>
                  )}
                </div>

                {!isChangingSecret && hasExistingSecret ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      value={maskedSecretKey}
                      className="w-full px-3.5 py-2.5 bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-mono text-slate-500 select-none cursor-not-allowed"
                    />
                    <div className="absolute right-3 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Vault Protected</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      type={showNewSecret ? 'text' : 'password'}
                      required={!hasExistingSecret}
                      placeholder={hasExistingSecret ? 'Enter new Cashfree Secret Key' : 'Paste Cashfree Secret Key (cfsk_ma_...)'}
                      value={newSecretKey}
                      onChange={(e) => setNewSecretKey(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewSecret(!showNewSecret)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showNewSecret ? 'Hide characters' : 'Show characters'}
                    >
                      {showNewSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <span className="text-[11px] text-slate-500 block">
                  Used strictly on server for order creation, payment status verification, and webhook HMAC signatures.
                </span>
              </div>

              {/* Environment Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>Gateway Environment</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnvironment('sandbox')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      environment === 'sandbox'
                        ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Sandbox (Test)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvironment('production')}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
                      environment === 'production'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Production (Live)
                  </button>
                </div>
              </div>

              {/* Minimum Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span>Minimum Contribution Amount (₹)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value) || 100)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* Merchant Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Institution Display Name</span>
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Composite Junior High School Harsinghpur Gova"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
              </div>

              {/* 80G Registration Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Section 80G Certificate Number</span>
                </label>
                <input
                  type="text"
                  value={taxExemptionNumber}
                  onChange={(e) => setTaxExemptionNumber(e.target.value)}
                  placeholder="e.g. 80G-DEL-2024-00129"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Test Connection Result */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.success ? 'Cashfree API Connection Verified!' : 'Cashfree Authentication Failed'}</span>
                  {testResult.environment && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-mono font-bold uppercase">
                      {testResult.environment}
                    </span>
                  )}
                </div>
                <p>{testResult.message || testResult.error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Cashfree API...' : 'Test Cashfree Connection'}</span>
                </button>

                <a
                  href="https://merchant.cashfree.com/merchants/pg/developers/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Cashfree Dashboard Keys</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Server Vault...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? 'Cashfree वॉल्ट में सेव करें' : 'Save to Cashfree Vault'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Webhook & Required Details Checklist */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Cashfree Integration & Webhook Checklist</span>
        </h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Required Credentials:</strong> Enter your Cashfree <strong>App ID</strong> (`x-client-id`) and <strong>Secret Key</strong> (`x-client-secret`) above (or set `CASHFREE_APP_ID`, `CASHFREE_SECRET_KEY`, `CASHFREE_ENV` in server environment Secrets).
          </li>
          <li>
            <strong>Webhook URL:</strong> Configure <code className="font-mono text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">{webhookEndpoint}</code> in your Cashfree Merchant Dashboard (Developers → Webhooks) for server-side payment confirmations.
          </li>
          <li>
            <strong>Zero Frontend Exposure:</strong> Neither App ID nor Secret Key is stored in browser storage or public Firestore; all Cashfree PG v3 calls and HMAC signature checks run exclusively on the server.
          </li>
        </ul>
      </div>

      {/* Live Server Environment Diagnostics & Recent Transaction Logs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Live Server Environment & Transaction Error Logs
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Inspect active backend endpoint, CASHFREE_ENV state, and real-time Cashfree API error traces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowServerLogs(!showServerLogs);
              if (!showServerLogs) loadSecureConfig();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer transition-colors"
          >
            {showServerLogs ? 'Hide Diagnostics' : 'View Server Diagnostics & Logs'}
          </button>
        </div>

        {diagnostics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">CASHFREE_ENV</span>
              <span className={`font-mono font-bold ${diagnostics.activeEnvironment === 'production' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {diagnostics.cashfreeEnvVar || diagnostics.activeEnvironment}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">API Endpoint</span>
              <span className="font-mono text-slate-800 truncate block">{diagnostics.apiBaseUrl}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Key Source</span>
              <span className="font-mono text-slate-800">{diagnostics.credentialSource}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 uppercase font-bold block text-[10px]">Key vs Env Match</span>
              <span className={`font-bold ${diagnostics.envMismatch ? 'text-rose-600' : 'text-emerald-700'}`}>
                {diagnostics.envMismatch ? 'MISMATCH DETECTED' : `Matched (${diagnostics.keyPrefixMode})`}
              </span>
            </div>
          </div>
        )}

        {showServerLogs && (
          <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pt-2 border-t border-slate-100">
            {serverLogs.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-4">
                No Cashfree server logs recorded yet in this session.
              </div>
            ) : (
              serverLogs.map((entry) => (
                <div
                  key={entry.traceId}
                  className={`p-3 rounded-xl border text-[11px] font-mono space-y-1 ${
                    entry.outcome === 'SUCCESS'
                      ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 font-bold">
                    <span>[{entry.operation}] {entry.outcome} ({entry.environment})</span>
                    <span className="text-[10px] text-slate-500">{entry.traceId} • {new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {(entry.orderId || entry.httpStatus || entry.cashfreeCode) && (
                    <div className="text-[10px] text-slate-700">
                      {entry.orderId ? `Order: ${entry.orderId} | ` : ''}
                      {entry.httpStatus ? `HTTP: ${entry.httpStatus} | ` : ''}
                      {entry.cashfreeCode ? `Code: ${entry.cashfreeCode}` : ''}
                    </div>
                  )}
                  {(entry.cashfreeMessage || entry.errorDetail) && (
                    <div className="text-[10px] break-all text-slate-700">
                      {entry.cashfreeMessage || entry.errorDetail}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Live Backend API URL Override for Static Hosting (Netlify / Firebase Hosting) */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            <span>Live Node Backend Server URL (For Static Hosting Only)</span>
          </h4>
          {backendHealth && (
            <span
              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
                backendHealth.reachable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {backendHealth.reachable
                ? `API Connected (${backendHealth.health?.environment || 'live'})`
                : backendHealth.isHtmlFallback
                ? 'Static HTML Fallback (No Node API)'
                : 'Backend Unreachable'}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          When running the full-stack server (AI Studio Live / Cloud Run <code className="font-mono bg-white px-1 rounded border border-slate-200">npm start</code>), leave this blank so same-origin <code className="font-mono bg-white px-1 rounded border border-slate-200">/api/*</code> is used. Only if the frontend is hosted separately on static hosting (Netlify, Firebase Hosting), paste your live Node Express server URL below — it syncs via Firestore for all donors.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={customApiBase}
            onChange={(e) => setCustomApiBase(e.target.value)}
            placeholder="https://your-live-node-server.run.app (leave blank for same-origin)"
            className="flex-1 min-w-0 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900"
          />
          <button
            type="button"
            onClick={handleSaveApiBase}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0"
          >
            {apiBaseSaved ? 'Saved & Synced!' : 'Save Backend URL'}
          </button>
        </div>
      </div>
    </div>
  );
};
