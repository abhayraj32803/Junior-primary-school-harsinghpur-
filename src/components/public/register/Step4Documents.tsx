import React, { useRef, useState } from 'react';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  Trash2, 
  Eye, 
  Info, 
  ShieldCheck, 
  ExternalLink,
  CreditCard,
  FileBadge,
  Sparkles,
  CheckSquare,
  Square
} from 'lucide-react';

export interface UploadedDocSlot {
  type: string;
  titleHi: string;
  titleEn: string;
  descriptionHi: string;
  descriptionEn: string;
  isRequired: boolean;
  fileURL: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  documentNumber?: string;
}

export interface Step4Data {
  documents: Record<string, UploadedDocSlot>;
  isSelfDeclared: boolean;
  declarationDate: string;
}

interface Step4DocumentsProps {
  data: Step4Data;
  onChange: (updates: Partial<Step4Data>) => void;
  errors: Record<string, string>;
  language: 'hi' | 'en';
}

export const Step4Documents: React.FC<Step4DocumentsProps> = ({
  data,
  onChange,
  errors,
  language
}) => {
  const [activePreviewDoc, setActivePreviewDoc] = useState<{ url: string; title: string; type: string } | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const documentSlots = [
    {
      key: 'birthCertificate',
      titleHi: 'जन्म प्रमाण पत्र / आयु स्व-घोषणा',
      titleEn: 'Birth Certificate / Age Declaration',
      descriptionHi: 'नगर पालिका / ग्राम पंचायत जन्म प्रमाण पत्र अथवा आंगनवाड़ी रिकॉर्ड',
      descriptionEn: 'Gram Panchayat/Municipality birth certificate or age declaration',
      isRequired: false,
      tag: 'Recommended'
    },
    {
      key: 'aadhaarCard',
      titleHi: 'विद्यार्थी / अभिभावक आधार कार्ड',
      titleEn: 'Student / Parent Aadhaar Card',
      descriptionHi: 'UIDAI आधार कार्ड की छायाप्रति (डीबीटी व छात्रवृत्ति हेतु)',
      descriptionEn: 'Photocopy of Aadhaar Card for DBT & Scholarship linkage',
      isRequired: false,
      tag: 'DBT Scheme'
    },
    {
      key: 'transferCertificate',
      titleHi: 'स्थानांतरण प्रमाण पत्र (TC) / अंकतालिका',
      titleEn: 'Transfer Certificate (TC) / Marksheet',
      descriptionHi: 'कक्षा 2 से 8 में प्रवेश हेतु पूर्व विद्यालय की टीसी (यदि उपलब्ध हो)',
      descriptionEn: 'TC / Marksheet from previous school for Class 2-8 (if available)',
      isRequired: false,
      tag: 'Optional'
    },
    {
      key: 'bankPassbook',
      titleHi: 'बैंक खाता पासबुक की प्रति (DBT)',
      titleEn: 'Bank Passbook Copy (DBT)',
      descriptionHi: '₹1200 स्कूल यूनिफॉर्म, जूता-मोजा, बैग व स्वेटर योजना हेतु',
      descriptionEn: 'Parent/Student bank account for direct benefit transfer',
      isRequired: false,
      tag: 'Govt Benefit'
    },
    {
      key: 'casteIncome',
      titleHi: 'जाति / आय प्रमाण पत्र (यदि लागू हो)',
      titleEn: 'Caste / Income Certificate (If applicable)',
      descriptionHi: 'OBC/SC/ST/EWS छात्रवृत्ति व सरकारी सहायता लाभ हेतु',
      descriptionEn: 'Revenue department certificate for social welfare schemes',
      isRequired: false,
      tag: 'Scholarship'
    }
  ];

  const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'hi' ? 'दस्तावेज का आकार 5MB से कम होना चाहिए।' : 'Document file size must be under 5MB.');
      return;
    }

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const slotConfig = documentSlots.find(s => s.key === key);
      
      const updatedDocs = {
        ...data.documents,
        [key]: {
          type: slotConfig?.titleEn || key,
          titleHi: slotConfig?.titleHi || key,
          titleEn: slotConfig?.titleEn || key,
          descriptionHi: slotConfig?.descriptionHi || '',
          descriptionEn: slotConfig?.descriptionEn || '',
          isRequired: slotConfig?.isRequired || false,
          fileURL: base64,
          fileName: file.name,
          fileSize: sizeStr,
          fileType: file.type || 'application/pdf'
        }
      };

      onChange({ documents: updatedDocs });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveDoc = (key: string) => {
    const updatedDocs = { ...data.documents };
    delete updatedDocs[key];
    onChange({ documents: updatedDocs });
    if (fileInputRefs.current[key]) {
      fileInputRefs.current[key]!.value = '';
    }
  };

  const uploadedCount = Object.keys(data.documents || {}).length;

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="bg-indigo-50/80 border border-indigo-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
        <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {language === 'hi' ? 'चरण 4: दस्तावेज अपलोड एवं अभिभावक स्व-घोषणा' : 'Step 4: Document Upload & Parent Undertaking'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {language === 'hi'
              ? 'प्रवेश सत्यापन व ₹1200 DBT योजना हेतु आवश्यक दस्तावेज संलग्न करें। यदि कोई दस्तावेज अभी उपलब्ध नहीं है, तो प्रवेश के बाद भी विद्यालय में जमा किया जा सकता है।'
              : 'Upload documents for admission verification and ₹1200 DBT transfer scheme. Missing documents can be submitted at school after admission.'}
          </p>
        </div>
      </div>

      {/* RTE No-Denial Guarantee Notice */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 space-y-1">
          <span className="font-black text-emerald-900 block">
            {language === 'hi' ? 'RTE 2009 वैधानिक अधिकार गारंटी (Right to Education Act):' : 'RTE Act 2009 Statutory Guarantee:'}
          </span>
          <p className="leading-relaxed text-emerald-800">
            {language === 'hi'
              ? 'दस्तावेज (जैसे जन्म प्रमाण पत्र या आधार) के अभाव में किसी भी बच्चे का प्रवेश नहीं रोका जाएगा। अभिभावक की स्व-घोषणा पर भी तात्कालिक प्रवेश प्रदान किया जाता है।'
              : 'Under RTE 2009, no child shall be denied admission due to lack of birth certificate or Aadhaar. Parent self-declaration is legally sufficient for initial enrollment.'}
          </p>
        </div>
      </div>

      {/* Document Upload Slots Grid */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            {language === 'hi' ? 'दस्तावेज सूची (Document Checklist)' : 'Document Checklist'}
          </h4>
          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            {uploadedCount} / {documentSlots.length} {language === 'hi' ? 'संलग्न' : 'Attached'}
          </span>
        </div>

        {documentSlots.map((slot) => {
          const uploaded = data.documents?.[slot.key];
          const hasFile = !!uploaded?.fileURL;

          return (
            <div
              key={slot.key}
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                hasFile
                  ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/70 border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Slot Details */}
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                    hasFile ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {hasFile ? <FileCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {language === 'hi' ? slot.titleHi : slot.titleEn}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        hasFile 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {hasFile ? (language === 'hi' ? 'अपलोड हुआ ✓' : 'Uploaded ✓') : slot.tag}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {language === 'hi' ? slot.descriptionHi : slot.descriptionEn}
                    </p>

                    {hasFile && (
                      <div className="flex items-center gap-2 text-[11px] font-mono text-slate-600 pt-0.5">
                        <span className="truncate max-w-xs font-semibold">{uploaded.fileName}</span>
                        <span>•</span>
                        <span>{uploaded.fileSize}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Slot Action Controls */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <input
                    type="file"
                    ref={(el) => (fileInputRefs.current[slot.key] = el)}
                    onChange={(e) => handleFileUpload(slot.key, e)}
                    accept="image/png, image/jpeg, image/webp, application/pdf"
                    className="hidden"
                    id={`doc-input-${slot.key}`}
                  />

                  {hasFile ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setActivePreviewDoc({ url: uploaded.fileURL, title: slot.titleHi, type: uploaded.fileType })}
                        className="min-h-[40px] px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{language === 'hi' ? 'देखें' : 'Preview'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveDoc(slot.key)}
                        className="min-h-[40px] p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                        title={language === 'hi' ? 'हटाएं' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[slot.key]?.click()}
                      className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{language === 'hi' ? 'अपलोड करें' : 'Upload'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Self Declaration & Parent Undertaking Checkbox */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={data.isSelfDeclared}
            onChange={(e) => onChange({ isSelfDeclared: e.target.checked })}
            className="w-5 h-5 rounded-md border-amber-400 text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer shrink-0"
          />
          <div className="space-y-1">
            <span className="text-xs sm:text-sm font-bold text-slate-900 leading-snug block">
              {language === 'hi'
                ? 'अभिभावक स्व-घोषणा एवं सत्यनिष्ठा वचन (Parent Self-Declaration Undertaking)'
                : 'Parent Self-Declaration & Authenticity Undertaking'}{' '}
              <span className="text-rose-500">*</span>
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {language === 'hi'
                ? 'मैं प्रमाणित करता/करती हूँ कि इस प्रवेश प्रपत्र में दी गई सभी जानकारियां (नाम, जन्मतिथि, पता, जाति) मेरी सर्वोत्तम जानकारी के अनुसार पूर्णतः सत्य व प्रमाणिक हैं। किसी भी विसंगति हेतु मैं उत्तरदायी रहूँगा/रहूँगी।'
                : 'I hereby certify that all information submitted in this application is true and authentic to the best of my knowledge.'}
            </p>
          </div>
        </label>
        {errors.isSelfDeclared && (
          <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1 pl-8">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errors.isSelfDeclared}</span>
          </p>
        )}
      </div>

      {/* Document Quick Preview Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h4 className="text-sm font-bold truncate pr-4">{activePreviewDoc.title}</h4>
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[300px]">
              {activePreviewDoc.type.includes('image') || activePreviewDoc.url.startsWith('data:image') ? (
                <img
                  src={activePreviewDoc.url}
                  alt="Preview"
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="text-center p-6 bg-white rounded-xl border border-slate-200">
                  <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800 mb-2">PDF Document Ready</p>
                  <a
                    href={activePreviewDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    <span>{language === 'hi' ? 'दस्तावेज नए टैब में खोलें' : 'Open in new tab'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePreviewDoc(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
