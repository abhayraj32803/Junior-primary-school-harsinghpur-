import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DonationRecord, DonationReasonConfig, RazorpayPaymentConfig } from '../../types';
import { testRazorpayApiKeys } from '../../utils/razorpay';
import { DonationReceiptModal } from '../public/DonationReceiptModal';
import { 
  CreditCard, 
  Key, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  Receipt, 
  Building2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  IndianRupee,
  RefreshCw,
  Sliders,
  Filter
} from 'lucide-react';
import { Modal } from '../common/Modal';

export const AdminDonations: React.FC = () => {
  const { settings, donations, updatePaymentConfig, language } = useSchool();

  // Active Razorpay config state
  const currentConfig = settings.paymentConfig || {
    keyId: '',
    keySecret: '',
    merchantName: settings.schoolName || 'Composite Junior High School',
    currency: 'INR',
    isEnabled: true,
    taxExemptionNumber: '80G-AAACT1234F-2025',
    donationReasons: []
  };

  const [keyId, setKeyId] = useState(currentConfig.keyId || '');
  const [keySecret, setKeySecret] = useState(currentConfig.keySecret || '');
  const [merchantName, setMerchantName] = useState(currentConfig.merchantName || settings.schoolName || '');
  const [taxExemptionNumber, setTaxExemptionNumber] = useState(currentConfig.taxExemptionNumber || '');
  const [isEnabled, setIsEnabled] = useState(currentConfig.isEnabled !== false);
  const [showSecret, setShowSecret] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isTestingKeys, setIsTestingKeys] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  // Reasons management state
  const [reasons, setReasons] = useState<DonationReasonConfig[]>(() => {
    if (currentConfig.donationReasons && currentConfig.donationReasons.length > 0) {
      return currentConfig.donationReasons;
    }
    return [
      {
        id: 'smart-class',
        labelEn: 'Smart Classroom & Computer Lab',
        labelHi: 'स्मार्ट क्लासरूम एवं कंप्यूटर लैब',
        descriptionEn: 'Interactive smart boards and computer workstations.',
        descriptionHi: 'कक्षा 1 से 8 के विद्यार्थियों के लिए डिजिटल बोर्ड।',
        targetAmount: 250000,
        collectedAmount: 84000,
        isActive: true,
        icon: 'Laptop'
      },
      {
        id: 'library-books',
        labelEn: 'Library Books & Knowledge Bank',
        labelHi: 'पुस्तकालय एवं ज्ञान संवर्धन केंद्र',
        descriptionEn: 'Enrich school library with reference books and encyclopedias.',
        descriptionHi: 'पुस्तकालय हेतु ज्ञानवर्धक पुस्तकें एवं शब्दकोश।',
        targetAmount: 100000,
        collectedAmount: 45000,
        isActive: true,
        icon: 'BookOpen'
      },
      {
        id: 'merit-scholarship',
        labelEn: 'Merit & Needy Student Scholarships',
        labelHi: 'मेधावी व निर्धन छात्र छात्रवृत्ति',
        descriptionEn: 'School bags, winter uniforms and stationery stipends.',
        descriptionHi: 'प्रतिभाशाली विद्यार्थियों को छात्रवृत्ति व अध्ययन सामग्री।',
        targetAmount: 150000,
        collectedAmount: 62000,
        isActive: true,
        icon: 'Award'
      },
      {
        id: 'sports-infra',
        labelEn: 'Sports & Athletics Infrastructure',
        labelHi: 'खेलकूद सामग्री एवं मैदान विकास',
        descriptionEn: 'Volleyball, badminton, cricket and athletic kits.',
        descriptionHi: 'शारीरिक विकास हेतु खेलकूद उपकरण।',
        targetAmount: 75000,
        collectedAmount: 31000,
        isActive: true,
        icon: 'Trophy'
      },
      {
        id: 'college-development',
        labelEn: 'General Institutional Development Fund',
        labelHi: 'सामान्य विद्यालय/कॉलेज विकास कोष',
        descriptionEn: 'Campus maintenance, green solar power and drinking RO water.',
        descriptionHi: 'परिसर का समग्र संवर्धन व आवश्यक सुविधाएं।',
        targetAmount: 300000,
        collectedAmount: 110000,
        isActive: true,
        icon: 'Building2'
      }
    ];
  });

  // Modal for adding / editing reason
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);
  const [reasonForm, setReasonForm] = useState<DonationReasonConfig>({
    id: '',
    labelEn: '',
    labelHi: '',
    descriptionEn: '',
    descriptionHi: '',
    targetAmount: 100000,
    collectedAmount: 0,
    isActive: true
  });

  // Donations table filter and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReasonFilter, setSelectedReasonFilter] = useState('ALL');
  const [viewingReceipt, setViewingReceipt] = useState<DonationRecord | null>(null);

  // Sync state if settings update
  React.useEffect(() => {
    if (settings.paymentConfig) {
      setKeyId(settings.paymentConfig.keyId || '');
      setKeySecret(settings.paymentConfig.keySecret || '');
      setMerchantName(settings.paymentConfig.merchantName || settings.schoolName || '');
      setTaxExemptionNumber(settings.paymentConfig.taxExemptionNumber || '');
      setIsEnabled(settings.paymentConfig.isEnabled !== false);
      if (settings.paymentConfig.donationReasons && settings.paymentConfig.donationReasons.length > 0) {
        setReasons(settings.paymentConfig.donationReasons);
      }
    }
  }, [settings.paymentConfig, settings.schoolName]);

  // Test API credentials with backend
  const handleTestKeys = async () => {
    setIsTestingKeys(true);
    setTestResult(null);

    const res = await testRazorpayApiKeys({
      keyId: keyId.trim(),
      keySecret: keySecret.trim()
    });

    setIsTestingKeys(false);
    setTestResult(res);
  };

  // Save updated config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    const updatedConfig: RazorpayPaymentConfig = {
      ...currentConfig,
      enabled: isEnabled,
      isEnabled,
      keyId: keyId.trim(),
      keySecret: keySecret.trim(),
      merchantName: merchantName.trim() || settings.schoolName,
      currency: 'INR',
      taxExemptionNumber: taxExemptionNumber.trim(),
      reasons: reasons,
      donationReasons: reasons
    };

    await updatePaymentConfig(updatedConfig);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Reason Modal actions
  const handleOpenAddReason = () => {
    setEditingReasonId(null);
    setReasonForm({
      id: `reason_${Date.now()}`,
      labelEn: '',
      labelHi: '',
      descriptionEn: '',
      descriptionHi: '',
      targetAmount: 100000,
      collectedAmount: 0,
      isActive: true
    });
    setIsReasonModalOpen(true);
  };

  const handleOpenEditReason = (r: DonationReasonConfig) => {
    setEditingReasonId(r.id);
    setReasonForm({ ...r });
    setIsReasonModalOpen(true);
  };

  const handleSaveReason = () => {
    if (!reasonForm.labelEn.trim() && !reasonForm.labelHi.trim()) return;

    let updatedReasons: DonationReasonConfig[];
    if (editingReasonId) {
      updatedReasons = reasons.map(r => r.id === editingReasonId ? { ...reasonForm } : r);
    } else {
      updatedReasons = [...reasons, { ...reasonForm, id: reasonForm.id || `reason_${Date.now()}` }];
    }

    setReasons(updatedReasons);
    setIsReasonModalOpen(false);

    // Persist immediately into payment config
    updatePaymentConfig({
      ...currentConfig,
      donationReasons: updatedReasons
    });
  };

  const handleDeleteReason = (id: string) => {
    const updated = reasons.filter(r => r.id !== id);
    setReasons(updated);
    updatePaymentConfig({
      ...currentConfig,
      donationReasons: updated
    });
  };

  const handleToggleReasonActive = (id: string) => {
    const updated = reasons.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r);
    setReasons(updated);
    updatePaymentConfig({
      ...currentConfig,
      donationReasons: updated
    });
  };

  // Filtered donations list
  const filteredDonations = donations.filter(d => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      d.donorName.toLowerCase().includes(q) ||
      d.receiptNumber.toLowerCase().includes(q) ||
      (d.razorpayPaymentId && d.razorpayPaymentId.toLowerCase().includes(q)) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(q)) ||
      (d.donorPhone && d.donorPhone.toLowerCase().includes(q)) ||
      (d.panNumber && d.panNumber.toLowerCase().includes(q));

    const matchesReason = selectedReasonFilter === 'ALL' || d.reasonId === selectedReasonFilter;

    return matchesSearch && matchesReason;
  });

  const totalAmount = donations.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-1">
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Razorpay Payment Gateway & Donations Hub</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'कॉलेज दान एवं रेज़रपे गेटवे प्रबंधन' : 'College Donations & Razorpay Gateway Controls'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi'
              ? 'यहाँ से आप कभी भी अपनी Razorpay API Key व Secret बदल सकते हैं, नए दान उद्देश्य जोड़ सकते हैं एवं दान रसीदें देख सकते हैं।'
              : 'Configure your active Razorpay Key ID and Secret anytime, manage customized donation causes, and review donation receipts.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
            isEnabled 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isEnabled ? 'Gateway Live & Active' : 'Gateway Paused'}</span>
          </span>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Funds Raised</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            ₹{totalAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% credited to College Account</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Donors</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {donations.length}
          </div>
          <div className="text-[10px] text-slate-400">Verified transactions</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Donation Causes</span>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {reasons.filter(r => r.isActive).length}
          </div>
          <div className="text-[10px] text-slate-400">Custom causes enabled</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Gateway Mode</span>
          <div className="text-lg font-black text-slate-900 truncate">
            {keyId.startsWith('rzp_live_') ? 'Production (Live)' : keyId ? 'Sandbox (Test)' : 'Simulation Mode'}
          </div>
          <div className="text-[10px] text-slate-400 font-mono truncate">{keyId || 'No Key Configured'}</div>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="font-bold">Razorpay configuration and donation causes saved successfully!</span>
            <p className="text-[11px] text-emerald-700 mt-0.5">
              Changes take effect immediately across the public donation page and payment order generator.
            </p>
          </div>
        </div>
      )}

      {/* 1. Razorpay Gateway API Configuration Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              <span>{language === 'hi' ? 'Razorpay API Key एवं क्रेडेंशियल सेटिंग' : 'Razorpay API Keys & Gateway Credentials'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'अपने Razorpay Dashboard (Dashboard -> Settings -> API Keys) से Key ID व Secret कॉपी करके यहाँ दर्ज करें। आप जब चाहें इसे बदल सकते हैं।'
                : 'Enter your live or test Razorpay API Key ID and Key Secret from your Razorpay Dashboard. You can modify these anytime.'}
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
            />
            <span>Enable Public Donation Portal</span>
          </label>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Razorpay Key ID *
              </label>
              <input
                type="text"
                required
                placeholder="rzp_test_... or rzp_live_..."
                value={keyId}
                onChange={(e) => setKeyId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Starts with <code className="text-slate-600 font-bold">rzp_test_</code> for test sandbox or <code className="text-slate-600 font-bold">rzp_live_</code> for real payments.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  Razorpay Key Secret *
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showSecret ? 'Hide Secret' : 'Show Secret'}</span>
                </button>
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                required
                placeholder="Enter Razorpay Key Secret"
                value={keySecret}
                onChange={(e) => setKeySecret(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Strictly secured server-side for cryptographic order creation & signature verification.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                College Merchant Name (Shown on Checkout Popup)
              </label>
              <input
                type="text"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Section 80G Tax Exemption Registration No.
              </label>
              <input
                type="text"
                placeholder="e.g. 80G-AAACT1234F-2025"
                value={taxExemptionNumber}
                onChange={(e) => setTaxExemptionNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono uppercase text-slate-900 focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          {/* Key test results */}
          {testResult && (
            <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              testResult.success 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <div>{testResult.message || testResult.error}</div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isTestingKeys || !keyId.trim() || !keySecret.trim()}
              onClick={handleTestKeys}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingKeys ? 'animate-spin' : ''}`} />
              <span>{isTestingKeys ? 'Testing with Razorpay...' : 'Test Razorpay Credentials'}</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer disabled:opacity-50"
              id="btn-save-razorpay-config"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save Razorpay Credentials'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Donation Causes & Reasons Management Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <span>{language === 'hi' ? 'कॉलेज दान के उद्देश्य व कारण (Donation Causes)' : 'Manage Donation Reasons & Causes'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'दानदाता किस उद्देश्य के लिए दान कर सकते हैं (जैसे स्मार्ट क्लास, लाइब्रेरी, खेलकूद आदि), उन कारणों को जोड़ें या संपादित करें।'
                : 'Configure donation causes and target amounts that donors can select from when contributing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddReason}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
            id="btn-add-donation-reason"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया उद्देश्य जोड़ें' : 'Add New Cause'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reasons.map((r) => (
            <div 
              key={r.id} 
              className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                r.isActive ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-dashed border-slate-300 opacity-60'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-900 leading-snug">
                    {r.labelHi || r.labelEn}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleReasonActive(r.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      r.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {r.isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  {r.labelEn}
                </div>

                <p className="text-[11px] text-slate-500 line-clamp-2">
                  {r.descriptionHi || r.descriptionEn}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                <span className="text-[11px] font-mono text-slate-600">
                  Target: <strong>₹{r.targetAmount?.toLocaleString('en-IN')}</strong>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEditReason(r)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Edit cause"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteReason(r.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete cause"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Donations Ledger & Transactions Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              <span>{language === 'hi' ? 'दान पंजिका एवं भुगतान पावती' : 'Donation Ledger & Official Receipts'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'सभी प्राप्त दानों की सूची, रसीद संख्या, डोनर विवरण एवं प्रिंट करने योग्य 80G रसीदें।'
                : 'Audited log of all contributions received via Razorpay with donor contact & downloadable receipts.'}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search donor, receipt, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500 w-48 sm:w-60"
              />
            </div>

            <select
              value={selectedReasonFilter}
              onChange={(e) => setSelectedReasonFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Causes</option>
              {reasons.map(r => (
                <option key={r.id} value={r.id}>{r.labelEn}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] uppercase tracking-wider font-bold">
                <th className="p-3">Receipt No.</th>
                <th className="p-3">Donor Name</th>
                <th className="p-3">Cause / Purpose</th>
                <th className="p-3">Amount (₹)</th>
                <th className="p-3">Payment ID</th>
                <th className="p-3">Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {d.receiptNumber}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">
                      {d.isAnonymous ? 'Anonymous Well-Wisher' : d.donorName}
                    </div>
                    {d.panNumber && (
                      <span className="text-[10px] text-slate-400 font-mono">PAN: {d.panNumber}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className="font-medium text-slate-800">
                      {d.reasonLabelHi || d.reasonLabelEn}
                    </span>
                    {d.customReason && (
                      <span className="block text-[10.5px] text-slate-400">{d.customReason}</span>
                    )}
                  </td>
                  <td className="p-3 font-mono font-black text-slate-900 text-sm">
                    ₹{d.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {d.razorpayPaymentId || 'Direct'}
                  </td>
                  <td className="p-3 text-slate-500 whitespace-nowrap">
                    {new Date(d.createdAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {d.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => setViewingReceipt(d)}
                      className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      title="View & Print 80G Receipt"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600" />
                      <span>80G Receipt</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredDonations.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No donation records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Donation Cause Modal */}
      <Modal
        isOpen={isReasonModalOpen}
        onClose={() => setIsReasonModalOpen(false)}
        title={editingReasonId ? 'Edit Donation Cause' : 'Add New Donation Cause'}
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cause Title in Hindi (हिंदी शीर्षक) *
            </label>
            <input
              type="text"
              placeholder="e.g. कंप्यूटर लैब एवं डिजिटल बोर्ड स्थापना"
              value={reasonForm.labelHi}
              onChange={(e) => setReasonForm({ ...reasonForm, labelHi: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cause Title in English *
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Lab & Digital Classroom"
              value={reasonForm.labelEn}
              onChange={(e) => setReasonForm({ ...reasonForm, labelEn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                value={reasonForm.targetAmount || 100000}
                onChange={(e) => setReasonForm({ ...reasonForm, targetAmount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Status
              </label>
              <select
                value={reasonForm.isActive ? 'active' : 'inactive'}
                onChange={(e) => setReasonForm({ ...reasonForm, isActive: e.target.value === 'active' })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="active">Active (Visible on Website)</option>
                <option value="inactive">Disabled / Paused</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Description / विवरण
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the cause and how the funds will benefit students..."
              value={reasonForm.descriptionEn}
              onChange={(e) => setReasonForm({ ...reasonForm, descriptionEn: e.target.value, descriptionHi: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReasonModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveReason}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-xs"
            >
              Save Cause
            </button>
          </div>
        </div>
      </Modal>

      {/* Official 80G Receipt Modal */}
      <DonationReceiptModal
        donation={viewingReceipt}
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />
    </div>
  );
};
