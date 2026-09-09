import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  fetchSecureRazorpayConfig, 
  saveSecureRazorpayConfig, 
  testSecureRazorpayConnection,
  SecureRazorpayVaultData 
} from '../../../utils/razorpay';
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
  Check,
  Building2,
  FileCheck
} from 'lucide-react';

export const AdminRazorpaySecureSettings: React.FC = () => {
  const { language, settings, updatePaymentConfig, addAuditLog } = useSchool();
  const { currentUser, role, sessionToken } = useAuth();

  // Security & Permission check: Only super admins are permitted
  const isSuperAdmin = role === 'admin' || 
    currentUser?.email === 'ngoaarya159@gmail.com' || 
    currentUser?.email === 'admin@school.gov.in';

  // Vault state from server
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Credentials form state
  const [keyId, setKeyId] = useState<string>('');
  const [hasExistingSecret, setHasExistingSecret] = useState<boolean>(false);
  const [maskedSecret, setMaskedSecret] = useState<string>('');
  const [newKeySecret, setNewKeySecret] = useState<string>('');
  const [isChangingSecret, setIsChangingSecret] = useState<boolean>(false);
  const [showNewSecret, setShowNewSecret] = useState<boolean>(false);
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [merchantName, setMerchantName] = useState<string>('');
  const [taxExemptionNumber, setTaxExemptionNumber] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [updatedBy, setUpdatedBy] = useState<string>('');

  // Test connection state
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message?: string;
    mode?: string;
    error?: string;
  } | null>(null);

  // Load secure configuration on mount
  useEffect(() => {
    loadSecureConfig();
  }, [currentUser]);

  const loadSecureConfig = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data: SecureRazorpayVaultData = await fetchSecureRazorpayConfig({
        token: sessionToken || undefined,
        adminEmail: currentUser?.email,
        userRole: role || undefined
      });

      if (data.success) {
        setKeyId(data.keyId || '');
        setHasExistingSecret(data.hasKeySecret);
        setMaskedSecret(data.maskedKeySecret || (data.hasKeySecret ? '••••••••••••••••' : ''));
        setIsEnabled(data.isEnabled !== false);
        setMerchantName(data.merchantName || settings.schoolName || 'Composite JHS Harsinghpur Gova');
        setTaxExemptionNumber(data.taxExemptionNumber || '80G-DEL-2024-00129');
        setLastUpdated(data.lastUpdated || '');
        setUpdatedBy(data.updatedBy || '');
      } else {
        // Fallback to existing public key in settings if available
        if (settings.paymentConfig?.keyId) {
          setKeyId(settings.paymentConfig.keyId);
        }
        if (data.error) {
          setErrorMessage(data.error);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to communicate with secure server vault.');
    } finally {
      setIsLoading(false);
    }
  };

  // Test live connection with Razorpay using server vault
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    setErrorMessage('');

    try {
      const res = await testSecureRazorpayConnection({
        keyId: keyId.trim() || undefined,
        keySecret: (isChangingSecret && newKeySecret.trim()) ? newKeySecret.trim() : undefined,
        adminEmail: currentUser?.email,
        userRole: role || undefined,
        sessionToken: sessionToken || undefined
      });

      setTestResult(res);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'Failed to run Razorpay connection probe.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Save updated credentials to the secure backend vault
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyId.trim()) {
      setErrorMessage('Razorpay Key ID is required.');
      return;
    }

    if (!hasExistingSecret && !newKeySecret.trim()) {
      setErrorMessage('Razorpay Key Secret is required for initial configuration.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      const isLive = keyId.trim().startsWith('rzp_live_');
      const payload = {
        keyId: keyId.trim(),
        keySecret: (isChangingSecret && newKeySecret.trim()) ? newKeySecret.trim() : undefined,
        isEnabled,
        isLiveMode: isLive,
        merchantName: merchantName.trim() || settings.schoolName,
        taxExemptionNumber: taxExemptionNumber.trim(),
        adminEmail: currentUser?.email || 'Super Admin',
        userRole: role || undefined,
        sessionToken: sessionToken || undefined
      };

      const res = await saveSecureRazorpayConfig(payload);

      if (res.success) {
        setSaveSuccess(true);
        setIsChangingSecret(false);
        setNewKeySecret('');
        
        // Refresh state from response
        if (res.config) {
          setHasExistingSecret(res.config.hasKeySecret);
          setMaskedSecret(res.config.maskedKeySecret);
          setLastUpdated(res.config.lastUpdated);
        }

        // Sync public, non-sensitive metadata (ONLY Key ID, status, and merchant name) to SchoolContext
        // NOTE: keySecret is explicitly OMITTED to protect it from exposure in Firestore/client state!
        await updatePaymentConfig({
          ...settings.paymentConfig,
          enabled: isEnabled,
          isEnabled,
          keyId: keyId.trim(),
          keySecret: '', // Strictly omitted from client/Firestore storage!
          merchantName: merchantName.trim() || settings.schoolName,
          taxExemptionNumber: taxExemptionNumber.trim()
        });

        // Add audit trail entry
        if (addAuditLog) {
          await addAuditLog({
            action: 'UPDATE_PAYMENT_GATEWAY_CREDENTIALS',
            category: 'SECURITY',
            details: `Updated Razorpay API Key ID (${keyId.trim().substring(0, 10)}...) and vault credentials. Mode: ${isLive ? 'LIVE' : 'TEST'}`,
            performedBy: currentUser?.email || currentUser?.displayName || 'Super Admin',
            userRole: role || 'admin',
            timestamp: new Date().toISOString()
          });
        }

        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        setErrorMessage(res.error || 'Failed to update credentials in server vault.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  // Unauthorized Super Admin fallback
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
            ? 'वित्तीय सुरक्षा के लिए Razorpay API Key व Secret प्रबंधन केवल अधिकृत सुपर एडमिन द्वारा ही किया जा सकता है। कृपया अपने मुख्य प्रशासक से संपर्क करें।'
            : 'For financial security and compliance, Razorpay payment gateway credentials can only be inspected or modified by designated Super Administrators.'}
        </p>
        <div className="pt-2 text-xs font-mono text-slate-400 bg-slate-50 py-2 rounded-xl border border-slate-200">
          Current User: {currentUser?.email || 'Guest'} | Role: {role || 'Standard'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner with Security Badges */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-indigo-900/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold tracking-wide uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>End-to-End Server Vault</span>
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold tracking-wide flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Zero Frontend Exposure</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Key className="w-6 h-6 text-amber-400" />
              <span>{language === 'hi' ? 'रेज़रपे सिक्योर एपीआई एवं गेटवे वॉल्ट' : 'Razorpay Secure Gateway & API Key Vault'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              {language === 'hi'
                ? 'यहाँ सुपर एडमिन सुरक्षित रूप से Razorpay Key ID और Key Secret अपडेट कर सकते हैं। यह संवेदनशील डेटा केवल बैकएंड सर्वर वॉल्ट में सुरक्षित रहता है एवं कभी भी ब्राउज़र में एक्सपोज़ नहीं होता।'
                : 'Super Admins can dynamically update the active Razorpay Key ID and Key Secret here. Sensitive secrets are stored strictly in the isolated server vault and never leaked to the client.'}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${
              keyId.startsWith('rzp_live_')
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : keyId.startsWith('rzp_test_')
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-700/50 text-slate-300 border-slate-600'
            }`}>
              <Zap className="w-3.5 h-3.5" />
              <span>{keyId.startsWith('rzp_live_') ? 'Production (Live Mode)' : keyId.startsWith('rzp_test_') ? 'Sandbox (Test Mode)' : 'Unconfigured'}</span>
            </div>
            {lastUpdated && (
              <span className="text-[10px] text-slate-400">
                Last Vault Sync: {new Date(lastUpdated).toLocaleDateString()} {new Date(lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Security Architecture Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-indigo-900/60 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Server className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Server-Side Storage</span>
              <span className="text-[11px] text-slate-400">Keys reside on isolated container filesystem (`data/secure_razorpay.json`).</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Cryptographic Verification</span>
              <span className="text-[11px] text-slate-400">HMAC-SHA256 signature verification executes strictly in the backend runtime.</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <FileCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200 block">Section 80G Compliant</span>
              <span className="text-[11px] text-slate-400">Official tax deduction receipts automatically tagged with registration IDs.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Credentials successfully encrypted & stored in server vault!</span>
            <span className="text-emerald-700">
              New transactions and donation checkouts will immediately use these updated keys. Secret was successfully omitted from client Firestore.
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center gap-3 animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <span className="font-bold text-sm block">Gateway Configuration Notice</span>
            <span className="text-rose-700">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? 'रेज़रपे एपीआई कुंजी व सीक्रेट क्रेडेंशियल्स' : 'Razorpay API Key & Secret Credentials'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'Razorpay Dashboard (Settings -> API Keys) से प्राप्त Key ID व Key Secret यहाँ दर्ज करें।'
                : 'Enter your live or test keys generated in your Razorpay Dashboard (Settings -> API Keys).'}
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none transition-colors">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <span>{language === 'hi' ? 'सार्वजनिक डोनेशन पोर्टल सक्रिय रखें' : 'Online Donation Portal Active'}</span>
          </label>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
            <span className="text-xs font-medium">Connecting to secure server vault...</span>
          </div>
        ) : (
          <form onSubmit={handleSaveConfig} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Key ID Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Razorpay Key ID</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    keyId.startsWith('rzp_live_')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : keyId.startsWith('rzp_test_')
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {keyId.startsWith('rzp_live_') ? 'LIVE KEY' : keyId.startsWith('rzp_test_') ? 'TEST KEY' : 'FORMAT: rzp_...'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="rzp_test_... or rzp_live_..."
                  value={keyId}
                  onChange={(e) => setKeyId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500 transition-colors"
                />
                <span className="text-[11px] text-slate-500 block">
                  Public identifier passed to checkout modal during payment session creation.
                </span>
              </div>

              {/* Key Secret Field with Server-Side Masking */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>Razorpay Key Secret</span>
                    <span className="text-rose-500">*</span>
                  </label>

                  {hasExistingSecret && !isChangingSecret && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSecret(true);
                        setNewKeySecret('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>{language === 'hi' ? 'नया सीक्रेट बदलें' : 'Replace Secret'}</span>
                    </button>
                  )}

                  {isChangingSecret && hasExistingSecret && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingSecret(false);
                        setNewKeySecret('');
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      {language === 'hi' ? 'रद्द करें (मौजूदा रखें)' : 'Keep Existing Secret'}
                    </button>
                  )}
                </div>

                {!isChangingSecret && hasExistingSecret ? (
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      disabled
                      value={maskedSecret}
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
                      placeholder={hasExistingSecret ? 'Enter new Key Secret to replace existing' : 'Paste Razorpay Key Secret'}
                      value={newKeySecret}
                      onChange={(e) => setNewKeySecret(e.target.value)}
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
                  {isChangingSecret 
                    ? 'Note: Upon saving, this secret will be securely encrypted into the backend vault.'
                    : 'The secret is never transmitted to the frontend and is kept strictly in the server vault.'}
                </span>
              </div>

              {/* Merchant / Institution Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>College Merchant Name (Modal Display)</span>
                </label>
                <input
                  type="text"
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Composite Junior High School Harsinghpur Gova"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 block">
                  Institutional title shown at the top of the Razorpay checkout overlay.
                </span>
              </div>

              {/* 80G Tax Exemption Registration */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Section 80G Tax Exemption Certificate Number</span>
                </label>
                <input
                  type="text"
                  value={taxExemptionNumber}
                  onChange={(e) => setTaxExemptionNumber(e.target.value)}
                  placeholder="e.g. 80G-DEL-2024-00129"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 block">
                  Printed on official donor receipts for Indian Income Tax exemption eligibility.
                </span>
              </div>
            </div>

            {/* Test Connection Probe Diagnostic Box */}
            {testResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.success ? 'Razorpay API Handshake Successful!' : 'Connection Handshake Failed'}</span>
                  {testResult.mode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-mono font-bold">
                      {testResult.mode} MODE
                    </span>
                  )}
                </div>
                <p className="text-xs">
                  {testResult.message || testResult.error}
                </p>
                {testResult.success && (
                  <p className="text-[11px] text-emerald-700">
                    A test verification order was successfully generated and acknowledged by Razorpay API servers.
                  </p>
                )}
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting || (!keyId && !hasExistingSecret)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Testing Connection...' : 'Test API Connection'}</span>
                </button>

                <a
                  href="https://dashboard.razorpay.com/app/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 underline underline-offset-2"
                >
                  <span>Razorpay Keys Docs</span>
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
                    <span>Encrypting & Storing in Vault...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{language === 'hi' ? 'सुरक्षित वॉल्ट में सेव करें' : 'Save to Secure Vault'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Best Practices Card */}
      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Security & Compliance Checklist for College Administration</span>
        </h4>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
          <li>
            <strong>Test Mode First:</strong> Always verify transactions using test keys (<code className="font-mono text-slate-800 font-bold">rzp_test_...</code>) before entering live credentials.
          </li>
          <li>
            <strong>Rotation:</strong> If you suspect any credential compromise, regenerate the Key Secret in your Razorpay Dashboard and immediately update it here.
          </li>
          <li>
            <strong>Zero Frontend Leakage:</strong> This portal securely routes orders and HMAC verification through the backend. Key Secrets are never stored in browser localStorage, cookies, or public Firestore collections.
          </li>
        </ul>
      </div>
    </div>
  );
};
