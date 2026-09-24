import React, { useState, useMemo, useEffect } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { DonationRecord, DonationReasonConfig } from '../../types';
import { createRupayexOrder, checkRupayexOrderStatus } from '../../utils/rupayex';
import { DonationReceiptModal } from './DonationReceiptModal';
import { RupayexPaymentModal } from './RupayexPaymentModal';
import { 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  CreditCard, 
  Lock, 
  Building2, 
  BookOpen, 
  Laptop, 
  Award, 
  FileText, 
  Users, 
  ArrowRight, 
  AlertCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Trophy,
  Landmark,
  GraduationCap
} from 'lucide-react';

interface DonationPageProps {
  onNavigate?: (page: string) => void;
}

const PRESET_AMOUNTS = [100, 500, 1100, 2100, 5100, 11000];

export const DonationPage: React.FC<DonationPageProps> = ({ onNavigate }) => {
  const { settings, donations, addDonationRecord, language } = useSchool();

  const paymentConfig = settings.paymentConfig;
  const isEnabled = paymentConfig?.isEnabled !== false;

  // Active donation causes - simplified, clear and impactful
  const reasons: DonationReasonConfig[] = useMemo(() => {
    if (paymentConfig?.donationReasons && paymentConfig.donationReasons.length > 0) {
      return paymentConfig.donationReasons.filter(r => r.isActive);
    }
    return [
      {
        id: 'college-development',
        labelEn: 'General School Development Fund',
        labelHi: 'सामान्य विद्यालय विकास कोष',
        descriptionEn: 'Campus maintenance, clean RO drinking water, school infrastructure and priority needs.',
        descriptionHi: 'परिसर संवर्धन, स्वच्छ RO पेयजल, भौतिक ढांचा व प्राथमिक विकास कार्य।',
        isActive: true,
        icon: 'Building2'
      },
      {
        id: 'smart-class',
        labelEn: 'Smart Classroom & Computer Lab',
        labelHi: 'स्मार्ट क्लासरूम एवं कंप्यूटर लैब',
        descriptionEn: 'Interactive digital learning, computers, and multimedia education for rural students.',
        descriptionHi: 'कक्षा 1 से 8 के विद्यार्थियों के लिए डिजिटल बोर्ड व कंप्यूटर शिक्षा।',
        isActive: true,
        icon: 'Laptop'
      },
      {
        id: 'library-books',
        labelEn: 'Library Books & Knowledge Bank',
        labelHi: 'पुस्तकालय एवं ज्ञान संवर्धन केंद्र',
        descriptionEn: 'Enriching our library with reference books, dictionaries, and science kits.',
        descriptionHi: 'ज्ञानवर्धक पुस्तकें, बाल साहित्य, शब्दकोश एवं विज्ञान मॉडल्स।',
        isActive: true,
        icon: 'BookOpen'
      },
      {
        id: 'merit-scholarship',
        labelEn: 'Merit & Needy Student Scholarships',
        labelHi: 'मेधावी व निर्धन छात्र सहायता',
        descriptionEn: 'Educational stipends, school bags, stationery and uniforms for underprivileged students.',
        descriptionHi: 'आर्थिक रूप से कमजोर प्रतिभाशाली विद्यार्थियों को छात्रवृत्ति व अध्ययन सामग्री।',
        isActive: true,
        icon: 'Award'
      },
      {
        id: 'sports-infra',
        labelEn: 'Sports & Athletics Infrastructure',
        labelHi: 'खेलकूद सामग्री एवं मैदान विकास',
        descriptionEn: 'Volleyball, badminton, cricket gear and athletic equipment for physical development.',
        descriptionHi: 'शारीरिक विकास व खेल प्रतिभा निखारने हेतु खेल सामग्री व मैदान संवर्धन।',
        isActive: true,
        icon: 'Trophy'
      }
    ];
  }, [paymentConfig]);

  // Form states
  const [selectedReasonId, setSelectedReasonId] = useState<string>(reasons[0]?.id || 'college-development');
  const [customReasonText, setCustomReasonText] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [customAmountStr, setCustomAmountStr] = useState<string>('500');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [donorAddress, setDonorAddress] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showTaxDetails, setShowTaxDetails] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // UI status states
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);
  const [completedDonation, setCompletedDonation] = useState<DonationRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Rupayex Payment Modal state
  const [rupayexModalState, setRupayexModalState] = useState<{
    isOpen: boolean;
    orderId: string | null;
    paymentUrl: string | null;
    amount: number;
    receiptNumber: string;
    donorName: string;
    causeLabel: string;
    pendingRecord: DonationRecord | null;
  }>({
    isOpen: false,
    orderId: null,
    paymentUrl: null,
    amount: 0,
    receiptNumber: '',
    donorName: '',
    causeLabel: '',
    pendingRecord: null
  });

  // Check URL callback on mount (if user redirected from Rupayex payment gateway)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('order_id');
    if (orderIdParam) {
      checkRupayexOrderStatus(orderIdParam).then(async (res) => {
        if (res.success && res.paymentStatus === 'SUCCESS') {
          const existing = donations.find(d => d.rupayexOrderId === orderIdParam);
          if (existing) {
            setCompletedDonation(existing);
            setIsReceiptModalOpen(true);
          } else {
            const newRec: DonationRecord = {
              id: `don_${Date.now()}`,
              receiptNumber: `DON-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
              donorName: 'Well-Wisher',
              donorEmail: '',
              donorPhone: '',
              amount: res.amount || 100,
              currency: 'INR',
              reasonId: 'college-development',
              reasonLabelEn: 'General School Development Fund',
              reasonLabelHi: 'सामान्य विद्यालय विकास कोष',
              paymentGateway: 'rupayex',
              rupayexOrderId: orderIdParam,
              rupayexUtr: res.utr || undefined,
              status: 'SUCCESS',
              createdAt: new Date().toISOString()
            };
            await addDonationRecord(newRec);
            setCompletedDonation(newRec);
            setIsReceiptModalOpen(true);
          }
        }
      });
    }
  }, [donations, addDonationRecord]);

  // Receipt lookup state
  const [receiptLookupQuery, setReceiptLookupQuery] = useState('');
  const [lookupError, setLookupError] = useState('');

  const selectedReasonObj = reasons.find(r => r.id === selectedReasonId) || reasons[0];

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmountStr(val.toString());
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmountStr(raw);
    const num = parseInt(raw, 10);
    if (!isNaN(num)) {
      setAmount(num);
    } else {
      setAmount(0);
    }
  };

  // Copy UPI ID helper
  const upiIdToUse = paymentConfig?.upiId || 'school.smc@sbi';
  const handleCopyUpi = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(upiIdToUse);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  // Callback when Rupayex payment completes successfully
  const handleRupayexSuccess = async (completedRecord: DonationRecord) => {
    await addDonationRecord(completedRecord);
    setRupayexModalState(prev => ({ ...prev, isOpen: false }));
    setCompletedDonation(completedRecord);
    setIsReceiptModalOpen(true);
    setIsProcessing(false);
    setStatusMessage({
      type: 'success',
      text: language === 'hi' 
        ? `धन्यवाद! आपका ₹${completedRecord.amount.toLocaleString('en-IN')} का सहयोग सफलतापूर्वक प्राप्त हुआ। रसीद संख्या: ${completedRecord.receiptNumber}` 
        : `Thank you! Your donation of ₹${completedRecord.amount.toLocaleString('en-IN')} was successfully received. Receipt No: ${completedRecord.receiptNumber}`
    });
  };

  // Process Online Donation via Rupayex Gateway
  const handleInitiateDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (amount < 100) {
      setStatusMessage({
        type: 'error',
        text: language === 'hi' 
          ? 'ऑनलाइन सहयोग हेतु न्यूनतम राशि ₹100 है। कृपया ₹100 या अधिक राशि दर्ज करें।' 
          : 'Minimum contribution amount is ₹100. Please select ₹100 or higher.'
      });
      return;
    }

    if (!donorName.trim() && !isAnonymous) {
      setStatusMessage({
        type: 'error',
        text: language === 'hi' ? 'कृपया अपना नाम दर्ज करें या गुप्त दान विकल्प चुनें।' : 'Please enter your name or select anonymous donation.'
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage({
      type: 'info',
      text: language === 'hi' ? 'सुरक्षित भुगतान विंडो तैयार की जा रही है, कृपया प्रतीक्षा करें...' : 'Opening secure payment window, please wait...'
    });

    try {
      const reasonLabel = language === 'hi' ? selectedReasonObj?.labelHi : selectedReasonObj?.labelEn;
      const receiptNumber = `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      // 1. Create order on Rupayex Gateway
      const orderRes = await createRupayexOrder({
        amount,
        donorName: isAnonymous ? 'Anonymous Donor' : donorName.trim(),
        donorEmail: donorEmail.trim(),
        donorPhone: donorPhone.trim(),
        reason: `${reasonLabel}${customReasonText ? ` (${customReasonText})` : ''}`,
        receiptNumber,
        redirectUrl: 'https://primaryschoolharsinghpur.netlify.app/'
      });

      if (orderRes.success && orderRes.paymentUrl && orderRes.orderId) {
        const pendingRec: DonationRecord = {
          id: `don_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          receiptNumber,
          donorName: isAnonymous ? 'Anonymous Well-Wisher' : donorName.trim(),
          donorEmail: donorEmail.trim() || undefined,
          donorPhone: donorPhone.trim() || undefined,
          amount,
          currency: 'INR',
          reasonId: selectedReasonId,
          reasonLabelEn: selectedReasonObj?.labelEn || 'School Fund',
          reasonLabelHi: selectedReasonObj?.labelHi || 'विद्यालय विकास कोष',
          customReason: customReasonText.trim() || undefined,
          panNumber: panNumber.trim().toUpperCase() || undefined,
          donorAddress: donorAddress.trim() || undefined,
          isAnonymous,
          paymentGateway: 'rupayex',
          rupayexOrderId: orderRes.orderId,
          rupayexPaymentUrl: orderRes.paymentUrl,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          is80GClaimed: !!panNumber.trim(),
          notes: message.trim() || undefined
        };

        setRupayexModalState({
          isOpen: true,
          orderId: orderRes.orderId,
          paymentUrl: orderRes.paymentUrl,
          amount,
          receiptNumber,
          donorName: isAnonymous ? 'Anonymous Well-Wisher' : donorName.trim(),
          causeLabel: reasonLabel || 'School Fund',
          pendingRecord: pendingRec
        });

        setIsProcessing(false);
        setStatusMessage(null);
        return;
      }

      throw new Error(orderRes.error || 'Failed to initialize Rupayex payment gateway.');
    } catch (err: any) {
      console.error('[DONATION] Error initializing payment:', err);
      setIsProcessing(false);
      setStatusMessage({
        type: 'error',
        text: err?.message || (language === 'hi' ? 'भुगतान शुरू करने में समस्या आई। कृपया पुनः प्रयास करें।' : 'Failed to initiate payment. Please try again.')
      });
    }
  };

  // Lookup existing receipt by Receipt Number or Payment Reference
  const handleLookupReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');

    const clean = receiptLookupQuery.trim().toLowerCase();
    if (!clean) return;

    const found = donations.find(
      d => d.receiptNumber.toLowerCase() === clean || 
           (d.rupayexOrderId && d.rupayexOrderId.toLowerCase() === clean) ||
           (d.rupayexUtr && d.rupayexUtr.toLowerCase() === clean) ||
           (d.razorpayPaymentId && d.razorpayPaymentId.toLowerCase() === clean)
    );

    if (found) {
      setCompletedDonation(found);
      setIsReceiptModalOpen(true);
      setReceiptLookupQuery('');
    } else {
      setLookupError(
        language === 'hi' 
          ? 'इस रसीद संख्या से कोई पावती नहीं मिली। कृपया सही रसीद संख्या दर्ज करें।' 
          : 'No receipt found with this Receipt Number.'
      );
    }
  };

  // Calculate totals
  const totalFundsRaised = useMemo(() => {
    return donations.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [donations]);

  const recentPublicDonors = useMemo(() => {
    return donations.slice(0, 5);
  }, [donations]);

  const getReasonIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Laptop': return Laptop;
      case 'BookOpen': return BookOpen;
      case 'Award': return Award;
      case 'Trophy': return Trophy;
      default: return Landmark;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Dignified, High-Trust Header Banner (No Clutter, No Gateway Tech-Jargon) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <Heart className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
            <span>{language === 'hi' ? 'विद्या-दान महा-दान • विद्यालय विकास कोष' : 'School Development & Educational Support Fund'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            {language === 'hi'
              ? 'ग्रामीण प्रतिभाओं के उज्ज्वल भविष्य के लिए स्वैच्छिक सहयोग'
              : 'Empowering Rural Learners: School Development Contribution'}
          </h1>

          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            {language === 'hi'
              ? `${settings.schoolName || 'कंपोजिट जूनियर हाई स्कूल हरसिंहपुर गोवा'} में अध्ययनरत छात्र-छात्राओं के लिए आधुनिक स्मार्ट क्लास, पुस्तकालय, कंप्यूटर शिक्षा एवं खेलकूद सामग्री हेतु सहयोग करें। प्रत्येक दान की आधिकारिक प्रमाणित 80G रसीद तुरंत प्रदान की जाती है।`
              : `Contribute towards smart classrooms, library books, computer literacy, sports equipment and student scholarships for young learners. Official 80G tax-exempt receipts are issued instantly.`}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === 'hi' ? '100% सुरक्षित भुगतान' : '100% Secure Payment'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 font-semibold text-amber-300">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'आयकर धारा 80G कर छूट' : 'Section 80G Tax Exemption'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700/80 font-semibold text-sky-300">
              <CreditCard className="w-4 h-4 text-sky-400" />
              <span>{language === 'hi' ? 'UPI, कार्ड व नेटबैंकिंग' : 'UPI, Cards & NetBanking'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Donation Form (Left) & Official Direct Info (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Clean & Clear Contribution Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span>{language === 'hi' ? 'सहयोग विवरण एवं राशि' : 'Contribution Details & Amount'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'hi' 
                ? 'उद्देश्य एवं राशि का चयन कर सुरक्षित ऑनलाइन भुगतान करें।' 
                : 'Select cause and amount to make a secure contribution.'}
            </p>
          </div>

          {statusMessage && (
            <div className={`p-3.5 rounded-2xl text-xs font-medium flex items-start gap-2.5 animate-in fade-in ${
              statusMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {statusMessage.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" /> :
               statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> :
               <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />}
              <div className="leading-relaxed">{statusMessage.text}</div>
            </div>
          )}

          <form onSubmit={handleInitiateDonation} className="space-y-5">
            {/* Step 1: Choose Cause (Clean Cards without Rambling Text) */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-2">
                1. {language === 'hi' ? 'सहयोग का उद्देश्य चुनें' : 'Choose Contribution Cause'}
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {reasons.map((reason) => {
                  const isSelected = selectedReasonId === reason.id;
                  const IconComponent = getReasonIcon(reason.icon);
                  return (
                    <button
                      type="button"
                      key={reason.id}
                      onClick={() => setSelectedReasonId(reason.id)}
                      className={`p-3 rounded-2xl text-left transition-all border cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-500 text-slate-950' : 'bg-white text-slate-600 border border-slate-200'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold leading-tight truncate">
                          {language === 'hi' ? reason.labelHi : reason.labelEn}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {language === 'hi' ? reason.descriptionHi : reason.descriptionEn}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black shrink-0">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Optional Custom Purpose Note */}
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'विशिष्ट उद्देश्य या संदर्भ (वैकल्पिक)...' : 'Specific purpose or note (optional)...'}
                  value={customReasonText}
                  onChange={(e) => setCustomReasonText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            {/* Step 2: Choose Amount (Clear Presets & Custom Input) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800">
                  2. {language === 'hi' ? 'सहयोग राशि (₹)' : 'Select Amount (INR)'}
                </label>
                <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  80G कर छूट मान्य
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {PRESET_AMOUNTS.map((val) => {
                  const isSelected = amount === val;
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => handleSelectPreset(val)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border cursor-pointer text-center ${
                        isSelected
                          ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      ₹{val.toLocaleString('en-IN')}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2.5 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">
                  ₹
                </div>
                <input
                  type="text"
                  value={customAmountStr}
                  onChange={handleCustomAmountChange}
                  placeholder={language === 'hi' ? 'अन्य राशि दर्ज करें (जैसे ₹5000)' : 'Enter custom amount (e.g. 5000)'}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 font-mono focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Step 3: Donor Details (Clean, Fast, Unintimidating) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">
                  3. {language === 'hi' ? 'सहयोगी / दानी का विवरण' : 'Donor Information'}
                </label>

                <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 select-none">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                  />
                  <span>{language === 'hi' ? 'दान गुप्त रखें (नाम न दिखाएं)' : 'Keep Anonymous'}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {language === 'hi' ? 'पूरा नाम *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required={!isAnonymous}
                    disabled={isAnonymous}
                    placeholder={isAnonymous ? (language === 'hi' ? 'गुप्त दानी (Anonymous)' : 'Anonymous Well-Wisher') : (language === 'hi' ? 'उदा. रमेश कुमार' : 'e.g. Ramesh Kumar')}
                    value={isAnonymous ? '' : donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {language === 'hi' ? 'मोबाइल नंबर (रसीद SMS हेतु)' : 'Mobile Number (for Receipt)'}
                  </label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {language === 'hi' ? 'ईमेल पता (PDF रसीद प्राप्त करने हेतु)' : 'Email Address (for PDF Receipt)'}
                  </label>
                  <input
                    type="email"
                    placeholder="example@mail.com"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Optional 80G Tax Exemption Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTaxDetails(!showTaxDetails)}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showTaxDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>
                    {showTaxDetails 
                      ? (language === 'hi' ? 'आयकर 80G विवरण छुपाएं' : 'Hide Tax Exemption Details') 
                      : (language === 'hi' ? '+ 80G आयकर छूट रसीद हेतु पैन (PAN) व पता जोड़ें (वैकल्पिक)' : '+ Add PAN & Address for 80G Tax Exemption (Optional)')}
                  </span>
                </button>

                {showTaxDetails && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-in fade-in">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'पैन नंबर (80G छूट हेतु)' : 'PAN Card Number'}
                      </label>
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="ABCDE1234F"
                        value={panNumber}
                        onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 font-mono uppercase focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'शहर / राज्य / पता' : 'City / State / Address'}
                      </label>
                      <input
                        type="text"
                        placeholder={language === 'hi' ? 'उदा. सहसवान, बदायूँ' : 'e.g. Sahaswan, Badaun'}
                        value={donorAddress}
                        onChange={(e) => setDonorAddress(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Single Clean Online Contribution Button */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <button
                type="submit"
                disabled={isProcessing || amount < 1}
                className="w-full min-h-[46px] py-3 px-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 hover:from-amber-600 hover:to-amber-500 active:scale-[0.99] text-white hover:text-slate-950 font-black text-sm transition-all flex items-center justify-center gap-2.5 shadow-md shadow-slate-950/20 cursor-pointer disabled:opacity-60"
                id="btn-submit-college-donation"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{language === 'hi' ? 'सुरक्षित भुगतान खुल रहा है...' : 'Opening Secure Checkout...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span>
                      {language === 'hi'
                        ? `₹${amount.toLocaleString('en-IN')} का सहयोग करें (Pay Online)`
                        : `Contribute ₹${amount.toLocaleString('en-IN')} (Pay Online)`}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </>
                )}
              </button>

              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-slate-500 text-center">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>100% सुरक्षित भुगतान</span>
                </span>
                <span className="text-slate-300">•</span>
                <span>त्वरित 80G डिजिटल रसीद</span>
                <span className="text-slate-300">•</span>
                <span>सीधे विद्यालय बैंक खाते में जमा</span>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column: Direct Bank Account, UPI Details & Simple Receipt Finder */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Official School Bank & Direct UPI Details Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Landmark className="w-4 h-4" />
              <h3 className="uppercase tracking-wider text-slate-200">
                {language === 'hi' ? 'सीधा बैंक अंतरण एवं UPI विवरण' : 'Direct Bank Transfer & UPI Details'}
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'hi'
                ? 'यदि आप सीधे विद्यालय प्रबंधन समिति (SMC) के बैंक खाते अथवा UPI द्वारा सहयोग भेजना चाहते हैं:'
                : 'You may also contribute directly to the School Management Committee (SMC) bank account or UPI:'}
            </p>

            {/* UPI Quick Copy Box */}
            <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  {language === 'hi' ? 'आधिकारिक UPI ID' : 'Official UPI ID'}
                </span>
                <span className="font-mono text-sm font-bold text-amber-300 truncate block">
                  {upiIdToUse}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'कॉपी हुआ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'कॉपी करें' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Bank Details Strip */}
            <div className="text-xs space-y-1.5 pt-1 text-slate-300">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">{language === 'hi' ? 'खाताधारक:' : 'Account:'}</span>
                <span className="font-bold text-right text-white">विद्यालय प्रबंधन समिति (SMC)</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">{language === 'hi' ? 'विद्यालय:' : 'School:'}</span>
                <span className="font-medium text-right text-slate-200">कंपोजिट जू.हा. स्कूल हरसिंहपुर गोवा</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-400">{language === 'hi' ? 'UDISE कोड:' : 'UDISE Code:'}</span>
                <span className="font-mono font-bold text-amber-400">{settings.schoolCode || '09290205902'}</span>
              </div>
              <div className="flex justify-between pt-0.5">
                <span className="text-slate-400">{language === 'hi' ? 'स्थान / ब्लॉक:' : 'Location / Block:'}</span>
                <span className="font-medium text-slate-200">
                  {language === 'hi' 
                    ? `${settings.village || 'हरसिंहपुर गोवा'}, ${settings.block || 'शमसाबाद'}, ${settings.district || 'फर्रुखाबाद'}` 
                    : `${settings.village || 'Harsinghpur Gova'}, ${settings.block || 'Shamsabad'}, ${settings.district || 'Farrukhabad'}`}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Lookup Previous Donation Receipt */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {language === 'hi' ? 'पूर्व दान रसीद खोजें / प्रिंट करें' : 'Find / Print Previous Receipt'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {language === 'hi'
                ? 'अपनी रसीद संख्या दर्ज करके कभी भी आधिकारिक 80G रसीद डाउनलोड करें।'
                : 'Enter your Receipt Number to download or print your official receipt.'}
            </p>

            <form onSubmit={handleLookupReceipt} className="flex gap-2">
              <input
                type="text"
                placeholder={language === 'hi' ? 'रसीद संख्या (जैसे RCPT-2026-...)' : 'Receipt Number (e.g. RCPT-...)'}
                value={receiptLookupQuery}
                onChange={(e) => setReceiptLookupQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                {language === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </form>

            {lookupError && (
              <div className="text-[11px] text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                {lookupError}
              </div>
            )}
          </div>

          {/* 3. Wall of Kindness / Recent Contributors */}
          {recentPublicDonors.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {language === 'hi' ? 'हाल के दानदाता (सहयोग दीवार)' : 'Recent Contributors'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  सत्यापित
                </span>
              </div>

              <div className="space-y-2">
                {recentPublicDonors.map((don) => (
                  <div key={don.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {don.isAnonymous ? (language === 'hi' ? 'गुप्त दानी' : 'Anonymous Well-Wisher') : don.donorName}
                      </div>
                      <div className="text-[10.5px] text-slate-500 truncate">
                        {language === 'hi' ? don.reasonLabelHi : don.reasonLabelEn}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-black text-slate-900 font-mono">
                        ₹{don.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono">
                        {new Date(don.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rupayex UPI Payment & Real-Time Verification Modal */}
      <RupayexPaymentModal
        isOpen={rupayexModalState.isOpen}
        orderId={rupayexModalState.orderId}
        paymentUrl={rupayexModalState.paymentUrl}
        amount={rupayexModalState.amount}
        receiptNumber={rupayexModalState.receiptNumber}
        donorName={rupayexModalState.donorName}
        causeLabel={rupayexModalState.causeLabel}
        pendingRecord={rupayexModalState.pendingRecord}
        onClose={() => setRupayexModalState(prev => ({ ...prev, isOpen: false }))}
        onSuccess={handleRupayexSuccess}
        language={language}
      />

      {/* Official Printable 80G Receipt Modal */}
      <DonationReceiptModal
        donation={completedDonation}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
