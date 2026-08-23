import React, { useState, useEffect } from 'react';
import { StudentDocument } from '../../types';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  FileText, 
  User, 
  Calendar,
  ExternalLink,
  Info,
  Clock,
  AlertTriangle,
  RefreshCw,
  ArrowRightLeft,
  Eye,
  Maximize2,
  Minimize2,
  Check,
  FileCheck,
  FileWarning,
  Sparkles
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { downloadDocumentFile } from '../../utils/fileDownloader';

interface DocumentViewerModalProps {
  document: StudentDocument | null;
  isOpen: boolean;
  onClose: () => void;
  canVerify?: boolean;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  canVerify = false
}) => {
  const { verifyDocument, approveDocumentUpdate, rejectDocumentUpdate, language } = useSchool();
  const { userProfile } = useAuth();
  
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [activeView, setActiveView] = useState<'current' | 'pending'>('current');
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [actionType, setActionType] = useState<'VERIFIED' | 'REJECTED'>('VERIFIED');
  const [updateActionType, setUpdateActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'auto' | 'pdf' | 'image'>('auto');

  // Preset rejection reasons for rapid verification
  const rejectionPresets = [
    { hi: 'दस्तावेज़ की स्कैन कॉपी अस्पष्ट या धुंधली है। कृपया स्पष्ट कॉपी पुनः अपलोड करें।', en: 'Document scan is blurred/illegible. Please re-upload a clear copy.' },
    { hi: 'अपलोड किया गया दस्तावेज़ चयनित श्रेणी से मेल नहीं खाता है।', en: 'Uploaded file does not match the selected document category.' },
    { hi: 'दस्तावेज़ में छात्र/माता-पिता का नाम विद्यालय रिकॉर्ड से भिन्न है।', en: 'Name/details in document differ from school enrollment records.' },
    { hi: 'दस्तावेज़ पर सक्षम अधिकारी के हस्ताक्षर या संस्थागत मुहर अनुपस्थित है।', en: 'Missing official institutional seal or competent authority signature.' }
  ];

  // Preset approval notes
  const approvalPresets = [
    { hi: 'मूल संस्थागत रिकॉर्ड एवं तहसील विवरण से मिलान उपरांत सत्यापित।', en: 'Verified and matched against institutional school records.' },
    { hi: 'यूआईडीएआई आधार एवं जन्म प्रमाण पत्र डेटा सत्यापित।', en: 'UIDAI Aadhaar & Birth Certificate details verified.' },
    { hi: 'प्रधानाध्यापिका द्वारा भौतिक निरीक्षण उपरांत अनुमोदित।', en: 'Approved following physical document verification by Head Teacher.' }
  ];

  useEffect(() => {
    if (doc) {
      setZoom(1);
      setRotation(0);
      setShowVerifyPrompt(false);
      setShowUpdatePrompt(false);
      setActionFeedback(null);
      setActiveView(doc.hasPendingUpdate && doc.pendingUpdateUrl ? 'pending' : 'current');
      setViewMode('auto');
    }
  }, [doc]);

  if (!isOpen || !doc) return null;

  const hasPending = Boolean(doc.hasPendingUpdate && doc.pendingUpdateUrl);
  const displayUrl = (hasPending && activeView === 'pending') ? doc.pendingUpdateUrl! : doc.fileURL;
  const displayFileName = (hasPending && activeView === 'pending') ? (doc.pendingUpdateFileName || 'updated_doc.pdf') : (doc.fileName || `${doc.title}.pdf`);

  // Detect format
  const isBase64Image = displayUrl?.startsWith('data:image/');
  const isBase64Pdf = displayUrl?.startsWith('data:application/pdf');
  const isPdfExtension = displayFileName?.toLowerCase().endsWith('.pdf') || doc.fileType === 'application/pdf';
  const isDirectPdf = isBase64Pdf || (isPdfExtension && !isBase64Image);

  const effectiveViewMode = viewMode === 'auto' ? (isDirectPdf ? 'pdf' : 'image') : viewMode;

  const handleZoomIn = () => setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 3));
  const handleZoomOut = () => setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    downloadDocumentFile(displayUrl, displayFileName);
  };

  const handleConfirmVerification = async () => {
    setIsProcessing(true);
    try {
      const verifierName = userProfile?.name || 'Head Teacher / Smt. Kiran Shakya';
      await verifyDocument(
        doc.id, 
        actionType, 
        verifyNotes || (actionType === 'VERIFIED' ? 'Document verified against school records.' : 'Document rejected. Correction required.'), 
        verifierName
      );
      setActionFeedback(
        actionType === 'VERIFIED' 
          ? (language === 'hi' ? 'दस्तावेज़ सफलतापूर्वक सत्यापित एवं अनुमोदित किया गया।' : 'Document verified and approved successfully.')
          : (language === 'hi' ? 'दस्तावेज़ अस्वीकार कर दिया गया।' : 'Document rejected.')
      );
      setShowVerifyPrompt(false);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmUpdateApproval = async () => {
    setIsProcessing(true);
    try {
      const verifierName = userProfile?.name || 'Head Teacher / Smt. Kiran Shakya';
      if (updateActionType === 'APPROVE') {
        await approveDocumentUpdate(
          doc.id, 
          verifyNotes || 'Updated document verified and approved by School Authority', 
          verifierName
        );
        setActionFeedback(language === 'hi' ? 'नया दस्तावेज़ अनुमोदित होकर सक्रिय रिकॉर्ड में सहेज दिया गया।' : 'New document approved and saved as active certified record.');
      } else {
        await rejectDocumentUpdate(
          doc.id, 
          verifyNotes || 'Document update rejected. Original document preserved.', 
          verifierName
        );
        setActionFeedback(language === 'hi' ? 'अपडेट अनुरोध अस्वीकार किया गया। मूल दस्तावेज़ सुरक्षित है।' : 'Update request rejected. Original record preserved.');
      }
      setShowUpdatePrompt(false);
      setTimeout(() => setActionFeedback(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`bg-slate-900 border border-slate-700/80 rounded-3xl w-full flex flex-col shadow-2xl overflow-hidden text-slate-100 transition-all ${
        isFullscreen ? 'h-full max-w-none rounded-none' : 'max-w-6xl h-[94vh]'
      }`}>
        
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-black text-white truncate max-w-xs sm:max-w-md">{doc.title}</h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {doc.documentType || doc.type}
                </span>
                
                {doc.verificationStatus === 'VERIFIED' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Verified</span>
                  </span>
                ) : doc.verificationStatus === 'REJECTED' ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/30">
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>Rejected</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Pending Verification</span>
                  </span>
                )}

                {hasPending && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-950 bg-amber-400 px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    <RefreshCw className="w-3 h-3" />
                    <span>Update Approval Required</span>
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Student: <span className="text-slate-200 font-bold">{doc.studentName}</span> • Doc Ref: <span className="font-mono text-amber-300">{doc.documentNumber || 'UP-DOC-RECORD'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-xl border border-slate-700 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  effectiveViewMode === 'pdf' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Embed PDF Frame View"
              >
                PDF View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('image')}
                className={`px-2 py-1 rounded-lg transition-all ${
                  effectiveViewMode === 'image' ? 'bg-amber-500 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="High-Res Image Canvas View"
              >
                Image View
              </button>
            </div>

            {/* Toggle Fullscreen */}
            <button
              onClick={() => setIsFullscreen(prev => !prev)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Button (Explicit user request) */}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors cursor-pointer border border-slate-700"
              title="Download to Device (डिवाइस में डाउनलोड करें)"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">Download</span>
            </button>

            {/* External Direct Link */}
            <a
              href={displayUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Open Direct Link in New Tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-200 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold">{actionFeedback}</span>
            </div>
            <button onClick={() => setActionFeedback(null)} className="text-emerald-400 hover:text-emerald-200">✕</button>
          </div>
        )}

        {/* Pending Update Notification Banner */}
        {hasPending && (
          <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-b border-amber-500/40 p-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="font-extrabold text-amber-300 flex items-center gap-2">
                  <span>छात्र द्वारा दस्तावेज़ नवीनीकरण अनुरोध (Student Requested Document Update)</span>
                  <span className="text-[10px] text-slate-300 font-normal">Submitted: {doc.pendingUpdateDate}</span>
                </div>
                <div className="text-slate-300 mt-0.5">
                  {doc.pendingUpdateNotes ? `"${doc.pendingUpdateNotes}"` : 'Student submitted an updated copy awaiting final Admin approval.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
              {/* Toggle Current vs Proposed Update View */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveView('current')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeView === 'current'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Active Original ({doc.fileSize || 'Orig'})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('pending')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    activeView === 'pending'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-amber-400 hover:text-amber-300'
                  }`}
                >
                  Proposed Update ({doc.pendingUpdateFileSize || 'New'})
                </button>
              </div>

              {/* Direct Update Action Buttons inside modal */}
              {canVerify && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateActionType('APPROVE');
                      setVerifyNotes('Updated document verified against institutional records and approved.');
                      setShowUpdatePrompt(true);
                      setShowVerifyPrompt(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateActionType('REJECT');
                      setVerifyNotes('Update rejected. Keeping previous approved document on file.');
                      setShowUpdatePrompt(true);
                      setShowVerifyPrompt(false);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/40 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Update</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Notification if any */}
        {doc.updateRejectionReason && (
          <div className="bg-rose-950/60 border-b border-rose-800/80 px-5 py-2.5 flex items-center gap-2.5 text-xs text-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold">पिछला अपडेट अस्वीकार कर दिया गया:</span> {doc.updateRejectionReason}
              <span className="ml-2 text-slate-400">(मूल सत्यापित दस्तावेज़ पूर्ववत सक्रिय है)</span>
            </div>
          </div>
        )}

        {/* Verification Action Toolbar */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-4 text-xs shrink-0 flex-wrap">
          {/* Zoom and Transform Controls for Image / Canvas */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-400 text-[11px] px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={handleRotate}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
              title="Rotate 90 deg"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[11px] hidden sm:inline">Rotate</span>
            </button>
            <button
              onClick={handleReset}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Primary Explicit Approve/Reject Actions for Admin */}
          {canVerify && !hasPending && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActionType('VERIFIED');
                  setVerifyNotes('मूल संस्थागत रिकॉर्ड एवं तहसील विवरण से मिलान उपरांत सत्यापित।');
                  setShowVerifyPrompt(true);
                  setShowUpdatePrompt(false);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all cursor-pointer ${
                  doc.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                }`}
                title="Approve and mark officially verified"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{doc.verificationStatus === 'VERIFIED' ? 'Re-Verify / Approve' : 'Approve & Mark Verified'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionType('REJECTED');
                  setVerifyNotes('दस्तावेज़ की स्कैन कॉपी अस्पष्ट या धुंधली है। कृपया स्पष्ट कॉपी पुनः अपलोड करें।');
                  setShowVerifyPrompt(true);
                  setShowUpdatePrompt(false);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white font-bold text-xs border border-rose-500/40 transition-all cursor-pointer"
                title="Reject document and specify reason"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Document</span>
              </button>
            </div>
          )}
        </div>

        {/* Update Approval Confirmation Prompt Drawer */}
        {showUpdatePrompt && (
          <div className="p-4 bg-slate-950 border-b border-amber-500/40 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {updateActionType === 'APPROVE' 
                  ? 'Approve Document Update (छात्र द्वारा प्रस्तुत नए दस्तावेज़ को स्वीकृत व लागू करें)' 
                  : 'Reject Document Update (अपडेट अस्वीकार करें व पूर्व में स्वीकृत मूल दस्तावेज़ सुरक्षित रखें)'}
              </span>
              <button
                onClick={() => setShowUpdatePrompt(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Preset Selection */}
            {updateActionType === 'REJECT' && (
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-slate-400 self-center mr-1">Quick Reasons:</span>
                {rejectionPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setVerifyNotes(language === 'hi' ? preset.hi : preset.en)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 text-left truncate max-w-xs transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? preset.hi : preset.en}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder={updateActionType === 'APPROVE' ? 'Enter approval remarks...' : 'Enter rejection reason (छात्र के लिए कारण)...'}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleConfirmUpdateApproval}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all ${
                  updateActionType === 'APPROVE' 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' 
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isProcessing ? 'Processing...' : updateActionType === 'APPROVE' ? 'Confirm Approval & Apply' : 'Confirm Rejection (Keep Previous)'}
              </button>
            </div>
          </div>
        )}

        {/* Regular Verification Modal Prompt Drawer */}
        {showVerifyPrompt && (
          <div className="p-4 bg-slate-950 border-b border-amber-500/30 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                {actionType === 'VERIFIED' 
                  ? 'Approve & Mark Document Officially Verified (दस्तावेज़ को सत्यापित करें)' 
                  : 'Reject Document & Notify Student (दस्तावेज़ अस्वीकार करें व कारण दर्ज करें)'}
              </span>
              <button
                type="button"
                onClick={() => setShowVerifyPrompt(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="text-slate-400 self-center mr-1">Quick Remarks:</span>
              {(actionType === 'VERIFIED' ? approvalPresets : rejectionPresets).map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setVerifyNotes(language === 'hi' ? preset.hi : preset.en)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-700 text-left truncate max-w-xs transition-colors cursor-pointer"
                >
                  {language === 'hi' ? preset.hi : preset.en}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                placeholder={actionType === 'VERIFIED' ? 'Enter verification notes / remarks...' : 'Enter rejection reason (छात्र के लिए कारण)...'}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleConfirmVerification}
                disabled={isProcessing}
                className={`px-5 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer transition-all ${
                  actionType === 'VERIFIED' ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {isProcessing ? 'Saving...' : `Confirm ${actionType === 'VERIFIED' ? 'Approval & Verification' : 'Rejection'}`}
              </button>
            </div>
          </div>
        )}

        {/* Sandboxed Secure Document Viewport */}
        <div className="flex-1 overflow-hidden bg-slate-950 flex flex-col relative">
          
          {effectiveViewMode === 'pdf' && isDirectPdf ? (
            /* Secure Embedded PDF Viewer */
            <div className="w-full h-full flex-1 p-2 sm:p-4 bg-slate-950 flex flex-col items-center justify-center">
              <div className="w-full h-full max-w-5xl rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl relative flex flex-col">
                {/* Embedded PDF iframe / object sandbox */}
                <iframe
                  src={`${displayUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                  title={displayFileName}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </div>
          ) : (
            /* High-Res Image / Scan Canvas Viewer */
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 relative custom-scrollbar">
              <div 
                className="transition-transform duration-200 ease-out origin-center flex items-center justify-center max-w-full"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`
                }}
              >
                <img
                  src={displayUrl}
                  alt={doc.title}
                  className="max-w-full max-h-[72vh] rounded-2xl shadow-2xl object-contain border border-slate-700 bg-slate-900"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer Meta & Institutional Audit Bar */}
        <div className="px-5 py-3 bg-slate-950/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0 flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Uploaded: {doc.uploadDate || doc.createdAt?.split('T')[0] || '2025-04-01'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" />
              Uploader: {doc.uploadedByName || doc.uploadedBy || 'Institutional User'}
            </span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300 truncate max-w-xs">
              {displayFileName}
            </span>
          </div>

          {doc.verificationNotes && (
            <div className="text-emerald-400 font-medium truncate max-w-md">
              Verification Notes: "{doc.verificationNotes}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

