import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  Loader2, 
  ShieldCheck, 
  X, 
  Copy, 
  Check, 
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { DonationRecord } from '../../types';
import { checkRupayexOrderStatus } from '../../utils/rupayex';

interface RupayexPaymentModalProps {
  isOpen: boolean;
  orderId: string | null;
  paymentUrl: string | null;
  amount: number;
  receiptNumber: string;
  donorName: string;
  causeLabel: string;
  pendingRecord: DonationRecord | null;
  onClose: () => void;
  onSuccess: (completedRecord: DonationRecord) => void;
  language?: 'hi' | 'en';
}

export const RupayexPaymentModal: React.FC<RupayexPaymentModalProps> = ({
  isOpen,
  orderId,
  paymentUrl,
  amount,
  receiptNumber,
  donorName,
  causeLabel,
  pendingRecord,
  onClose,
  onSuccess,
  language = 'hi'
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [checkCount, setCheckCount] = useState(0);
  const [statusText, setStatusText] = useState<string>('');
  const [errorText, setErrorText] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [utrNumber, setUtrNumber] = useState<string>('');

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Poll order status
  useEffect(() => {
    if (!isOpen || !orderId || paymentSuccess) {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
      return;
    }

    const checkStatus = async () => {
      try {
        setIsChecking(true);
        const res = await checkRupayexOrderStatus(orderId);
        setIsChecking(false);
        setCheckCount(prev => prev + 1);

        if (res.success && res.paymentStatus === 'SUCCESS') {
          setPaymentSuccess(true);
          setUtrNumber(res.utr || '');
          setStatusText(
            language === 'hi'
              ? 'भुगतान सफलतापूर्वक प्राप्त हुआ! आधिकारिक रसीद तैयार की जा रही है...'
              : 'Payment confirmed successfully! Generating official receipt...'
          );

          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

          // Update record and notify parent
          const finalRecord: DonationRecord = pendingRecord ? {
            ...pendingRecord,
            status: 'SUCCESS',
            paymentGateway: 'rupayex',
            rupayexOrderId: orderId,
            rupayexUtr: res.utr || undefined,
            rupayexPaymentUrl: paymentUrl || undefined
          } : {
            id: `don_${Date.now()}`,
            receiptNumber,
            donorName: donorName || 'Well-Wisher',
            donorEmail: '',
            donorPhone: '',
            amount,
            currency: 'INR',
            reasonId: 'college-development',
            reasonLabelEn: causeLabel,
            reasonLabelHi: causeLabel,
            paymentGateway: 'rupayex',
            rupayexOrderId: orderId,
            rupayexUtr: res.utr || undefined,
            status: 'SUCCESS',
            createdAt: new Date().toISOString()
          };

          setTimeout(() => {
            onSuccess(finalRecord);
          }, 1500);
        } else if (res.success && res.paymentStatus === 'FAILED') {
          setErrorText(
            language === 'hi' 
              ? 'गेटवे द्वारा भुगतान निरस्त या विफल चिन्हित किया गया।' 
              : 'Payment was marked as failed by gateway.'
          );
        }
      } catch (err: any) {
        setIsChecking(false);
      }
    };

    // Initial check after 3 seconds
    const initialTimer = setTimeout(checkStatus, 3000);
    // Recurring poll every 3.5 seconds
    pollingTimerRef.current = setInterval(checkStatus, 3500);

    return () => {
      clearTimeout(initialTimer);
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
  }, [isOpen, orderId, paymentSuccess, language, pendingRecord, receiptNumber, donorName, causeLabel, amount, paymentUrl, onSuccess]);

  if (!isOpen || !orderId || !paymentUrl) return null;

  const handleCopyLink = () => {
    if (navigator?.clipboard && paymentUrl) {
      navigator.clipboard.writeText(paymentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleManualCheck = async () => {
    if (!orderId || isChecking || paymentSuccess) return;
    setIsChecking(true);
    setErrorText('');
    try {
      const res = await checkRupayexOrderStatus(orderId);
      setIsChecking(false);
      if (res.success && res.paymentStatus === 'SUCCESS') {
        setPaymentSuccess(true);
        setUtrNumber(res.utr || '');
        if (pendingRecord) {
          onSuccess({
            ...pendingRecord,
            status: 'SUCCESS',
            paymentGateway: 'rupayex',
            rupayexOrderId: orderId,
            rupayexUtr: res.utr || undefined
          });
        }
      } else {
        setStatusText(
          language === 'hi' 
            ? 'भुगतान अभी लंबित (PENDING) है। यदि आपने पैसे भेज दिए हैं तो 5-10 सेकंड में स्वतः सत्यापित हो जाएगा।' 
            : 'Payment is currently pending. It will automatically update in a few seconds once confirmed.'
        );
      }
    } catch (e: any) {
      setIsChecking(false);
      setErrorText('Error checking status.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-8">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'hi' ? '100% सुरक्षित ऑनलाइन भुगतान' : '100% Secure Online Payment'}</span>
          </div>

          <h3 className="text-xl font-black text-white">
            {language === 'hi' ? 'सहयोग राशि का ऑनलाइन भुगतान' : 'Complete Online Contribution'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {language === 'hi' 
              ? 'Google Pay, PhonePe, Paytm, BHIM या कार्ड द्वारा सुरक्षित भुगतान करें' 
              : 'Pay securely using Google Pay, PhonePe, Paytm, UPI or NetBanking'}
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Amount Badge */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-center">
            <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              {language === 'hi' ? 'कुल देय सहयोग राशि' : 'Total Contribution Amount'}
            </div>
            <div className="text-3xl font-black text-slate-950 font-mono mt-0.5">
              ₹{amount.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-600 mt-1 flex items-center justify-center gap-2">
              <span className="font-semibold text-slate-800">{causeLabel}</span>
              <span>•</span>
              <span className="font-mono text-slate-500">{receiptNumber}</span>
            </div>
          </div>

          {paymentSuccess ? (
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-emerald-950">
                {language === 'hi' ? 'भुगतान सफल!' : 'Payment Verified Successfully!'}
              </h4>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {statusText || (language === 'hi' ? 'रसीद तैयार हो रही है, कृपया प्रतीक्षा करें...' : 'Receipt is being generated...')}
              </p>
              {utrNumber && (
                <div className="text-[11px] font-mono text-emerald-900 bg-white/80 py-1.5 px-3 rounded-lg border border-emerald-200 inline-block">
                  UTR: {utrNumber}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Primary Call to Action Button */}
              <div className="space-y-2.5">
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[48px] py-3 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer text-center"
                >
                  <Smartphone className="w-4 h-4 text-emerald-100" />
                  <span>
                    {language === 'hi' 
                      ? 'पेमेंट पेज खोलें (PhonePe / GPay / UPI)' 
                      : 'Open Payment Page (PhonePe / GPay / UPI)'}
                  </span>
                  <ExternalLink className="w-4 h-4 text-emerald-200" />
                </a>

                <div className="text-center text-[11px] text-slate-500">
                  {language === 'hi' 
                    ? 'बटन दबाते ही सुरक्षित भुगतान पेज खुलेगा जहाँ आप QR कोड स्कैन कर सकते हैं या किसी भी UPI ऐप (PhonePe / GPay / Paytm) से भुगतान कर सकते हैं।' 
                    : 'Click to open the secure payment page to scan QR or pay with any UPI app.'}
                </div>
              </div>

              {/* Share/Copy Payment Link Strip */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] uppercase font-bold text-slate-400">
                    {language === 'hi' ? 'सीधा पेमेंट लिंक' : 'Direct Payment Link'}
                  </div>
                  <div className="text-xs font-mono text-slate-700 truncate" title={paymentUrl}>
                    {paymentUrl}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">{language === 'hi' ? 'कॉपी हुआ' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>{language === 'hi' ? 'कॉपी' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Polling Status Box */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  <div className="text-blue-900 leading-tight">
                    <span className="font-bold block">
                      {language === 'hi' ? 'भुगतान सत्यापन जारी है...' : 'Verifying transaction status...'}
                    </span>
                    <span className="text-[11px] text-blue-700">
                      {language === 'hi' 
                        ? 'जैसे ही आप ऐप में भुगतान करेंगे, यह स्क्रीन स्वतः प्रमाणित हो जाएगी।' 
                        : 'Screen will auto-verify as soon as payment is confirmed in your app.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 disabled:opacity-60"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>{language === 'hi' ? 'जांचें' : 'Check'}</span>
                </button>
              </div>

              {statusText && (
                <div className="text-[11px] text-slate-600 bg-slate-100 p-2.5 rounded-xl text-center">
                  {statusText}
                </div>
              )}

              {errorText && (
                <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{errorText}</span>
                </div>
              )}
            </>
          )}

          {/* Footer Note */}
          <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{language === 'hi' ? 'सुरक्षित एन्क्रिप्टेड भुगतान' : 'Secure Encrypted Payment'}</span>
            </span>
            <span className="font-mono text-[10px]">Order: {orderId.slice(0, 16)}...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
