import React, { useState, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { StudentDocument, Student } from '../../types';
import { 
  FileText, 
  Plus, 
  Search, 
  ShieldCheck, 
  Download, 
  Trash2, 
  CheckCircle2, 
  User, 
  Eye, 
  Clock, 
  Upload, 
  Filter, 
  Users, 
  Layers, 
  ArrowUpRight,
  X,
  FileCheck,
  RefreshCw,
  XCircle,
  AlertTriangle,
  ArrowRightLeft,
  FolderDown,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { Student360Modal } from '../common/Student360Modal';
import { downloadDocumentFile } from '../../utils/fileDownloader';

export const AdminDocuments: React.FC = () => {
  const { 
    documents, 
    students, 
    addDocument, 
    deleteDocument, 
    verifyDocument, 
    approveDocumentUpdate, 
    rejectDocumentUpdate,
    language 
  } = useSchool();
  const { userProfile } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<StudentDocument | null>(null);
  const [studentFor360, setStudentFor360] = useState<Student | null>(null);

  // Reject / Note Prompt Modal
  const [rejectionTargetDoc, setRejectionTargetDoc] = useState<StudentDocument | null>(null);
  const [rejectionTargetType, setRejectionTargetType] = useState<'update' | 'initial'>('update');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Upload Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    studentId: students[0]?.id || '',
    title: '',
    documentType: 'Aadhaar Card' as any,
    documentNumber: '',
    fileURL: '',
    fileName: '',
    fileSize: '',
    fileType: 'application/pdf',
    notes: ''
  });
  const [isUploading, setIsUploading] = useState(false);

  // Filtered documents
  const filteredDocs = documents.filter(d => {
    const matchesSearch = 
      !searchTerm ||
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.documentType || d.type || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.documentNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStudent = 
      selectedStudentFilter === 'all' || d.studentId === selectedStudentFilter;

    const matchesCategory = 
      selectedCategoryFilter === 'all' || 
      d.documentType === selectedCategoryFilter || 
      d.type === selectedCategoryFilter;

    const isVerified = (d.verificationStatus === 'VERIFIED' || d.verified) && !d.hasPendingUpdate;
    const hasPendingUpdate = Boolean(d.hasPendingUpdate && d.pendingUpdateUrl);
    const isPendingInitial = d.verificationStatus !== 'VERIFIED' && !d.verified && !hasPendingUpdate;

    const matchesStatus = 
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'verified' && isVerified) ||
      (selectedStatusFilter === 'pending' && isPendingInitial) ||
      (selectedStatusFilter === 'updates' && hasPendingUpdate);

    return matchesSearch && matchesStudent && matchesCategory && matchesStatus;
  });

  const verifiedCount = documents.filter(d => (d.verificationStatus === 'VERIFIED' || d.verified) && !d.hasPendingUpdate).length;
  const pendingUpdates = documents.filter(d => d.hasPendingUpdate && d.pendingUpdateUrl);
  const pendingInitialCount = documents.filter(d => d.verificationStatus !== 'VERIFIED' && !d.verified && !d.hasPendingUpdate).length;

  const handleOpenAdd = () => {
    const firstStudent = students[0];
    setFormData({
      studentId: firstStudent?.id || '',
      title: firstStudent ? `Aadhaar Card - ${firstStudent.name}` : 'Aadhaar Card Copy',
      documentType: 'Aadhaar Card',
      documentNumber: '',
      fileURL: '',
      fileName: '',
      fileSize: '',
      fileType: 'image/jpeg',
      notes: 'Physical document verified by Headmaster'
    });
    setIsAddModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const sizeStr = file.size > 1024 * 1024 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const student = students.find(s => s.id === formData.studentId);
      setFormData(prev => ({
        ...prev,
        fileURL: base64,
        fileName: file.name,
        fileSize: sizeStr,
        fileType: file.type || 'application/pdf',
        title: prev.title || `${prev.documentType} - ${student?.name || 'Student'}`
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleStudentSelectInForm = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    setFormData(prev => ({
      ...prev,
      studentId,
      title: `${prev.documentType} - ${student?.name || 'Student'}`
    }));
  };

  const handleDocTypeSelectInForm = (docType: string) => {
    const student = students.find(s => s.id === formData.studentId);
    setFormData(prev => ({
      ...prev,
      documentType: docType as any,
      title: `${docType} - ${student?.name || 'Student'}`
    }));
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === formData.studentId);
    if (!student) {
      alert('Please select a student.');
      return;
    }

    if (!formData.fileURL) {
      alert('Please select a file / document image to upload.');
      return;
    }

    setIsUploading(true);
    try {
      await addDocument({
        studentId: student.id,
        studentName: student.name,
        title: formData.title,
        documentType: formData.documentType,
        documentNumber: formData.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
        fileURL: formData.fileURL,
        fileName: formData.fileName || `${formData.documentType.replace(/\s+/g, '_')}.pdf`,
        fileSize: formData.fileSize || '1.2 MB',
        fileType: formData.fileType || 'application/pdf',
        uploadedBy: userProfile?.uid || 'admin_user',
        uploadedByName: userProfile?.name || 'School Headmaster',
        uploaderRole: 'admin',
        verificationStatus: 'VERIFIED',
        verifiedBy: userProfile?.name || 'School Headmaster',
        verifiedAt: new Date().toISOString(),
        verificationNotes: formData.notes || 'Officially verified and approved by School Headmaster',
        uploadDate: new Date().toISOString().split('T')[0],
        type: formData.documentType,
        verified: true
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error saving document:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Approve Staged Update
  const handleApproveUpdate = async (doc: StudentDocument) => {
    if (window.confirm(`Are you sure you want to approve the updated document for "${doc.title}"? The new file will become the active verified record.`)) {
      await approveDocumentUpdate(
        doc.id, 
        'Updated copy verified against institutional records and approved.', 
        userProfile?.name || 'School Headmaster'
      );
    }
  };

  // Open Rejection Dialog
  const handleOpenRejectModal = (doc: StudentDocument, type: 'update' | 'initial') => {
    setRejectionTargetDoc(doc);
    setRejectionTargetType(type);
    setRejectionReasonInput(
      type === 'update' 
        ? 'Updated copy is illegible / incorrect. Retaining previously verified original document.' 
        : 'Uploaded document is unclear / requires re-submission.'
    );
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!rejectionTargetDoc) return;
    if (rejectionTargetType === 'update') {
      await rejectDocumentUpdate(
        rejectionTargetDoc.id, 
        rejectionReasonInput || 'Document update rejected. Original record preserved.', 
        userProfile?.name || 'School Headmaster'
      );
    } else {
      await verifyDocument(
        rejectionTargetDoc.id, 
        'REJECTED', 
        rejectionReasonInput, 
        userProfile?.name || 'School Headmaster'
      );
    }
    setRejectionTargetDoc(null);
  };

  // Download all docs for a single student
  const handleDownloadAllStudentDocs = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const sDocs = documents.filter(d => d.studentId === studentId || d.studentName === student?.name);
    if (sDocs.length === 0) {
      alert('No documents found for this student.');
      return;
    }
    sDocs.forEach((doc, idx) => {
      setTimeout(() => {
        downloadDocumentFile(doc.fileURL, `${student?.name || 'student'}_${doc.documentType || 'doc'}_${idx + 1}.pdf`);
      }, idx * 300);
    });
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      await deleteDocument(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Institutional Student Document Archive & 360° Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized digital vault of Birth Certificates, UIDAI Aadhaar, Transfer Certificates, Marksheets & Bank Passbooks
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Student Document</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{documents.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Total Documents in Vault</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{verifiedCount}</div>
            <div className="text-xs text-slate-500 font-semibold">Verified Documents</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <RefreshCw className={`w-6 h-6 ${pendingUpdates.length > 0 ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{pendingUpdates.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Pending Update Approvals</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-600">{students.length}</div>
            <div className="text-xs text-slate-500 font-semibold">Enrolled Student Profiles</div>
          </div>
        </div>
      </div>

      {/* PENDING UPDATES ALERT SECTION (IF ANY) */}
      {pendingUpdates.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 p-5 rounded-3xl border-2 border-amber-400 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  छात्र दस्तावेज़ नवीनीकरण अनुमोदन लंबित ({pendingUpdates.length} Document Update Requests)
                </h3>
                <p className="text-xs text-slate-600">
                  छात्रों द्वारा नए दस्तावेज़ अपलोड किए गए हैं। अनुमोदन करने पर नया दस्तावेज़ लागू होगा, अस्वीकार करने पर पूर्व स्वीकृत दस्तावेज़ सुरक्षित रहेगा।
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedStatusFilter('updates')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs self-start sm:self-auto cursor-pointer"
            >
              Filter Update Requests
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingUpdates.map(doc => (
              <div key={doc.id} className="bg-white p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                    {doc.documentType}
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Req: {doc.pendingUpdateDate}
                  </span>
                </div>

                <div className="flex gap-3 items-center">
                  <div 
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="w-12 h-12 rounded-xl bg-slate-100 border border-amber-300 overflow-hidden shrink-0 cursor-pointer relative group"
                  >
                    <img src={doc.pendingUpdateUrl} alt="Pending Update" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs text-slate-900 truncate">{doc.studentName}</div>
                    <div className="text-[11px] text-slate-500 truncate">{doc.title}</div>
                    <div className="text-[10px] text-amber-700 font-mono mt-0.5 truncate">
                      "{doc.pendingUpdateNotes || 'Update requested'}"
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDocForViewer(doc)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                      title="Inspect & Compare"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => downloadDocumentFile(doc.pendingUpdateUrl!, doc.pendingUpdateFileName || 'updated_doc.pdf')}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                      title="Download Proposed File to Device"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleApproveUpdate(doc)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer"
                      title="Approve and make active"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleOpenRejectModal(doc, 'update')}
                      className="px-2 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white text-xs font-bold border border-rose-200 cursor-pointer"
                      title="Reject update and preserve original"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, student, ref no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Student Filter */}
          <div>
            <select
              value={selectedStudentFilter}
              onChange={(e) => setSelectedStudentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Students ({students.length})</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Class {s.classNumber}-{s.sectionName}, Roll #{s.rollNumber})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Document Categories</option>
              <option value="Aadhaar Card">Aadhaar Card (आधार कार्ड)</option>
              <option value="Birth Certificate">Birth Certificate (जन्म प्रमाण पत्र)</option>
              <option value="Transfer Certificate">Transfer Certificate (TC)</option>
              <option value="Previous Marksheet">Previous Class Marksheet</option>
              <option value="Caste/Income Certificate">Caste / Category Certificate</option>
              <option value="Bank Passbook Copy">Bank Passbook Copy</option>
              <option value="Medical Record">Medical Record</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            >
              <option value="all">All Statuses ({documents.length})</option>
              <option value="verified">Verified Only ({verifiedCount})</option>
              <option value="updates">Pending Update Approvals ({pendingUpdates.length})</option>
              <option value="pending">Pending Initial Review ({pendingInitialCount})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Student 360° Quick Launch Grid */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-5 rounded-3xl text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-black tracking-tight text-white">
              Open Student 360° Profile & Download Complete Dossier (एक क्लिक 360° व्यू)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click any student to view or download all attached records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 pt-1">
          {students.map((st) => {
            const stDocs = documents.filter(d => d.studentId === st.id || d.studentName === st.name);
            const stVerified = stDocs.filter(d => (d.verificationStatus === 'VERIFIED' || d.verified) && !d.hasPendingUpdate).length;

            return (
              <div
                key={st.id}
                className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 text-left transition-all group flex flex-col justify-between"
              >
                <div 
                  onClick={() => setStudentFor360(st)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 overflow-hidden border border-slate-600 shrink-0">
                    {st.photoURL ? (
                      <img src={st.photoURL} alt={st.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xs text-amber-400">
                        {st.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-white truncate group-hover:text-amber-300">
                      {st.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      Class {st.classNumber}-{st.sectionName}
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{stDocs.length} Docs</span>
                  <div className="flex items-center gap-1">
                    {stDocs.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAllStudentDocs(st.id);
                        }}
                        className="p-1 rounded bg-slate-700 hover:bg-amber-500 text-slate-300 hover:text-slate-950 transition-colors"
                        title="Download all documents of this student to device"
                      >
                        <FolderDown className="w-3 h-3" />
                      </button>
                    )}
                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> {stVerified}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const isVerified = (doc.verificationStatus === 'VERIFIED' || doc.verified) && !doc.hasPendingUpdate;
          const associatedStudent = students.find(s => s.id === doc.studentId || s.name === doc.studentName);
          const hasUpdate = Boolean(doc.hasPendingUpdate && doc.pendingUpdateUrl);

          return (
            <div 
              key={doc.id} 
              className={`bg-white p-5 rounded-2xl border shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group ${
                hasUpdate ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-slate-200 hover:border-amber-400'
              }`}
            >
              <div className="space-y-3">
                {/* Header Tag & Verification */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                    {doc.documentType || doc.type}
                  </span>

                  {hasUpdate ? (
                    <span className="flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300 animate-pulse">
                      <RefreshCw className="w-3 h-3 text-amber-700" />
                      <span>Update Pending Approval</span>
                    </span>
                  ) : isVerified ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Verified</span>
                    </span>
                  ) : doc.verificationStatus === 'REJECTED' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>Rejected</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Verification</span>
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
                      src={hasUpdate ? doc.pendingUpdateUrl : doc.fileURL}
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

                    {/* Student 360 link */}
                    <div 
                      onClick={() => associatedStudent && setStudentFor360(associatedStudent)}
                      className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-amber-700 cursor-pointer mt-0.5 group/st"
                      title="Open full 360 profile of this student"
                    >
                      <User className="w-3.5 h-3.5 text-slate-400 group-hover/st:text-amber-600" />
                      <span className="font-bold underline decoration-slate-300 group-hover/st:decoration-amber-500 truncate">
                        {doc.studentName}
                      </span>
                      <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Ref: {doc.documentNumber || 'UP-DOC-VERIFIED'} • {doc.fileSize || '1.2 MB'}
                    </div>
                  </div>
                </div>

                {/* Staged Update Notes Alert inside card */}
                {hasUpdate && (
                  <div className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-xl border border-amber-200 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600" />
                      <span>छात्र द्वारा प्रस्तुत नया दस्तावेज़ अनुमोदन हेतु लंबित</span>
                    </div>
                    <div className="text-[10px] text-slate-600 italic">
                      "{doc.pendingUpdateNotes || 'Update requested by student'}"
                    </div>
                  </div>
                )}

                {/* Verification notes or previous rejection notes */}
                {doc.updateRejectionReason && !hasUpdate && (
                  <div className="text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 space-y-0.5">
                    <span className="font-bold text-[10px] uppercase block text-rose-950">Update Rejected:</span>
                    <span className="text-[10px]">"{doc.updateRejectionReason}"</span>
                  </div>
                )}

                {doc.verificationNotes && !hasUpdate && !doc.updateRejectionReason && (
                  <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 italic">
                    "{doc.verificationNotes}"
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedDocForViewer(doc)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 font-bold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1">
                  {/* Approve / Reject buttons for Pending Update */}
                  {hasUpdate ? (
                    <>
                      <button
                        onClick={() => handleApproveUpdate(doc)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Approve update and replace active record"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleOpenRejectModal(doc, 'update')}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 cursor-pointer"
                        title="Reject update (original stays active)"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : !isVerified && (
                    <button
                      onClick={() => verifyDocument(doc.id, 'VERIFIED', 'Officially verified by Headmaster')}
                      className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-colors cursor-pointer"
                      title="Approve / Mark Verified"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Universal Device Download Button */}
                  <button
                    onClick={() => downloadDocumentFile(doc.fileURL, doc.fileName || `${doc.title}.pdf`)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Download Active Document to Device (डिवाइस में डाउनलोड करें)"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteDoc(doc.id, doc.title)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-600">No documents found matching the filter criteria.</div>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shadow-sm cursor-pointer"
            >
              + Upload New Document
            </button>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Attach Document to Student Record (दस्तावेज़ संलग्न करें)"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => handleStudentSelectInForm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (Class {s.classNumber}-{s.sectionName}, Roll #{s.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Category *</label>
              <select
                value={formData.documentType}
                onChange={(e) => handleDocTypeSelectInForm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              >
                <option value="Aadhaar Card">Aadhaar Card (आधार कार्ड)</option>
                <option value="Birth Certificate">Birth Certificate (जन्म प्रमाण पत्र)</option>
                <option value="Transfer Certificate">Transfer Certificate (TC)</option>
                <option value="Previous Marksheet">Previous School Marksheet</option>
                <option value="Caste/Income Certificate">Caste / Category Certificate</option>
                <option value="Bank Passbook Copy">Bank Passbook Copy</option>
                <option value="Medical Record">Medical Record</option>
                <option value="Other">Other Certificate</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document Title / Label *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Document / Reference Number</label>
              <input
                type="text"
                placeholder="e.g. UIDAI-UP-8921-4589"
                value={formData.documentNumber}
                onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document File (Scan / Image / PDF) *</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/20 transition-all flex flex-col items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
              />
              <Upload className="w-6 h-6 text-amber-500" />
              <div className="text-xs font-bold text-slate-800">
                {formData.fileName ? (
                  <span className="text-emerald-700">✓ {formData.fileName} ({formData.fileSize})</span>
                ) : (
                  <span>Click to select file or drag & drop</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Verification Remarks / Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Physical document verified against tehsil record"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? 'Uploading...' : 'Save & Attach Document'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Reason Prompt Modal */}
      {rejectionTargetDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>{rejectionTargetType === 'update' ? 'Reject Document Update' : 'Reject Uploaded Document'}</span>
              </div>
              <button onClick={() => setRejectionTargetDoc(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="text-xs text-slate-600">
              {rejectionTargetType === 'update' ? (
                <p>
                  छात्र <strong>{rejectionTargetDoc.studentName}</strong> द्वारा प्रस्तुत नया दस्तावेज़ अस्वीकार किया जा रहा है। 
                  <strong className="text-emerald-700 block mt-1">✓ पूर्व में स्वीकृत मूल दस्तावेज़ सुरक्षित व सक्रिय बना रहेगा।</strong>
                </p>
              ) : (
                <p>छात्र <strong>{rejectionTargetDoc.studentName}</strong> का दस्तावेज़ अस्वीकार किया जा रहा है।</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">अस्वीकृति का कारण (Reason for Rejection) *</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                rows={3}
                placeholder="उदा. दस्तावेज़ धुंधला है या मुहर स्पष्ट नहीं है..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectionTargetDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {selectedDocForViewer && (
        <DocumentViewerModal
          document={selectedDocForViewer}
          isOpen={!!selectedDocForViewer}
          onClose={() => setSelectedDocForViewer(null)}
          canVerify={true}
        />
      )}

      {/* Student 360 Modal */}
      {studentFor360 && (
        <Student360Modal
          student={studentFor360}
          isOpen={!!studentFor360}
          onClose={() => setStudentFor360(null)}
          canManageDocuments={true}
        />
      )}
    </div>
  );
};
