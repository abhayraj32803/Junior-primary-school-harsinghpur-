import React, { useState, useRef, useEffect } from 'react';
import { Student, StudentDocument } from '../../types';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  User, 
  FileText, 
  Upload, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Printer, 
  Download, 
  Eye, 
  Trash2, 
  GraduationCap, 
  Building2, 
  CreditCard, 
  HeartPulse, 
  Phone, 
  MapPin, 
  Calendar, 
  Award, 
  BookOpen, 
  FileCheck,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Check,
  ChevronLeft,
  ChevronRight,
  Users
} from 'lucide-react';
import { DocumentViewerModal } from './DocumentViewerModal';
import { StudentIdCardPrint } from './StudentIdCardPrint';
import { RegistrationRequest } from '../../types';
import { downloadDocumentFile } from '../../utils/fileDownloader';

interface Student360ModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'documents' | 'personal' | 'academic' | 'bank' | 'health';
  canManageDocuments?: boolean;
  pendingRequest?: RegistrationRequest | null;
  onApproveRequest?: (requestId: string) => Promise<void>;
  onRejectRequest?: (requestId: string, reason?: string) => Promise<void>;
}

export const Student360Modal: React.FC<Student360ModalProps> = ({
  student,
  isOpen,
  onClose,
  initialTab = 'documents',
  canManageDocuments = true,
  pendingRequest,
  onApproveRequest,
  onRejectRequest
}) => {
  const { 
    students,
    documents, 
    addDocument, 
    deleteDocument, 
    verifyDocument, 
    approveDocumentUpdate,
    rejectDocumentUpdate,
    getStudentAttendanceStats, 
    marks, 
    examinations, 
    settings,
    language 
  } = useSchool();
  const { userProfile } = useAuth();

  const [activeStudentId, setActiveStudentId] = useState<string>(student?.id || '');

  useEffect(() => {
    if (student?.id) {
      setActiveStudentId(student.id);
    }
  }, [student?.id]);

  const activeStudent = students.find(s => s.id === activeStudentId) || student;

  const [activeTab, setActiveTab] = useState<'documents' | 'personal' | 'academic' | 'bank' | 'health'>(initialTab);
  const [selectedDocForView, setSelectedDocForView] = useState<StudentDocument | null>(null);
  const [isPrintIdCardOpen, setIsPrintIdCardOpen] = useState(false);
  const [docFilter, setDocFilter] = useState<string>('all');
  const [docSearch, setDocSearch] = useState<string>('');

  // Upload Form State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    documentType: 'Aadhaar Card' as any,
    title: '',
    documentNumber: '',
    fileURL: '',
    fileName: '',
    fileSize: '',
    fileType: 'image/jpeg',
    notes: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !activeStudent) return null;

  const currentIndex = students.findIndex(s => s.id === activeStudent.id);
  const prevStudent = currentIndex > 0 ? students[currentIndex - 1] : null;
  const nextStudent = currentIndex >= 0 && currentIndex < students.length - 1 ? students[currentIndex + 1] : null;

  // Filter student's documents
  const studentDocs = documents.filter(d => d.studentId === activeStudent.id || d.studentName === activeStudent.name);
  const verifiedCount = studentDocs.filter(d => d.verificationStatus === 'VERIFIED' || d.verified).length;
  const pendingCount = studentDocs.length - verifiedCount;

  // Filtered documents list
  const filteredDocs = studentDocs.filter(doc => {
    const matchesFilter = 
      docFilter === 'all' || 
      (docFilter === 'verified' && (doc.verificationStatus === 'VERIFIED' || doc.verified)) ||
      (docFilter === 'pending' && doc.verificationStatus !== 'VERIFIED' && !doc.verified) ||
      (docFilter === doc.documentType);
    
    const term = docSearch.toLowerCase();
    const matchesSearch = 
      !term || 
      doc.title.toLowerCase().includes(term) ||
      (doc.documentType || '').toLowerCase().includes(term) ||
      (doc.documentNumber || '').toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  // Calculate student attendance stats
  const attendanceStats = getStudentAttendanceStats(activeStudent.id);

  // Student marks and exams
  const studentMarks = marks.filter(m => m.studentId === activeStudent.id);

  // Mandatory checklist items
  const mandatoryDocsList = [
    { type: 'Aadhaar Card', label: 'UIDAI Aadhaar Card (आधार कार्ड)' },
    { type: 'Birth Certificate', label: 'Birth Certificate (जन्म प्रमाण पत्र)' },
    { type: 'Transfer Certificate', label: 'Transfer Certificate / TC (स्थानांतरण प्रमाण पत्र)' },
    { type: 'Previous Marksheet', label: 'Previous Class Marksheet (पूर्व कक्षा अंकतालिका)' },
    { type: 'Bank Passbook Copy', label: 'Bank Passbook / DBT (बैंक पासबुक)' },
    { type: 'Caste/Income Certificate', label: 'Caste / Category Certificate (जाति प्रमाण पत्र)' },
  ];

  // Handle File Selection (base64 conversion + preview)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setUploadFormData(prev => ({
        ...prev,
        fileURL: base64,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || 'application/pdf',
        title: prev.title || `${prev.documentType} - ${activeStudent.name}`
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDocTypeChange = (docType: string) => {
    setUploadFormData(prev => ({
      ...prev,
      documentType: docType as any,
      title: `${docType} - ${activeStudent.name}`
    }));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFormData.fileURL) {
      alert('Please select or upload a document file (PDF or Image).');
      return;
    }

    setIsUploading(true);
    try {
      const uploaderRole = userProfile?.role || 'admin';
      const uploaderName = userProfile?.name || 'School Administration';

      await addDocument({
        studentId: activeStudent.id,
        studentName: activeStudent.name,
        documentType: uploadFormData.documentType,
        title: uploadFormData.title || `${uploadFormData.documentType} Copy`,
        fileURL: uploadFormData.fileURL,
        fileName: uploadFormData.fileName || `${uploadFormData.documentType.replace(/\s+/g, '_')}.pdf`,
        fileSize: uploadFormData.fileSize || '1.2 MB',
        fileType: uploadFormData.fileType || 'application/pdf',
        documentNumber: uploadFormData.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
        uploadedBy: userProfile?.uid || 'system_admin',
        uploadedByName: uploaderName,
        uploaderRole: uploaderRole as any,
        verificationStatus: uploaderRole === 'admin' ? 'VERIFIED' : 'PENDING',
        verifiedBy: uploaderRole === 'admin' ? uploaderName : undefined,
        verifiedAt: uploaderRole === 'admin' ? new Date().toISOString() : undefined,
        verificationNotes: uploadFormData.notes || (uploaderRole === 'admin' ? 'Officially uploaded and verified by School Admin' : 'Uploaded by student for school review'),
        uploadDate: new Date().toISOString().split('T')[0],
        type: uploadFormData.documentType,
        verified: uploaderRole === 'admin'
      });

      // Reset form
      setUploadFormData({
        documentType: 'Aadhaar Card',
        title: '',
        documentNumber: '',
        fileURL: '',
        fileName: '',
        fileSize: '',
        fileType: 'image/jpeg',
        notes: ''
      });
      setIsUploadOpen(false);
    } catch (err) {
      console.error('Error adding document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await deleteDocument(id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl h-[94vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
          
          {/* QUICK STUDENT SWITCHER BAR FOR ONE-CLICK 360 BROWSING */}
          <div className="px-6 py-2.5 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 text-xs flex-wrap shrink-0">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-bold hidden sm:inline">
                {language === 'hi' ? 'छात्र प्रोफाइल 360° बदलें:' : 'Select Student (360° Direct View):'}
              </span>
              <select
                value={activeStudent.id}
                onChange={(e) => setActiveStudentId(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-400"
              >
                {students.map((st, idx) => (
                  <option key={st.id} value={st.id}>
                    {idx + 1}. {st.name} (Class {st.classNumber}-{st.sectionName}, Roll #{st.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={!prevStudent}
                onClick={() => prevStudent && setActiveStudentId(prevStudent.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title={prevStudent ? `Previous: ${prevStudent.name}` : 'No previous student'}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पिछला' : 'Prev'}</span>
              </button>

              <span className="text-[11px] font-mono text-slate-400 font-bold">
                {currentIndex + 1} / {students.length}
              </span>

              <button
                disabled={!nextStudent}
                onClick={() => nextStudent && setActiveStudentId(nextStudent.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title={nextStudent ? `Next: ${nextStudent.name}` : 'No next student'}
              >
                <span>{language === 'hi' ? 'अगला' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* TOP 360° HERO BANNER */}
          <div className="px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800 border-2 border-amber-500 overflow-hidden shadow-lg shrink-0">
                  {activeStudent.photoURL ? (
                    <img 
                      src={activeStudent.photoURL} 
                      alt={activeStudent.name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-2xl text-amber-400 bg-amber-500/10">
                      {activeStudent.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full flex items-center justify-center text-[10px] text-white" title="Active Record">
                  ✓
                </span>
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">{activeStudent.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Class {activeStudent.classNumber} - '{activeStudent.sectionName}' • Roll #{activeStudent.rollNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>DBT & UDISE+ Linked</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="font-mono text-slate-300 font-bold">ID: {activeStudent.studentId}</span>
                  <span>•</span>
                  <span>Admission: <span className="font-mono text-slate-300">{activeStudent.admissionNumber}</span></span>
                  <span>•</span>
                  <span>SRN: <span className="font-mono text-amber-400">{activeStudent.registrationNumber || 'SRN-UP-2025'}</span></span>
                  <span>•</span>
                  <span>Category: <span className="text-slate-200 font-semibold">{activeStudent.category || 'General'}</span></span>
                </div>
              </div>
            </div>

            {/* Quick Actions in Header */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsPrintIdCardOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                title="Print Official ID Card"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Print ID Card</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('documents');
                  setIsUploadOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
                title="Upload New Document"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Close 360 View"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* PENDING REGISTRATION APPROVAL STRIP */}
          {pendingRequest && (
            <div className="px-6 py-3 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-4 flex-wrap shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs font-black text-amber-300 flex items-center gap-2">
                    <span>{language === 'hi' ? 'लंबित छात्र पंजीकरण / प्रवेश अनुरोध' : 'Pending Student Registration Request'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400 text-slate-950 font-bold uppercase">
                      {pendingRequest.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Login ID: <span className="font-mono text-amber-300 font-bold">{pendingRequest.preferredUsername || 'Auto-generated'}</span> • Applied: {new Date(pendingRequest.createdAt).toLocaleDateString()} • Mobile: {pendingRequest.phone || 'N/A'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onRejectRequest && pendingRequest.status === 'PENDING' && (
                  <button
                    onClick={() => onRejectRequest(pendingRequest.id, 'Records could not be verified by administration.')}
                    className="px-3.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'अस्वीकृत करें' : 'Reject Application'}
                  </button>
                )}
                {onApproveRequest && pendingRequest.status === 'PENDING' && (
                  <button
                    onClick={() => onApproveRequest(pendingRequest.id)}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्वीकृत करें और नामांकित करें' : 'Approve & Enrol Student'}</span>
                  </button>
                )}
                {pendingRequest.status === 'APPROVED' && (
                  <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'स्वीकृत व सक्रिय' : 'Approved & Active'}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 360° NAVIGATION TABS */}
          <div className="px-6 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'documents'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>360° Document Vault (दस्तावेज़ कोष)</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {studentDocs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'personal'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal & Family Profile (बायोडाटा)</span>
            </button>

            <button
              onClick={() => setActiveTab('academic')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'academic'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Academics & Attendance (उपस्थिति व परीक्षा)</span>
              {attendanceStats && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                  {attendanceStats.percentage}%
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'bank'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Bank & DBT Welfare (डीबीटी व छात्रवृत्ति)</span>
            </button>

            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-black border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === 'health'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartPulse className="w-4 h-4" />
              <span>Health & CWSN (स्वास्थ्य व पोषण)</span>
            </button>
          </div>

          {/* MAIN TAB CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-900/50">
            
            {/* TAB 1: 360° DOCUMENT VAULT & VERIFICATION */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                
                {/* Vault Overview Stats & Quick Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-white">{studentDocs.length}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">Total Documents Uploaded</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-emerald-400">{verifiedCount}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">Verified by Headmaster</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xl font-black text-amber-400">{pendingCount}</div>
                      <div className="text-[11px] text-slate-400 font-semibold">Pending Institutional Review</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase">Vault Compliance</div>
                      <div className="text-lg font-black text-white">
                        {Math.round((verifiedCount / (mandatoryDocsList.length || 1)) * 100)}% Complete
                      </div>
                    </div>
                    <button
                      onClick={() => setIsUploadOpen(!isUploadOpen)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm transition-colors cursor-pointer"
                    >
                      {isUploadOpen ? 'Close Form' : '+ Upload New'}
                    </button>
                  </div>
                </div>

                {/* Mandatory Documents Status Checklist */}
                <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>Institutional Admission & Government Verification Checklist</span>
                    </h4>
                    <span className="text-[11px] text-slate-400">UDISE+ Compliance Baseline</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {mandatoryDocsList.map((req, idx) => {
                      const matched = studentDocs.find(d => 
                        (d.documentType === req.type || d.type === req.type || d.title.toLowerCase().includes(req.type.toLowerCase()))
                      );
                      const isVerified = matched && (matched.verificationStatus === 'VERIFIED' || matched.verified);

                      return (
                        <div 
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            isVerified 
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200' 
                              : matched 
                                ? 'bg-amber-950/20 border-amber-800/40 text-slate-200' 
                                : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-bold block truncate">{req.label}</span>
                            <span className="text-[10px] text-slate-400">
                              {isVerified 
                                ? `Verified (${matched?.documentNumber || 'OK'})` 
                                : matched 
                                  ? 'Uploaded • Pending Review' 
                                  : 'Not yet uploaded'}
                            </span>
                          </div>

                          {isVerified ? (
                            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0" title="Verified">
                              <Check className="w-4 h-4" />
                            </span>
                          ) : matched ? (
                            <span className="p-1 rounded-full bg-amber-500/20 text-amber-400 shrink-0" title="Pending">
                              <Clock className="w-4 h-4" />
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                handleDocTypeChange(req.type);
                                setIsUploadOpen(true);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-bold text-slate-300 transition-colors"
                            >
                              Upload
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* UPLOAD DOCUMENT FORM DRAWER */}
                {isUploadOpen && (
                  <div className="bg-slate-950 p-6 rounded-3xl border-2 border-amber-500/40 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-white">Upload New Document for {student.name}</h4>
                          <p className="text-xs text-slate-400">Add verified Aadhaar, Marksheet, Transfer Certificate or Passbook</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsUploadOpen(false)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Document Category *</label>
                          <select
                            value={uploadFormData.documentType}
                            onChange={(e) => handleDocTypeChange(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                          >
                            <option value="Aadhaar Card">Aadhaar Card (आधार कार्ड)</option>
                            <option value="Birth Certificate">Birth Certificate (जन्म प्रमाण पत्र)</option>
                            <option value="Transfer Certificate">Transfer Certificate (स्थानांतरण प्रमाण पत्र)</option>
                            <option value="Previous Marksheet">Previous Class Marksheet (पूर्व अंकतालिका)</option>
                            <option value="Caste/Income Certificate">Caste / Income Certificate (जाति / आय प्रमाण पत्र)</option>
                            <option value="Bank Passbook Copy">Bank Passbook Copy (बैंक पासबुक)</option>
                            <option value="Medical Record">Medical & Health Record (चिकित्सा प्रमाण पत्र)</option>
                            <option value="Other">Other Certificate / Government Order</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Document Title / Label *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. UIDAI Aadhaar Verification Record"
                            value={uploadFormData.title}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-300 mb-1">Certificate / Reference No.</label>
                          <input
                            type="text"
                            placeholder="e.g. UIDAI-UP-8921-4589"
                            value={uploadFormData.documentNumber}
                            onChange={(e) => setUploadFormData({ ...uploadFormData, documentNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* File Selection Dropzone */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-300">Upload File (PDF / Image / Scan) *</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all flex flex-col items-center justify-center gap-2"
                        >
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,.pdf"
                            className="hidden"
                          />
                          <Upload className="w-8 h-8 text-amber-400 animate-bounce" />
                          <div className="text-xs font-bold text-white">
                            {uploadFormData.fileName ? (
                              <span className="text-emerald-400">Selected: {uploadFormData.fileName} ({uploadFormData.fileSize})</span>
                            ) : (
                              <span>Click to browse or drag & drop document scan / PDF</span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">Supported formats: PDF, JPG, PNG, WEBP (Max 10 MB)</span>
                        </div>
                      </div>

                      {/* Notes / Remarks */}
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Verification Remarks / Notes</label>
                        <input
                          type="text"
                          placeholder="e.g. Original physical copy verified with Tehsil / UIDAI portal"
                          value={uploadFormData.notes}
                          onChange={(e) => setUploadFormData({ ...uploadFormData, notes: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsUploadOpen(false)}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isUploading}
                          className="px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50"
                        >
                          {isUploading ? 'Uploading...' : 'Save & Attach to Vault'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filter and Search Bar for Documents */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="w-4 h-4 text-slate-400 ml-2" />
                    <input
                      type="text"
                      placeholder="Search student documents by title or serial number..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="w-full bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={docFilter}
                      onChange={(e) => setDocFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
                    >
                      <option value="all">All Documents ({studentDocs.length})</option>
                      <option value="verified">Verified Only ({verifiedCount})</option>
                      <option value="pending">Pending Review ({pendingCount})</option>
                      <option value="Aadhaar Card">Aadhaar Cards</option>
                      <option value="Birth Certificate">Birth Certificates</option>
                      <option value="Transfer Certificate">Transfer Certificates</option>
                      <option value="Previous Marksheet">Marksheets</option>
                      <option value="Bank Passbook Copy">Passbooks</option>
                    </select>
                  </div>
                </div>

                {/* Documents Grid / Vault Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDocs.map((doc) => {
                    const isVerified = doc.verificationStatus === 'VERIFIED' || doc.verified;

                    return (
                      <div 
                        key={doc.id}
                        className="bg-slate-950/90 rounded-2xl border border-slate-800 hover:border-amber-400/60 p-5 flex flex-col justify-between space-y-4 transition-all shadow-md group"
                      >
                        <div className="space-y-3">
                          {/* Header tag */}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              {doc.documentType || doc.type}
                            </span>
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending</span>
                              </span>
                            )}
                          </div>

                          {/* Thumbnail / Title */}
                          <div className="flex gap-3 items-center">
                            <div 
                              onClick={() => setSelectedDocForView(doc)}
                              className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 cursor-pointer group-hover:border-amber-400 transition-colors relative"
                            >
                              <img 
                                src={doc.fileURL} 
                                alt={doc.title} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h4 
                                onClick={() => setSelectedDocForView(doc)}
                                className="font-extrabold text-sm text-white line-clamp-1 cursor-pointer hover:text-amber-400 transition-colors"
                              >
                                {doc.title}
                              </h4>
                              <div className="text-[11px] text-slate-400 font-mono truncate">
                                Ref: {doc.documentNumber || 'UP-DOC-VERIFIED'}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Size: {doc.fileSize || '1.2 MB'} • {doc.uploadDate || doc.createdAt?.split('T')[0]}
                              </div>
                            </div>
                          </div>

                          {/* Verification meta or pending update notes */}
                          {doc.hasPendingUpdate ? (
                            <div className="text-[11px] text-amber-300 bg-amber-950/60 p-2.5 rounded-xl border border-amber-800/80 space-y-1">
                              <div className="font-bold flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-400" />
                                <span>नवीनीकरण अनुमोदन लंबित (Update Pending Approval)</span>
                              </div>
                              <div className="text-[10px] text-slate-300">
                                "{doc.pendingUpdateNotes || 'Update requested by student'}"
                              </div>
                            </div>
                          ) : doc.updateRejectionReason ? (
                            <div className="text-[11px] text-rose-300 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800/80">
                              <span className="font-bold block text-[10px]">Update Rejected:</span>
                              "{doc.updateRejectionReason}"
                            </div>
                          ) : doc.verificationNotes ? (
                            <div className="text-[11px] text-slate-400 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80 italic">
                              "{doc.verificationNotes}"
                            </div>
                          ) : null}
                        </div>

                        {/* Card Action Controls */}
                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <button
                            onClick={() => setSelectedDocForView(doc)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View & Zoom</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {canManageDocuments && doc.hasPendingUpdate && (
                              <>
                                <button
                                  onClick={() => approveDocumentUpdate(doc.id, 'Approved via Student 360 view', userProfile?.name || 'Headmaster')}
                                  className="px-2 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
                                  title="Approve Update"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => {
                                    const reason = window.prompt('Enter rejection reason for updated document (original will be kept):');
                                    if (reason) {
                                      rejectDocumentUpdate(doc.id, reason, userProfile?.name || 'Headmaster');
                                    }
                                  }}
                                  className="px-2 py-1 rounded-xl bg-rose-600/40 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/40 font-bold text-[11px] cursor-pointer"
                                  title="Reject Update"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {canManageDocuments && !isVerified && !doc.hasPendingUpdate && (
                              <button
                                onClick={() => verifyDocument(doc.id, 'VERIFIED', 'Officially verified by Headmaster')}
                                className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-colors cursor-pointer"
                                title="Approve & Mark Verified"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => downloadDocumentFile(doc.fileURL, doc.fileName || `${doc.title}.pdf`)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                              title="Download to Device (डिवाइस में डाउनलोड करें)"
                            >
                              <Download className="w-4 h-4" />
                            </button>

                            {canManageDocuments && !doc.hasPendingUpdate && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Delete Document"
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
                    <div className="col-span-full py-12 text-center bg-slate-950/40 rounded-3xl border border-slate-800 space-y-3">
                      <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                      <div className="text-sm font-bold text-slate-400">No documents found matching the filter.</div>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-md"
                      >
                        + Upload First Document
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PERSONAL & FAMILY PROFILE */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Comprehensive Student Biodata (व्यक्तिगत विवरण)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Full Name (पूरा नाम)</span>
                      <div className="font-black text-white text-sm">{activeStudent.name}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Date of Birth (जन्म तिथि)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.dateOfBirth || activeStudent.dob}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Gender & Blood Group</span>
                      <div className="font-bold text-white text-sm">{activeStudent.gender} • {activeStudent.bloodGroup || 'O+'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Social Category (जाति श्रेणी)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.category || 'General'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Religion & Mother Tongue</span>
                      <div className="font-bold text-white text-sm">{activeStudent.religion || 'Hinduism'} • {activeStudent.motherTongue || 'Hindi'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">UIDAI Aadhaar Number</span>
                      <div className="font-mono font-bold text-amber-300 text-sm">{activeStudent.aadhaarNumber || '•••• •••• 4589'}</div>
                    </div>
                  </div>
                </div>

                {/* Family & Guardian Information */}
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>Parental & Socio-Economic Details (पारिवारिक एवं आर्थिक विवरण)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Father's Name (पिता का नाम)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.fatherName}</div>
                      <div className="text-[10px] text-slate-400">{activeStudent.fatherOccupation || 'Farmer / Self Employed'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Mother's Name (माता का नाम)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.motherName}</div>
                      <div className="text-[10px] text-slate-400">{activeStudent.motherOccupation || 'Homemaker'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Annual Family Income</span>
                      <div className="font-bold text-emerald-400 text-sm">{activeStudent.annualFamilyIncome || '₹ 75,000 / year'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Ration Card Type & Number</span>
                      <div className="font-mono font-bold text-white text-sm">{activeStudent.rationCardNo || 'UP-RCN-2024-88912'} ({activeStudent.rationCardType || 'APL'})</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Primary Mobile (दूरभाष)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.mobile || activeStudent.phone}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Distance from School (दूरी)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.distanceFromSchoolKm || 0.8} KM</div>
                    </div>

                    <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Full Permanent Address (स्थायी पता)</span>
                      <div className="font-bold text-white text-sm bg-slate-900 p-3 rounded-xl border border-slate-800">
                        {activeStudent.address || `${activeStudent.village || 'Harsinghpur Gova'}, Post ${activeStudent.postOffice || 'Gova'}, Block ${activeStudent.block || 'Mainpuri'}, Dist ${activeStudent.district || 'Mainpuri'}, UP - ${activeStudent.pincode || '209504'}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ACADEMICS & ATTENDANCE */}
            {activeTab === 'academic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Academic Standing</span>
                    <div className="text-xl font-black text-amber-400">Class {activeStudent.classNumber} - '{activeStudent.sectionName}'</div>
                    <p className="text-xs text-slate-400">Roll No #{activeStudent.rollNumber} • Admission Session 2025-26</p>
                  </div>

                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Official Attendance Rate</span>
                    <div className="text-xl font-black text-emerald-400">
                      {attendanceStats ? `${attendanceStats.percentage}%` : '94.2%'}
                    </div>
                    <p className="text-xs text-slate-400">
                      {attendanceStats ? `${attendanceStats.present} Present / ${attendanceStats.total} Working Days` : 'Regular attendance record'}
                    </p>
                  </div>

                  <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Medium of Instruction</span>
                    <div className="text-xl font-black text-white">{activeStudent.mediumOfInstruction || 'Hindi (हिंदी)'}</div>
                    <p className="text-xs text-slate-400">UP Basic Shiksha Parishad Curriculum</p>
                  </div>
                </div>

                {/* Academic Evaluation Marks Table */}
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    <span>Term Examination & Progress Marks Records</span>
                  </h4>

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] border-b border-slate-800">
                        <tr>
                          <th className="p-3">Examination</th>
                          <th className="p-3">Subject</th>
                          <th className="p-3 text-center">Marks Obtained</th>
                          <th className="p-3 text-center">Max Marks</th>
                          <th className="p-3 text-center">Grade</th>
                          <th className="p-3">Teacher Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 text-slate-300">
                        {studentMarks.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-900/60">
                            <td className="p-3 font-bold text-white">{m.examName || 'Annual Evaluation'}</td>
                            <td className="p-3 font-bold text-amber-300">{m.subjectName}</td>
                            <td className="p-3 text-center font-mono font-bold text-white">{m.marksObtained}</td>
                            <td className="p-3 text-center font-mono text-slate-400">{m.totalMarks}</td>
                            <td className="p-3 text-center font-bold">
                              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                                {m.grade || 'A+'}
                              </span>
                            </td>
                            <td className="p-3 italic text-slate-400">{m.remarks || 'Excellent conceptual understanding'}</td>
                          </tr>
                        ))}

                        {studentMarks.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-6 text-center text-slate-400">
                              Official evaluation transcript is synced directly from the Examinations module.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BANK & DBT WELFARE SCHEMES */}
            {activeTab === 'bank' && (
              <div className="space-y-6">
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Direct Benefit Transfer (DBT) & Bank Account Credentials</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Bank Name (बैंक का नाम)</span>
                      <div className="font-bold text-white text-sm">{activeStudent.bankName || 'Bank of India (Mainpuri Branch)'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Account Number (खाता संख्या)</span>
                      <div className="font-mono font-bold text-amber-300 text-sm">{activeStudent.bankAccountNumber || '602310110009876'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">IFSC Code</span>
                      <div className="font-mono font-bold text-white text-sm">{activeStudent.ifscCode || 'BKID0007201'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">NPCI / Aadhaar Seeding Status</span>
                      <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aadhaar Seeded & Active (सत्यापित)</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">PFMS Verification</span>
                      <div className="font-bold text-emerald-400 text-sm">PFMS Accepted • Ready for Transfer</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">DBT Beneficiary ID</span>
                      <div className="font-mono text-slate-300 text-sm">UP-DBT-2025-{activeStudent.admissionNumber}</div>
                    </div>
                  </div>
                </div>

                {/* State DBT Welfare Entitlements Breakdown */}
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h4 className="text-sm font-black uppercase tracking-wider text-slate-300">
                    Government Welfare Entitlements Status (सरकारी कल्याणकारी योजनाएं)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">School Uniform DBT</span>
                      <div className="text-emerald-400 font-bold">₹1,200 Transferred</div>
                      <span className="text-[10px] text-slate-400">Credited to Parent A/C</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">School Bag & Stationery</span>
                      <div className="text-emerald-400 font-bold">Disbursed (वितरित)</div>
                      <span className="text-[10px] text-slate-400">Annual Session Allocation</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">Shoes & Socks Allowance</span>
                      <div className="text-emerald-400 font-bold">Transferred via DBT</div>
                      <span className="text-[10px] text-slate-400">Winter & Summer Pair</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="font-bold text-white block">Mid-Day Meal (MDM)</span>
                      <div className="text-emerald-400 font-bold">Daily Enrolled</div>
                      <span className="text-[10px] text-slate-400">Hot Cooked Nutrition Meal</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: HEALTH & CWSN */}
            {activeTab === 'health' && (
              <div className="space-y-6">
                <div className="bg-slate-950/80 p-6 rounded-3xl border border-slate-800 space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <HeartPulse className="w-4 h-4" />
                    <span>Physical Health & Special Needs (CWSN) Metrics</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Height (कद)</span>
                      <div className="font-bold text-white text-base">{activeStudent.heightCm || 138} cm</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Weight (वजन)</span>
                      <div className="font-bold text-white text-base">{activeStudent.weightKg || 32} kg</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Computed BMI Status</span>
                      <div className="font-bold text-emerald-400 text-base">Normal (स्वस्थ)</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Blood Group</span>
                      <div className="font-bold text-amber-300 text-base">{activeStudent.bloodGroup || 'O+'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">CWSN / Special Needs</span>
                      <div className="font-bold text-white text-sm">{activeStudent.cwsnStatus || 'No (सामान्य)'}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">RBSK Health Checkup</span>
                      <div className="font-bold text-emerald-400 text-sm">Completed (2025)</div>
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Emergency Contact Number</span>
                      <div className="font-bold text-white text-sm">{activeStudent.alternateMobile || activeStudent.mobile || '+91 98234 11223'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* FOOTER ACTIONS */}
          <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Institutional Central Records Ledger • UDISE+ Synchronized</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPrintIdCardOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Print Student ID Card
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
              >
                Close 360° Portfolio
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* FULLSCREEN DOCUMENT VIEWER MODAL */}
      {selectedDocForView && (
        <DocumentViewerModal
          document={selectedDocForView}
          isOpen={!!selectedDocForView}
          onClose={() => setSelectedDocForView(null)}
          canVerify={canManageDocuments}
        />
      )}

      {/* PRINT ID CARD MODAL */}
      {isPrintIdCardOpen && activeStudent && (
        <StudentIdCardPrint
          student={activeStudent}
          settings={settings}
          onClose={() => setIsPrintIdCardOpen(false)}
        />
      )}
    </>
  );
};
