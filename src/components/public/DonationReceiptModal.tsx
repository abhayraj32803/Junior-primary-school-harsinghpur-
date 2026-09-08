import React, { useRef } from 'react';
import { DonationRecord } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  Receipt,
  Heart,
  FileCheck
} from 'lucide-react';

interface DonationReceiptModalProps {
  donation: DonationRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DonationReceiptModal: React.FC<DonationReceiptModalProps> = ({
  donation,
  isOpen,
  onClose
}) => {
  const { settings, language } = useSchool();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !donation) return null;

  const handlePrint = () => {
    window.print();
  };

  const amountInWords = (num: number): string => {
    // Basic INR representation for receipt
    return `Rupees ${num.toLocaleString('en-IN')} Only`;
  };

  const dateFormatted = new Date(donation.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Controls (Hidden in Print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between gap-4 print:hidden shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-500/30">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold">
                {language === 'hi' ? 'आधिकारिक दान पावती (80G रसीद)' : 'Official Donation Receipt (80G Tax Exempt)'}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {donation.receiptNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
              id="btn-print-donation-receipt"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Receipt Body */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#FAFAF9]" ref={receiptRef}>
          {/* Printable Border Container */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-300 shadow-xs relative overflow-hidden">
            {/* Watermark Logo */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
              <Building2 className="w-96 h-96 text-slate-900" />
            </div>

            {/* Institution Header */}
            <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Official College Donation Receipt</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {settings.schoolName || 'COMPOSITE JUNIOR HIGH SCHOOL HARSINGHPUR GOVA'}
              </h2>
              <div className="text-xs text-slate-600 font-medium">
                {settings.schoolAddress || 'Harsinghpur Gova, Block Sahaswan, District Badaun, Uttar Pradesh - 243638'}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-500 pt-1">
                <span>U-DISE Code: <strong className="text-slate-900">{settings.schoolCode || '09290205902'}</strong></span>
                <span>•</span>
                <span>Affiliation: Uttar Pradesh Basic Shiksha Parishad</span>
                {settings.paymentConfig?.taxExemptionNumber && (
                  <>
                    <span>•</span>
                    <span>80G Reg: <strong className="text-slate-900">{settings.paymentConfig.taxExemptionNumber}</strong></span>
                  </>
                )}
              </div>
            </div>

            {/* Receipt Meta Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Receipt No.</span>
                <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">{donation.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Time</span>
                <span className="font-medium text-slate-800">{dateFormatted}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Gateway</span>
                <span className="font-bold text-blue-700 uppercase">Razorpay Verified</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment ID</span>
                <span className="font-mono text-slate-800 text-[11px] truncate block" title={donation.razorpayPaymentId}>
                  {donation.razorpayPaymentId || 'N/A'}
                </span>
              </div>
            </div>

            {/* Donor & Contribution Details Table */}
            <div className="py-5 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Received with thanks from</span>
                    <span className="text-base font-black text-slate-900">
                      {donation.isAnonymous ? 'Anonymous Well-Wisher / गुप्त दानी' : donation.donorName}
                    </span>
                  </div>
                  {donation.panNumber && (
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Donor PAN (80G)</span>
                      <span className="font-mono font-bold text-slate-900">{donation.panNumber}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] border-t border-slate-200/80 pt-2">
                  <div>
                    <span className="text-slate-400">Mobile: </span>
                    <span className="font-medium">{donation.donorPhone ? `${donation.donorPhone.substring(0, 3)}****${donation.donorPhone.slice(-3)}` : 'Confidential'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email: </span>
                    <span className="font-medium">{donation.donorEmail || 'N/A'}</span>
                  </div>
                  {donation.donorAddress && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400">Address: </span>
                      <span className="font-medium">{donation.donorAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purpose & Amount */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                      <th className="p-3">Donation Purpose / सहयोग का उद्देश्य</th>
                      <th className="p-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">
                          {language === 'hi' ? donation.reasonLabelHi : donation.reasonLabelEn}
                        </div>
                        {donation.customReason && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Details: {donation.customReason}
                          </div>
                        )}
                        <div className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                          <Heart className="w-3 h-3 text-emerald-600" fill="currentColor" />
                          <span>Voluntary Educational & Institutional Development Contribution</span>
                        </div>
                      </td>
                      <td className="p-3 text-right font-black text-slate-900 text-base font-mono">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/50 font-bold">
                      <td className="p-3 text-slate-800">
                        Total Amount Received ({amountInWords(donation.amount)})
                      </td>
                      <td className="p-3 text-right text-base text-amber-900 font-mono font-black">
                        ₹{donation.amount.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax Exemption Notice & Signatures */}
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-6 items-end text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Income Tax Exemption Under Section 80G</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  Donations to this government educational institution are eligible for tax deduction under Section 80G of the Income Tax Act, 1961. This computer-generated receipt is electronically verified and requires no physical signature.
                </p>
              </div>

              <div className="text-center sm:text-right space-y-1">
                <div className="inline-block border-b-2 border-slate-400 w-40 mb-1" />
                <div className="font-bold text-slate-900 text-xs">Authorized Signatory</div>
                <div className="text-[10.5px] text-slate-500">Headmaster / Principal Directorate</div>
                <div className="text-[10px] text-slate-400 font-mono">{settings.schoolName}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
