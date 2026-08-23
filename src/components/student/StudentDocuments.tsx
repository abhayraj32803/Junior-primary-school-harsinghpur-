import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { StudentDocument } from '../../types';
import { 
  FileText, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Download, 
  Trash2, 
  Plus, 
  FileCheck, 
  AlertCircle, 
  Lock, 
  HelpCircle,
  Search,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  FileEdit,
  ArrowRight,
  Info
} from 'lucide-react';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { Student360Modal } from '../common/Student360Modal';
import { downloadDocumentFile } from '../../utils/fileDownloader';
import { resolveCurrentStudent } from '../../utils/studentUtils';

export const StudentDocuments: React.FC = () => {
  const { userProfile } = useAuth();
  const { students, documents, addDocument, deleteDocument, requestDocumentUpdate, language } = useSchool();

  // Find current student from auth
  const currentStudent = resolveCurrentStudent(userProfile, students);
  const myDocs = documents.filter(d => d.studentId === currentStudent?.id || d.studentName === currentStudent?.name);

  // States
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<StudentDocument | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [docToUpdate, setDocToUpdate] = useState<StudentDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Upload Form Data (New Document)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    documentType: 'Aadhaar Card' as any,
    title: currentStudent ? `Aadhaar Card - ${currentStudent.name}` : 'Aadhaar Card Copy',
    documentNumber: '',
    fileURL: '',
    fileName: '',
    fileSize: '',
    fileType: 'image/jpeg',
    notes: ''
  });

  // Update Form Data
  const [updateFormData, setUpdateFormData] = useState({
    fileURL: '',
    fileName: '',
    fileSize: '',
    fileType: 'image/jpeg',
    notes: ''
  });

  const verifiedCount = myDocs.filter(d => (d.verificationStatus === 'VERIFIED' || d.verified) && !d.hasPendingUpdate).length;
  const pendingUpdatesCount = myDocs.filter(d => d.hasPendingUpdate).length;
  const pendingInitialCount = myDocs.filter(d => d.verificationStatus !== 'VERIFIED' && !d.verified && !d.hasPendingUpdate).length;

  // Mandatory checklist items for UP Basic Education Department
  const mandatoryDocsList = [
    { type: 'Aadhaar Card', labelHi: 'आधार कार्ड (UIDAI Aadhaar Card)', labelEn: 'UIDAI Aadhaar Card' },
    { type: 'Birth Certificate', labelHi: 'जन्म प्रमाण पत्र (Birth Certificate)', labelEn: 'Birth Certificate' },
    { type: 'Transfer Certificate', labelHi: 'स्थानांतरण प्रमाण पत्र (TC)', labelEn: 'Transfer Certificate (TC)' },
    { type: 'Previous Marksheet', labelHi: 'पूर्व कक्षा अंकतालिका (Marksheet)', labelEn: 'Previous Class Marksheet' },
    { type: 'Bank Passbook Copy', labelHi: 'बैंक पासबुक / डीबीटी (Passbook)', labelEn: 'Bank Passbook Copy' },
    { type: 'Caste/Income Certificate', labelHi: 'जाति / आय प्रमाण पत्र (Caste Cert)', labelEn: 'Caste / Income Certificate' },
  ];

  // Handle File Selection for New Document
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileURL: base64,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || 'application/pdf',
        title: prev.title || `${prev.documentType} - ${currentStudent?.name || 'My Document'}`
      }));
    };
    reader.readAsDataURL(file);
  };

  // Handle File Selection for Update Request
  const handleUpdateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUpdateFormData(prev => ({
        ...prev,
        fileURL: base64,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || 'application/pdf'
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      documentType: type as any,
      title: `${type} - ${currentStudent?.name || 'Student'}`
    }));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileURL) {
      alert(language === 'hi' ? 'कृपया अपलोड करने के लिए फ़ाइल चुनें' : 'Please choose a document file (PDF / Image) to upload');
      return;
    }

    if (!currentStudent) return;

    setIsUploading(true);
    try {
      await addDocument({
        studentId: currentStudent.id,
        studentName: currentStudent.name,
        title: formData.title || `${formData.documentType} Copy`,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
        fileURL: formData.fileURL,
        fileName: formData.fileName || `${formData.documentType.replace(/\s+/g, '_')}.pdf`,
        fileSize: formData.fileSize || '1.2 MB',
        fileType: formData.fileType || 'application/pdf',
        uploadedBy: userProfile?.uid || currentStudent.id,
        uploadedByName: userProfile?.name || currentStudent.name,
        uploaderRole: 'student',
        verificationStatus: 'PENDING',
        verificationNotes: formData.notes || 'Uploaded by student. Awaiting institutional verification by Headmaster.',
        uploadDate: new Date().toISOString().split('T')[0],
        type: formData.documentType,
        verified: false
      });

      // Reset form
      setFormData({
        documentType: 'Aadhaar Card',
        title: currentStudent ? `Aadhaar Card - ${currentStudent.name}` : 'Aadhaar Card',
        documentNumber: '',
        fileURL: '',
        fileName: '',
        fileSize: '',
        fileType: 'image/jpeg',
        notes: ''
      });
      setIsUploadOpen(false);
    } catch (err) {
      console.error('Error submitting document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Open Update Modal for an existing document
  const handleOpenUpdateModal = (doc: StudentDocument) => {
    setDocToUpdate(doc);
    setUpdateFormData({
      fileURL: '',
      fileName: '',
      fileSize: '',
      fileType: 'image/jpeg',
      notes: ''
    });
  };

  // Submit Update Request
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docToUpdate) return;
    if (!updateFormData.fileURL) {
      alert(language === 'hi' ? 'कृपया नवीनीकरण के लिए नई फ़ाइल चुनें' : 'Please select the new file to replace this document.');
      return;
    }

    setIsUpdating(true);
    try {
      await requestDocumentUpdate(docToUpdate.id, {
        fileURL: updateFormData.fileURL,
        fileName: updateFormData.fileName,
        fileSize: updateFormData.fileSize,
        fileType: updateFormData.fileType,
        notes: updateFormData.notes || 'Student requested document replacement. Awaiting Admin final approval.',
        requestedBy: currentStudent?.name || userProfile?.name || 'Student'
      });

      setDocToUpdate(null);
      alert(
        language === 'hi'
          ? 'दस्तावेज़ नवीनीकरण अनुरोध सफलतापूर्वक भेज दिया गया है। व्यवस्थापक (Admin) द्वारा अंतिम अनुमोदन के पश्चात ही नया दस्तावेज़ सक्रिय होगा। तब तक आपका पुराना दस्तावेज़ ही आधिकारिक रूप से सुरक्षित रहेगा।'
          : 'Document update submitted successfully! It will become active after Admin final approval. Your previous document remains active in the meantime.'
      );
    } catch (err) {
      console.error('Error submitting document update:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (window.confirm(language === 'hi' ? `क्या आप निश्चित रूप से "${title}" हटाना चाहते हैं?` : `Are you sure you want to delete "${title}"?`)) {
      await deleteDocument(id);
    }
  };

  const filteredDocs = myDocs.filter(d => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      !term ||
      d.title.toLowerCase().includes(term) ||
      (d.documentType || d.type || '').toLowerCase().includes(term) ||
      (d.documentNumber || '').toLowerCase().includes(term);

    const matchesCategory = filterCategory === 'all' || d.documentType === filterCategory || d.type === filterCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {language === 'hi' ? 'छात्र दस्तावेज़ लॉकर एवं 360° कोष' : 'Student Digital Document Vault & 360° Dossier'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              UDISE+ & DBT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'hi' 
              ? 'दस्तावेज़ सुरक्षित अपलोड करें, डिवाइस में डाउनलोड करें व आवश्यकता पड़ने पर नवीनीकरण अनुरोध भेजें' 
              : 'Securely upload, download to device, and submit update requests for administrative approval'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentStudent && (
            <button
              onClick={() => setIs360ModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{language === 'hi' ? 'मेरी पूरी 360° प्रोफ़ाइल देखें' : 'View Full 360° Portfolio'}</span>
            </button>
          )}

          <button
            onClick={() => setIsUploadOpen(!isUploadOpen)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploadOpen ? (language === 'hi' ? 'फ़ॉर्म बंद करें' : 'Close Form') : (language === 'hi' ? '+ नया दस्तावेज़ अपलोड करें' : '+ Upload Document')}</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{myDocs.length}</div>
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'कुल अपलोड किए गए दस्तावेज़' : 'Total Uploaded Documents'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{verifiedCount}</div>
            <div className="text-xs text-slate-500 font-semibold">{language === 'hi' ? 'प्रधानाध्यापक द्वारा सत्यापित' : 'Verified by School Principal'}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{pendingInitialCount + pendingUpdatesCount}</div>
            <div className="text-xs text-slate-500 font-semibold">
              {pendingUpdatesCount > 0 
                ? (language === 'hi' ? `${pendingUpdatesCount} अपडेट अनुमोदन लंबित` : `${pendingUpdatesCount} Updates Pending Approval`)
                : (language === 'hi' ? 'सत्यापन प्रक्रिया में लंबित' : 'Pending School Verification')}
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Document Checklist for Student */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black tracking-tight text-white">
              {language === 'hi' ? 'अनिवार्य सरकारी विद्यालय प्रवेश व छात्रवृत्ति चेकलिस्ट' : 'Mandatory Government Admission & Scholarship Checklist'}
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-bold font-mono">
            {verifiedCount} / {mandatoryDocsList.length} Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {mandatoryDocsList.map((item, idx) => {
            const matched = myDocs.find(d => 
              d.documentType === item.type || d.type === item.type || d.title.toLowerCase().includes(item.type.toLowerCase())
            );
            const isVerified = matched && (matched.verificationStatus === 'VERIFIED' || matched.verified);

            return (
              <div 
                key={idx}
                className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                  isVerified 
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-100' 
                    : matched 
                      ? 'bg-amber-950/40 border-amber-500/40 text-slate-100' 
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold truncate text-white">
                    {language === 'hi' ? item.labelHi : item.labelEn}
                  </div>
                  <div className="text-[10px] mt-0.5">
                    {matched?.hasPendingUpdate ? (
                      <span className="text-amber-400 font-semibold">🔄 {language === 'hi' ? 'अपडेट समीक्षाधीन (Update Pending)' : 'Update Pending'}</span>
                    ) : isVerified ? (
                      <span className="text-emerald-400 font-semibold">✓ {language === 'hi' ? 'सत्यापित (Verified)' : 'Verified by School'}</span>
                    ) : matched ? (
                      <span className="text-amber-400 font-semibold">⏳ {language === 'hi' ? 'समीक्षा में (Under Review)' : 'Under Review'}</span>
                    ) : (
                      <span className="text-slate-400 font-semibold">✕ {language === 'hi' ? 'अपलोड नहीं किया' : 'Not Uploaded Yet'}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {matched && (
                    <button
                      onClick={() => downloadDocumentFile(matched.fileURL, matched.fileName || `${matched.title}.pdf`)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Download to Device"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {matched ? (
                    <button
                      onClick={() => setSelectedDocForViewer(matched)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="View Document"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleDocTypeChange(item.type);
                        setIsUploadOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black shrink-0 transition-colors"
                    >
                      {language === 'hi' ? '+ अपलोड' : '+ Upload'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* UPLOAD FORM DRAWER (NEW DOCUMENT) */}
      {isUploadOpen && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-amber-400 shadow-xl space-y-5 animate-in slide-in-from-top-3 duration-300">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-700">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {language === 'hi' ? 'नया दस्तावेज़ या प्रमाणपत्र अपलोड करें' : 'Upload New Student Certificate / Document'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'hi' ? 'आधार कार्ड, अंकतालिका, जाति प्रमाण पत्र या पासबुक की फ़ोटो / PDF चुनें' : 'Attach your UIDAI Aadhaar, Marksheet, Transfer Certificate, or Passbook'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(false)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'दस्तावेज़ की श्रेणी *' : 'Document Category *'}
                </label>
                <select
                  value={formData.documentType}
                  onChange={(e) => handleDocTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Aadhaar Card">Aadhaar Card (आधार कार्ड)</option>
                  <option value="Birth Certificate">Birth Certificate (जन्म प्रमाण पत्र)</option>
                  <option value="Transfer Certificate">Transfer Certificate (TC / टीसी)</option>
                  <option value="Previous Marksheet">Previous Class Marksheet (पूर्व अंकतालिका)</option>
                  <option value="Caste/Income Certificate">Caste / Category Certificate (जाति प्रमाण पत्र)</option>
                  <option value="Bank Passbook Copy">Bank Passbook Copy (बैंक पासबुक)</option>
                  <option value="Medical Record">Medical & Health Record (चिकित्सा प्रमाण पत्र)</option>
                  <option value="Other">Other Certificate (अन्य प्रमाण पत्र)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'दस्तावेज़ शीर्षक / नाम *' : 'Document Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UIDAI Aadhaar Verification Record"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'प्रमाणपत्र संख्या / संदर्भ संख्या' : 'Certificate / Reference No.'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. UIDAI-UP-8921-4589"
                  value={formData.documentNumber}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* File Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'hi' ? 'दस्तावेज़ फ़ाइल चुनें (PDF / Image / Scan) *' : 'Select Document File (PDF / Image / Scan) *'}
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/20 transition-all flex flex-col items-center justify-center gap-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-amber-500 animate-bounce" />
                <div className="text-xs font-bold text-slate-900">
                  {formData.fileName ? (
                    <span className="text-emerald-700">✓ {language === 'hi' ? 'चयनित' : 'Selected'}: {formData.fileName} ({formData.fileSize})</span>
                  ) : (
                    <span>{language === 'hi' ? 'फ़ाइल चुनने या खींचकर छोड़ने के लिए यहाँ क्लिक करें' : 'Click to select or drag & drop document file'}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">PDF, JPG, PNG, WEBP (Max 10 MB)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'टिप्पणी / विवरण (वैकल्पिक)' : 'Notes / Remarks (Optional)'}
              </label>
              <input
                type="text"
                placeholder={language === 'hi' ? 'उदा. मूल प्रतिलिपि से स्कैन किया गया' : 'e.g. Original scan from tehsil / government agency'}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUploading ? (language === 'hi' ? 'अपलोड हो रहा है...' : 'Uploading...') : (language === 'hi' ? 'दस्तावेज़ सुरक्षित सहेजें' : 'Save & Submit Document')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DOCUMENT UPDATE MODAL */}
      {docToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    {language === 'hi' ? 'दस्तावेज़ नवीनीकरण / अपडेट अनुरोध' : 'Submit Document Update Request'}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-xs">{docToUpdate.title}</p>
                </div>
              </div>
              <button
                onClick={() => setDocToUpdate(null)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Workflow Notice */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 space-y-1.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-950">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{language === 'hi' ? 'महत्वपूर्ण नियम (Admin Approval Workflow):' : 'Important Rule:'}</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                {language === 'hi' 
                  ? 'आपके द्वारा नया दस्तावेज़ अपलोड करने पर वह तुरंत पुराना दस्तावेज़ नहीं बदलेगा। वह व्यवस्थापक (Admin) के पास अंतिम अनुमोदन हेतु जाएगा। यदि व्यवस्थापक इसे अस्वीकार (Reject) करते हैं तो आपका पूर्व का दस्तावेज़ ही मान्य रहेगा।' 
                  : 'The updated file will be submitted for Admin approval. The previous document remains active and valid on your record until official approval.'}
              </p>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              {/* File Dropzone */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'नया दस्तावेज़ चुनें (PDF / Image) *' : 'Select New Document File (PDF / Image) *'}
                </label>
                <div 
                  onClick={() => updateFileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-2xl p-6 text-center cursor-pointer bg-amber-50/30 hover:bg-amber-50/70 transition-all flex flex-col items-center justify-center gap-2"
                >
                  <input
                    type="file"
                    ref={updateFileInputRef}
                    onChange={handleUpdateFileChange}
                    accept="image/*,.pdf"
                    className="hidden"
                  />
                  <Upload className="w-7 h-7 text-amber-600" />
                  <div className="text-xs font-bold text-slate-900">
                    {updateFormData.fileName ? (
                      <span className="text-emerald-700">✓ {language === 'hi' ? 'चयनित' : 'Selected'}: {updateFormData.fileName} ({updateFormData.fileSize})</span>
                    ) : (
                      <span>{language === 'hi' ? 'नई प्रतिलिपि चुनने के लिए यहाँ क्लिक करें' : 'Click to select updated document file'}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG, WEBP (Max 10 MB)</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'अपडेट करने का कारण / विवरण' : 'Reason / Notes for Update'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'hi' ? 'उदा. आधार कार्ड में पता सुधारा गया / नई अंकतालिका' : 'e.g. Updated address / recent marksheet'}
                  value={updateFormData.notes}
                  onChange={(e) => setUpdateFormData({ ...updateFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDocToUpdate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !updateFormData.fileURL}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? (language === 'hi' ? 'भेज रहे हैं...' : 'Submitting...') : (language === 'hi' ? 'अनुमोदन हेतु भेजें' : 'Submit for Approval')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'hi' ? 'दस्तावेज़ शीर्षक या क्रमांक से खोजें...' : 'Search your documents by title or reference number...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
          >
            <option value="all">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'} ({myDocs.length})</option>
            <option value="Aadhaar Card">Aadhaar Card (आधार कार्ड)</option>
            <option value="Birth Certificate">Birth Certificate (जन्म प्रमाण पत्र)</option>
            <option value="Transfer Certificate">Transfer Certificate (TC)</option>
            <option value="Previous Marksheet">Marksheet (अंकतालिका)</option>
            <option value="Bank Passbook Copy">Bank Passbook (बैंक पासबुक)</option>
            <option value="Caste/Income Certificate">Caste / Income Certificate</option>
          </select>
        </div>
      </div>

      {/* Uploaded Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isVerified = (doc.verificationStatus === 'VERIFIED' || doc.verified) && !doc.hasPendingUpdate;

          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
            >
              <div className="space-y-3">
                {/* Header Tag & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {doc.documentType || doc.type}
                  </span>

                  {doc.hasPendingUpdate ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <RefreshCw className="w-3 h-3 text-amber-700 animate-spin" />
                      <span>{language === 'hi' ? 'अपडेट अनुमोदन लंबित' : 'Update Pending'}</span>
                    </span>
                  ) : isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>{language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                    </span>
                  ) : doc.verificationStatus === 'REJECTED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                      <span>{language === 'hi' ? 'अस्वीकृत' : 'Rejected'}</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>{language === 'hi' ? 'समीक्षाधीन' : 'Pending Review'}</span>
                    </span>
                  )}
                </div>

                {/* Thumbnail & Title */}
                <div className="flex gap-3 items-center">
                  <div
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer group-hover:border-amber-400 transition-colors relative"
                  >
                    <img
                      src={doc.fileURL}
                      alt={doc.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 
                      onClick={() => setSelectedDocForViewer(doc)}
                      className="font-extrabold text-sm text-slate-900 line-clamp-1 cursor-pointer hover:text-amber-600 transition-colors"
                    >
                      {doc.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Ref: {doc.documentNumber || 'UP-DOC-VERIFIED'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {doc.fileSize || '1.2 MB'} • {doc.uploadDate}
                    </div>
                  </div>
                </div>

                {/* Pending Update Notice inside card */}
                {doc.hasPendingUpdate && (
                  <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 text-amber-600" />
                      <span>{language === 'hi' ? 'नवीनीकरण अनुरोध विचाराधीन है:' : 'Update Request in Review:'}</span>
                    </div>
                    <div className="text-[10px] text-amber-800">
                      "{doc.pendingUpdateNotes || 'Student uploaded new copy'}"
                    </div>
                    <div className="text-[9px] text-amber-700/80">
                      {language === 'hi' ? 'अंतिम अनुमोदन तक पुराना दस्तावेज़ ही आधिकारिक रूप से मान्य रहेगा।' : 'Original document remains active until Admin approves.'}
                    </div>
                  </div>
                )}

                {/* Rejection Notice if admin rejected an update */}
                {doc.updateRejectionReason && (
                  <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-200 text-[11px] text-rose-900 space-y-0.5">
                    <div className="font-bold flex items-center gap-1 text-rose-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{language === 'hi' ? 'पिछला अपडेट अस्वीकार हुआ:' : 'Update Rejected by Admin:'}</span>
                    </div>
                    <div className="text-[10px] text-rose-800">
                      "{doc.updateRejectionReason}"
                    </div>
                    <div className="text-[9px] text-emerald-700 font-semibold">
                      ✓ {language === 'hi' ? 'मूल दस्तावेज़ सुरक्षित व सक्रिय है' : 'Original document remains valid'}
                    </div>
                  </div>
                )}

                {/* Verification remarks */}
                {doc.verificationNotes && !doc.hasPendingUpdate && !doc.updateRejectionReason && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                    "{doc.verificationNotes}"
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-950 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'देखें' : 'View'}</span>
                  </button>

                  <button
                    onClick={() => handleOpenUpdateModal(doc)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-800 hover:text-slate-950 font-bold flex items-center gap-1 border border-amber-200 transition-colors cursor-pointer text-xs"
                    title="Update / Re-upload Document"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'अपडेट' : 'Update'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Download to Device */}
                  <button
                    onClick={() => downloadDocumentFile(doc.fileURL, doc.fileName || `${doc.title}.pdf`)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    title="Download to Device (डिवाइस में डाउनलोड करें)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {!isVerified && !doc.hasPendingUpdate && (
                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete Upload"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">
              {language === 'hi' ? 'कोई दस्तावेज़ नहीं मिला' : 'No documents found in your digital vault'}
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-sm cursor-pointer"
            >
              {language === 'hi' ? '+ पहला दस्तावेज़ अपलोड करें' : '+ Upload Your First Document'}
            </button>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocForViewer && (
        <DocumentViewerModal
          document={selectedDocForViewer}
          isOpen={!!selectedDocForViewer}
          onClose={() => setSelectedDocForViewer(null)}
          canVerify={false}
        />
      )}

      {/* Student 360° Modal */}
      {is360ModalOpen && currentStudent && (
        <Student360Modal
          student={currentStudent}
          isOpen={is360ModalOpen}
          onClose={() => setIs360ModalOpen(false)}
          canManageDocuments={true}
        />
      )}
    </div>
  );
};
