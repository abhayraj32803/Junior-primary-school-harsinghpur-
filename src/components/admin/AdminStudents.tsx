import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Student, StudentStatus, RegistrationRequest } from '../../types';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX, 
  Printer, 
  Eye, 
  GraduationCap, 
  Phone, 
  MapPin, 
  FileText, 
  Calendar,
  CheckCircle2, 
  AlertCircle, 
  Download,
  Clock,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Layers,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { StudentIdCardPrint } from '../common/StudentIdCardPrint';
import { Student360Modal } from '../common/Student360Modal';
import { AdminBulkPromotion } from './AdminBulkPromotion';

export const AdminStudents: React.FC = () => {
  const { 
    students, 
    classes, 
    sections, 
    addStudent, 
    updateStudent, 
    deactivateStudent, 
    activateStudent, 
    getStudentAttendanceStats,
    marks,
    documents,
    settings,
    language 
  } = useSchool();

  const {
    registrationRequests,
    approveRegistrationRequest,
    rejectRegistrationRequest
  } = useAuth();

  // Active Main Tab: 'enrolled' | 'requests' | 'history' | 'promotion'
  const [activeMainTab, setActiveMainTab] = useState<'enrolled' | 'requests' | 'history' | 'promotion'>('enrolled');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [requestFilter, setRequestFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<RegistrationRequest | null>(null);
  const [printIdCardStudent, setPrintIdCardStudent] = useState<Student | null>(null);

  // Rejection Dialog State
  const [rejectModalReq, setRejectModalReq] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Admission records could not be verified with government master register.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Form state for Add/Edit
  const [formData, setFormData] = useState({
    name: '',
    admissionNumber: '',
    dateOfBirth: '2015-01-01',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    classNumber: 1,
    sectionName: 'A',
    rollNumber: '',
    fatherName: '',
    motherName: '',
    guardianName: '',
    mobile: '',
    address: '',
    bloodGroup: 'O+',
    category: 'General' as 'General' | 'OBC' | 'SC' | 'ST' | 'EWS',
    photoURL: ''
  });

  // Student Requests only
  const studentRequests = useMemo(() => {
    return registrationRequests.filter(r => r.requestedRole === 'student');
  }, [registrationRequests]);

  const pendingStudentRequests = useMemo(() => {
    return studentRequests.filter(r => r.status === 'PENDING');
  }, [studentRequests]);

  const approvedStudentRequests = useMemo(() => {
    return studentRequests.filter(r => r.status === 'APPROVED');
  }, [studentRequests]);

  // Filter enrolled students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        student.name.toLowerCase().includes(term) ||
        student.studentId.toLowerCase().includes(term) ||
        student.admissionNumber.toLowerCase().includes(term) ||
        student.rollNumber.toLowerCase().includes(term) ||
        student.fatherName.toLowerCase().includes(term) ||
        student.mobile.toLowerCase().includes(term);

      const matchesClass = selectedClass === 'all' || student.classId === selectedClass || String(student.classNumber) === selectedClass.replace('class-', '');
      const matchesSection = selectedSection === 'all' || student.sectionName === selectedSection;
      const matchesStatus = selectedStatus === 'all' || student.status === selectedStatus;

      return matchesSearch && matchesClass && matchesSection && matchesStatus;
    });
  }, [students, searchTerm, selectedClass, selectedSection, selectedStatus]);

  // Filter student registration requests
  const filteredRequests = useMemo(() => {
    return studentRequests.filter(req => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        req.fullName.toLowerCase().includes(term) ||
        req.preferredUsername.toLowerCase().includes(term) ||
        (req.admissionNumber && req.admissionNumber.toLowerCase().includes(term)) ||
        (req.fatherName && req.fatherName.toLowerCase().includes(term)) ||
        (req.phone && req.phone.toLowerCase().includes(term));

      const matchesStatus = 
        activeMainTab === 'requests' 
          ? (requestFilter === 'all' ? true : req.status === requestFilter)
          : (activeMainTab === 'history' ? req.status !== 'PENDING' : true);

      const matchesClass = 
        selectedClass === 'all' || 
        String(req.classNumber) === selectedClass.replace('class-', '');

      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [studentRequests, searchTerm, requestFilter, activeMainTab, selectedClass]);

  // Convert RegistrationRequest to a Student object for 360 view
  const mapRequestToStudent = (req: RegistrationRequest): Student => {
    const existing = students.find(s => 
      (req.admissionNumber && s.admissionNumber.toLowerCase() === req.admissionNumber.toLowerCase()) ||
      (s.name.toLowerCase() === req.fullName.toLowerCase() && s.classNumber === (req.classNumber || 1))
    );

    if (existing) return existing;

    const classNum = req.classNumber || 1;
    const secName = req.sectionName || 'A';

    return {
      id: `temp-req-${req.id}`,
      studentId: req.preferredUsername || `STU-REQ-${req.id.slice(-4)}`,
      name: req.fullName,
      admissionNumber: req.admissionNumber || `ADM-${new Date().getFullYear()}-${req.id.slice(-3)}`,
      registrationNumber: `SRN-${new Date().getFullYear()}-${String(classNum).padStart(2, '0')}${req.id.slice(-3)}`,
      dateOfBirth: req.dateOfBirth || '2015-05-15',
      dob: req.dateOfBirth || '2015-05-15',
      gender: 'Male',
      classId: `class-${classNum}`,
      classNumber: classNum,
      sectionId: `sec-${classNum}-${secName}`,
      sectionName: secName,
      rollNumber: String(students.filter(s => s.classNumber === classNum).length + 1).padStart(2, '0'),
      fatherName: req.fatherName || 'Parent / Guardian',
      motherName: 'Mother',
      guardianName: req.guardianName || req.fatherName,
      mobile: req.phone || '+91 9876543210',
      phone: req.phone || '',
      email: req.email,
      address: 'Primary School Zone, Rampur, Uttar Pradesh',
      village: settings.village || 'Village Area',
      block: settings.block || 'Local Block',
      district: settings.district || 'Rampur',
      admissionDate: req.createdAt ? req.createdAt.split('T')[0] : new Date().toISOString().split('T')[0],
      category: (req.category as any) || 'General',
      status: req.status === 'APPROVED' ? 'active' : 'inactive',
      photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      createdAt: req.createdAt || new Date().toISOString()
    };
  };

  // Open 360° Profile directly from a request
  const handleViewRequestProfile = (req: RegistrationRequest) => {
    const studentObj = mapRequestToStudent(req);
    setSelectedStudent(studentObj);
    setSelectedPendingRequest(req);
    setIsProfileModalOpen(true);
  };

  // Approve student request & automatically ensure Student record exists
  const handleApproveStudent = async (requestId: string) => {
    const req = studentRequests.find(r => r.id === requestId);
    if (!req) return;

    setIsProcessingApproval(true);
    setActionSuccessMsg(null);

    try {
      // 1. Approve user registration request
      const res = await approveRegistrationRequest(requestId);

      if (res.success) {
        // 2. Ensure student exists in students register
        const existingStudent = students.find(s => 
          (req.admissionNumber && s.admissionNumber.toLowerCase() === req.admissionNumber.toLowerCase()) ||
          (s.name.toLowerCase() === req.fullName.toLowerCase() && s.classNumber === (req.classNumber || 1))
        );

        if (!existingStudent) {
          const classNum = req.classNumber || 1;
          const secName = req.sectionName || 'A';
          const classId = `class-${classNum}`;
          const sectionId = `sec-${classNum}-${secName}`;
          const studentId = req.preferredUsername || `UPS-${new Date().getFullYear()}-${String(classNum).padStart(2, '0')}${String(students.length + 1).padStart(2, '0')}`;

          await addStudent({
            studentId,
            admissionNumber: req.admissionNumber || `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            registrationNumber: `SRN-${new Date().getFullYear()}-${String(classNum).padStart(2, '0')}${String(students.length + 1).padStart(2, '0')}`,
            name: req.fullName,
            dateOfBirth: req.dateOfBirth || '2015-01-01',
            dob: req.dateOfBirth || '2015-01-01',
            gender: 'Male',
            classId,
            classNumber: classNum,
            sectionId,
            sectionName: secName,
            rollNumber: String(students.filter(s => s.classNumber === classNum).length + 1).padStart(2, '0'),
            fatherName: req.fatherName || 'Parent / Guardian',
            motherName: 'Mother',
            guardianName: req.guardianName || req.fatherName || '',
            mobile: req.phone || '+91 9800000000',
            phone: req.phone || '',
            email: req.email,
            address: 'School Village, Rampur',
            village: settings.village,
            block: settings.block,
            district: settings.district,
            admissionDate: new Date().toISOString().split('T')[0],
            category: (req.category as any) || 'General',
            status: 'active',
            photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
          });
        }

        setActionSuccessMsg(
          language === 'hi'
            ? `छात्र "${req.fullName}" का आवेदन सफलतापूर्वक स्वीकृत कर नामांकित कर दिया गया है। (लॉगिन आईडी: ${req.preferredUsername})`
            : `Student "${req.fullName}" approved & enrolled successfully. Official Login ID: ${req.preferredUsername}`
        );

        if (isProfileModalOpen && selectedPendingRequest?.id === requestId) {
          const updatedStudent = mapRequestToStudent({ ...req, status: 'APPROVED' });
          setSelectedStudent(updatedStudent);
          setSelectedPendingRequest({ ...req, status: 'APPROVED' });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Reject student request
  const handleRejectStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    await rejectRegistrationRequest(rejectModalReq.id, rejectionReason);
    setActionSuccessMsg(
      language === 'hi'
        ? `छात्र "${rejectModalReq.fullName}" का पंजीकरण अनुरोध अस्वीकृत कर दिया गया है।`
        : `Registration request for "${rejectModalReq.fullName}" has been rejected.`
    );
    setRejectModalReq(null);

    if (isProfileModalOpen && selectedPendingRequest?.id === rejectModalReq.id) {
      setIsProfileModalOpen(false);
      setSelectedPendingRequest(null);
    }
  };

  // Open Direct Add Form
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      admissionNumber: `ADM-${Math.floor(1000 + Math.random() * 9000)}`,
      dateOfBirth: '2015-05-15',
      gender: 'Male',
      classNumber: 1,
      sectionName: 'A',
      rollNumber: String(students.length + 1).padStart(2, '0'),
      fatherName: '',
      motherName: '',
      guardianName: '',
      mobile: '+91 98',
      address: 'Main Town, District',
      bloodGroup: 'O+',
      category: 'General',
      photoURL: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80'
    });
    setIsAddModalOpen(true);
  };

  // Open Direct Edit Form
  const handleOpenEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      admissionNumber: student.admissionNumber,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      classNumber: student.classNumber,
      sectionName: student.sectionName,
      rollNumber: student.rollNumber,
      fatherName: student.fatherName,
      motherName: student.motherName,
      guardianName: student.guardianName || '',
      mobile: student.mobile,
      address: student.address,
      bloodGroup: student.bloodGroup || 'O+',
      category: student.category || 'General',
      photoURL: student.photoURL || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const classId = `class-${formData.classNumber}`;
    const sectionId = `sec-${formData.classNumber}-${formData.sectionName}`;
    const studentId = `UPS-${new Date().getFullYear()}-${String(formData.classNumber).padStart(2, '0')}${formData.rollNumber.padStart(2, '0')}`;

    await addStudent({
      studentId,
      admissionNumber: formData.admissionNumber,
      name: formData.name,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      classId,
      classNumber: formData.classNumber,
      sectionId,
      sectionName: formData.sectionName,
      rollNumber: formData.rollNumber,
      fatherName: formData.fatherName,
      motherName: formData.motherName,
      guardianName: formData.guardianName || formData.fatherName,
      mobile: formData.mobile,
      address: formData.address,
      photoURL: formData.photoURL,
      admissionDate: new Date().toISOString().split('T')[0],
      bloodGroup: formData.bloodGroup,
      category: formData.category,
      status: 'active'
    });

    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const classId = `class-${formData.classNumber}`;
    const sectionId = `sec-${formData.classNumber}-${formData.sectionName}`;

    await updateStudent(selectedStudent.id, {
      ...formData,
      classId,
      sectionId
    });
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* SUCCESS NOTIFICATION TOAST */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs font-bold">{actionSuccessMsg}</p>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="p-1 text-emerald-700 hover:text-emerald-950 rounded-lg hover:bg-emerald-100/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP COMMAND HERO & SUMMARY METRICS */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>
              {language === 'hi' ? 'एकीकृत छात्र पंजिका एवं प्रवेश निदेशालय' : 'Unified Student Roster & Admission Directorate'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {language === 'hi' ? 'छात्र नामांकन व आवेदन प्रबंधन' : 'Student Enrollment & Application Hub'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {language === 'hi' 
              ? 'सभी नए छात्र पंजीकरण आवेदनों की समीक्षा करें, सीधे प्रोफाइल देखें, 360° सत्यापन करें एवं आधिकारिक प्रवेश स्वीकृत करें।'
              : 'Review all incoming student registration requests, view complete 360° profiles, verify credentials, and approve official enrollment.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 relative z-10 shrink-0">
          <button
            onClick={() => {
              setActiveMainTab('requests');
              setRequestFilter('PENDING');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
              pendingStudentRequests.length > 0
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            id="btn-nav-pending-requests"
          >
            <Clock className="w-4 h-4" />
            <span>
              {language === 'hi' ? 'लंबित आवेदन' : 'Pending Requests'} ({pendingStudentRequests.length})
            </span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            id="btn-direct-add-student"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'hi' ? 'नया छात्र प्रवेश' : 'Direct Admission'}</span>
          </button>
        </div>
      </div>

      {/* 3 CORE NAV TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveMainTab('enrolled')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeMainTab === 'enrolled'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          id="tab-enrolled-students"
        >
          <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{language === 'hi' ? 'नामांकित छात्र पंजिका (कक्षा 1-8)' : 'Enrolled Students Roster'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('requests')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] relative ${
            activeMainTab === 'requests'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          id="tab-student-requests"
        >
          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{language === 'hi' ? 'छात्र पंजीकरण / प्रवेश अनुरोध' : 'Registration & Admission Requests'}</span>
          {pendingStudentRequests.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-600 text-white font-mono font-bold animate-pulse">
              {pendingStudentRequests.length} {language === 'hi' ? 'लंबित' : 'Pending'}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('history')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeMainTab === 'history'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
          id="tab-requests-history"
        >
          <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{language === 'hi' ? 'सत्यापन इतिहास (स्वीकृत/अस्वीकृत)' : 'Verification History'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono font-bold">
            {approvedStudentRequests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('promotion')}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap shrink-0 min-h-[42px] ${
            activeMainTab === 'promotion'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
          }`}
          id="tab-bulk-promotion"
        >
          <Award className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{language === 'hi' ? 'बल्क पदोन्नति एवं सत्र परिवर्तन' : 'Bulk Student Promotion'}</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-slate-950 font-bold">
            New
          </span>
        </button>
      </div>

      {/* SEARCH AND QUICK FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="lg:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder={
              language === 'hi'
                ? 'नाम, रोल नंबर, प्रवेश संख्या, मोबाइल या पिता के नाम से खोजें...'
                : 'Search by Name, Roll, Admission No, Mobile, Parent...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Class Filter */}
        <div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          >
            <option value="all">{language === 'hi' ? 'सभी कक्षाएं (1 से 8)' : 'All Classes (1 to 8)'}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Section Filter (Only for enrolled tab) */}
        {activeMainTab === 'enrolled' ? (
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी वर्ग (Sections)' : 'All Sections'}</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>
        ) : (
          /* Request Status Filter */
          <div>
            <select
              value={requestFilter}
              onChange={(e) => setRequestFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-bold text-slate-800"
            >
              <option value="all">{language === 'hi' ? 'सभी अनुरोध स्थितियाँ' : 'All Request Statuses'}</option>
              <option value="PENDING">⏳ {language === 'hi' ? 'लंबित अनुरोध (Pending)' : 'Pending Requests'}</option>
              <option value="APPROVED">✅ {language === 'hi' ? 'स्वीकृत (Approved)' : 'Approved'}</option>
              <option value="REJECTED">❌ {language === 'hi' ? 'अस्वीकृत (Rejected)' : 'Rejected'}</option>
            </select>
          </div>
        )}

        {/* Status Filter for Enrolled */}
        {activeMainTab === 'enrolled' && (
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              <option value="all">{language === 'hi' ? 'सभी स्थिति' : 'All Status'}</option>
              <option value="active">{language === 'hi' ? 'सक्रिय (Active)' : 'Active Only'}</option>
              <option value="inactive">{language === 'hi' ? 'निष्क्रिय (Inactive)' : 'Inactive'}</option>
            </select>
          </div>
        )}

        {/* Quick Reset */}
        <div className="flex items-center">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedClass('all');
              setSelectedSection('all');
              setSelectedStatus('all');
              setRequestFilter('all');
            }}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'रीसेट' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: ENROLLED STUDENTS DIRECTORY                       */}
      {/* ======================================================== */}
      {activeMainTab === 'enrolled' && (
        <div className="space-y-4">
          {/* Institutional Class-by-Class Breakdown Strip */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>{language === 'hi' ? 'संस्थागत कक्षा-वार छात्र संख्या (Class Rosters Matrix):' : 'Institutional Class Rosters Matrix:'}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const headers = ['Roll', 'Admission No', 'Student Name', 'Class', 'Father Name', 'Mobile', 'Category', 'Status'];
                    const rows = filteredStudents.map(s => [
                      `"${s.rollNumber}"`,
                      `"${s.admissionNumber}"`,
                      `"${s.name}"`,
                      `"Class ${s.classNumber}-${s.sectionName}"`,
                      `"${s.fatherName}"`,
                      `"${s.mobile}"`,
                      `"${s.category}"`,
                      `"${s.status}"`
                    ]);
                    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement('a');
                    link.setAttribute('href', encodedUri);
                    link.setAttribute('download', 'School_Master_Students_Register.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'CSV निर्यात' : 'Export CSV'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2 sm:gap-2.5">
              <button
                onClick={() => setSelectedClass('all')}
                className={`min-h-[64px] p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  selectedClass === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md font-black'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="text-[11px] font-bold whitespace-nowrap">{language === 'hi' ? 'सभी कक्षाएं' : 'All Classes'}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${selectedClass === 'all' ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'}`}>
                  {students.length}
                </span>
              </button>

              {[1, 2, 3, 4, 5, 6, 7, 8].map(cNum => {
                const cId = `class-${cNum}`;
                const isSelected = selectedClass === cId || selectedClass === String(cNum);
                const cStudents = students.filter(s => s.classNumber === cNum && s.status === 'active');
                const boys = cStudents.filter(s => s.gender === 'Male').length;
                const girls = cStudents.filter(s => s.gender === 'Female').length;
                return (
                  <button
                    key={cNum}
                    onClick={() => setSelectedClass(cId)}
                    className={`min-h-[64px] p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-md font-black ring-2 ring-amber-400/50'
                        : 'bg-white hover:bg-amber-50/50 text-slate-800 border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <span className="text-xs font-black whitespace-nowrap">Class {cNum}</span>
                    <div className="flex items-center gap-1 whitespace-nowrap">
                      <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                        {cStudents.length}
                      </span>
                      <span className="text-[9px] text-slate-400 font-medium">({boys}B/{girls}G)</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-black text-slate-800 text-xs uppercase tracking-wider">
                  {language === 'hi' ? 'नामांकित छात्र मास्टर रजिस्टर' : 'Enrolled Student Master Register'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  ({filteredStudents.length} {language === 'hi' ? 'छात्र प्रदर्शित' : 'students listed'})
                </span>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                {language === 'hi' ? 'कक्षा 1 से 8 • UDISE+ पंजीकृत' : 'Classes 1 to 8 • UDISE+ Linked'}
              </div>
            </div>

            {/* DESKTOP & TABLET STRUCTURED TABLE VIEW (>= 768px) */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 whitespace-nowrap">Student & ID</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Class & Sec</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Roll No</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Admission No</th>
                    <th className="py-3.5 px-4 whitespace-nowrap">Guardian & Mobile</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Attendance</th>
                    <th className="py-3.5 px-4 text-center whitespace-nowrap">Status</th>
                    <th className="py-3.5 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((student) => {
                    const att = getStudentAttendanceStats(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Student & ID */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden shrink-0">
                              {student.photoURL ? (
                                <img src={student.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500 text-xs">
                                  {student.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{student.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{student.studentId}</div>
                            </div>
                          </div>
                        </td>

                        {/* Class & Sec */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800">
                            Class {student.classNumber} - '{student.sectionName}'
                          </span>
                        </td>

                        {/* Roll No */}
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                          #{student.rollNumber}
                        </td>

                        {/* Admission No */}
                        <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                          {student.admissionNumber}
                        </td>

                        {/* Guardian & Mobile */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800 whitespace-nowrap">{student.fatherName}</div>
                          <div className="text-[10px] text-slate-500 whitespace-nowrap">{student.mobile}</div>
                        </td>

                        {/* Attendance */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center font-bold px-2.5 py-0.5 rounded-full text-[11px] ${
                            att.percentage >= 85 ? 'bg-emerald-100 text-emerald-800' :
                            att.percentage >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {att.percentage}%
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            student.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {student.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setSelectedPendingRequest(null);
                                setIsProfileModalOpen(true);
                              }}
                              className="px-3.5 py-2 text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              title="Open 360° Profile & Document Vault"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>{language === 'hi' ? '360° प्रोफाइल' : '360° Profile'}</span>
                            </button>

                            <button
                              onClick={() => setPrintIdCardStudent(student)}
                              className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                              title="Print Official ID Card"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                              title="Edit Record"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {student.status === 'active' ? (
                              <button
                                onClick={() => deactivateStudent(student.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                                title="Deactivate Student"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => activateStudent(student.id)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                                title="Activate Student"
                              >
                                <UserCheck className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="max-w-sm mx-auto space-y-2">
                          <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="font-bold text-slate-600 text-sm">
                            {language === 'hi' ? 'कोई छात्र नहीं मिला' : 'No Students Found'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {language === 'hi' ? 'दिए गए फ़िल्टर या खोज शब्दों के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records match the current filter or search criteria.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE RESPONSIVE STUDENT CARD VIEW (< 768px) */}
            <div className="block md:hidden p-3 space-y-3">
              {filteredStudents.map((student) => {
                const att = getStudentAttendanceStats(student.id);
                return (
                  <div
                    key={student.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3 transition-all hover:border-amber-300"
                  >
                    {/* Header Row: Photo + Name + Class & Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                          {student.photoURL ? (
                            <img src={student.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-black text-amber-700 bg-amber-50 text-base">
                              {student.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-slate-900 leading-snug truncate">{student.name}</h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              {student.studentId}
                            </span>
                            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                              Class {student.classNumber} - '{student.sectionName}'
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize shrink-0 ${
                        student.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {student.status}
                      </span>
                    </div>

                    {/* Metadata 2-Column Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Roll / Adm No</span>
                        <span className="font-mono font-bold text-slate-900">
                          #{student.rollNumber} • {student.admissionNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Attendance</span>
                        <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-md text-[11px] mt-0.5 ${
                          att.percentage >= 85 ? 'bg-emerald-100 text-emerald-800' :
                          att.percentage >= 70 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {att.percentage}%
                        </span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/50 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Guardian & Mobile</span>
                          <span className="font-semibold text-slate-800">{student.fatherName}</span>
                          <span className="text-slate-500 ml-1.5 text-[11px]">({student.mobile})</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block text-right">Category</span>
                          <span className="text-slate-700 font-semibold text-right block">{student.category || 'General'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions (Mobile-Optimized Touch Targets) */}
                    <div className="flex items-center gap-2 pt-1">
                      {/* Prominent 360° Profile Button */}
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setSelectedPendingRequest(null);
                          setIsProfileModalOpen(true);
                        }}
                        className="flex-1 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                        title="Open 360° Profile & Document Vault"
                      >
                        <Eye className="w-4 h-4 shrink-0" />
                        <span className="whitespace-nowrap">{language === 'hi' ? '360° प्रोफाइल' : '360° Profile'}</span>
                      </button>

                      {/* Print ID Card Button */}
                      <button
                        onClick={() => setPrintIdCardStudent(student)}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Print Official ID Card"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Edit Record Button */}
                      <button
                        onClick={() => handleOpenEdit(student)}
                        className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {/* Deactivate/Activate Button */}
                      {student.status === 'active' ? (
                        <button
                          onClick={() => deactivateStudent(student.id)}
                          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Deactivate Student"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => activateStudent(student.id)}
                          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="Activate Student"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="max-w-sm mx-auto space-y-2 px-4">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-600 text-sm">
                      {language === 'hi' ? 'कोई छात्र नहीं मिला' : 'No Students Found'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {language === 'hi' ? 'दिए गए फ़िल्टर या खोज शब्दों के अनुसार कोई रिकॉर्ड उपलब्ध नहीं है।' : 'No records match the current filter or search criteria.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PENDING & ALL STUDENT REGISTRATION REQUESTS       */}
      {/* ======================================================== */}
      {(activeMainTab === 'requests' || activeMainTab === 'history') && (
        <div className="space-y-4">
          {/* Guide Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-4 rounded-2xl border border-amber-500/20 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">
                  {language === 'hi' ? 'आधिकारिक छात्र प्रवेश व पंजीकरण सत्यापन' : 'Official Student Admission Verification'}
                </h4>
                <p className="text-[11px] text-slate-600">
                  {language === 'hi'
                    ? 'प्रत्येक आवेदक की 360° प्रोफाइल व विवरण यहीं से जांचें। "स्वीकृत करें" पर क्लिक करने पर छात्र खाता व नामांकन तुरंत सक्रिय हो जाएगा।'
                    : 'Inspect applicant profile details and document vault. Approving instantly provisions their student account and adds them to the master register.'}
                </p>
              </div>
            </div>

            <div className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-300 shrink-0">
              {pendingStudentRequests.length} {language === 'hi' ? 'लंबित आवेदन' : 'Pending Verification'}
            </div>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">
                {language === 'hi' ? 'कोई लंबित पंजीकरण अनुरोध नहीं है' : 'No Registration Requests in this queue'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'hi' ? 'सभी प्राप्त आवेदनों की समीक्षा व सत्यापन पूर्ण हो चुका है।' : 'All received student registration requests have been reviewed.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <div 
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'PENDING'
                      ? 'bg-white border-amber-300 shadow-md ring-1 ring-amber-400/20'
                      : req.status === 'APPROVED'
                      ? 'bg-slate-50/80 border-emerald-200'
                      : 'bg-slate-50/80 border-rose-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-amber-600 text-base shrink-0">
                        {req.fullName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900">{req.fullName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {req.preferredUsername || 'STU-NEW'}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            Class {req.classNumber || 1} - '{req.sectionName || 'A'}'
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission / SRN</span>
                      <span className="font-mono font-bold text-slate-900">{req.admissionNumber || 'ADM-NEW'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                      <span className="font-semibold text-slate-800">{req.dateOfBirth || '2015-05-15'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Father / Guardian</span>
                      <span className="font-semibold text-slate-800">{req.fatherName || 'Parent / Guardian'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Mobile</span>
                      <span className="font-semibold text-slate-800">{req.phone || 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Category</span>
                      <span className="font-semibold text-slate-700">{req.category || 'General'}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Submission Date</span>
                      <span className="text-slate-600 font-medium">
                        {req.createdAt ? new Date(req.createdAt).toLocaleDateString('en-IN') : 'Today'}
                      </span>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* View Full 360° Profile Button */}
                    <button
                      onClick={() => handleViewRequestProfile(req)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-black shadow-xs transition-colors cursor-pointer"
                      title="View Complete 360° Profile of Applicant"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? 'पूरी 360° प्रोफाइल देखें' : 'View 360° Profile'}</span>
                    </button>

                    {/* Quick Approve / Reject for Pending */}
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setRejectModalReq(req);
                            setRejectionReason('Admission records could not be verified with government master register.');
                          }}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition-colors cursor-pointer"
                        >
                          {language === 'hi' ? 'अस्वीकृत करें' : 'Reject'}
                        </button>

                        <button
                          disabled={isProcessingApproval}
                          onClick={() => handleApproveStudent(req.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-colors cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{language === 'hi' ? 'स्वीकृत व नामांकित करें' : 'Approve & Enrol'}</span>
                        </button>
                      </div>
                    )}

                    {/* For Approved Requests */}
                    {req.status === 'APPROVED' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const studentObj = mapRequestToStudent(req);
                            setPrintIdCardStudent(studentObj);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-amber-600" />
                          <span>{language === 'hi' ? 'आईडी कार्ड प्रिंट' : 'Print ID Card'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BULK PROMOTION & SESSION ROLLOVER                 */}
      {/* ======================================================== */}
      {activeMainTab === 'promotion' && (
        <AdminBulkPromotion />
      )}

      {/* ======================================================== */}
      {/* 360° STUDENT PROFILE & VAULT MODAL (UNIFIED PROFILE VIEW) */}
      {/* ======================================================== */}
      {selectedStudent && isProfileModalOpen && (
        <Student360Modal
          student={selectedStudent}
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false);
            setSelectedPendingRequest(null);
          }}
          pendingRequest={selectedPendingRequest}
          onApproveRequest={handleApproveStudent}
          onRejectRequest={async (reqId, reason) => {
            await rejectRegistrationRequest(reqId, reason);
            setIsProfileModalOpen(false);
            setSelectedPendingRequest(null);
            setActionSuccessMsg(
              language === 'hi'
                ? 'छात्र पंजीकरण अनुरोध अस्वीकृत कर दिया गया है।'
                : 'Registration request rejected.'
            );
          }}
          canManageDocuments={true}
        />
      )}

      {/* REJECT REQUEST CONFIRMATION MODAL */}
      <Modal
        isOpen={!!rejectModalReq}
        onClose={() => setRejectModalReq(null)}
        title={`Reject Student Registration: ${rejectModalReq?.fullName}`}
        maxWidth="md"
      >
        <form onSubmit={handleRejectStudent} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
            <p className="font-bold">
              {language === 'hi' 
                ? 'क्या आप सुनिश्चित हैं कि इस छात्र का आवेदन अस्वीकृत करना चाहते हैं?'
                : 'Are you sure you want to reject this student application?'}
            </p>
            <p className="text-[11px] mt-1 text-rose-600">
              Applicant: <strong>{rejectModalReq?.fullName}</strong> (Class {rejectModalReq?.classNumber}, Username: {rejectModalReq?.preferredUsername})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'hi' ? 'अस्वीकृति का कारण (Reason for Rejection) *' : 'Reason for Rejection *'}
            </label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRejectModalReq(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD STUDENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Student Admission (Classes 1 to 8)"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number (SRN) *</label>
              <input
                type="text"
                required
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class *</label>
              <select
                value={formData.classNumber}
                onChange={(e) => setFormData({ ...formData, classNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
              <select
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="01"
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth *</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Social Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name *</label>
              <input
                type="text"
                required
                placeholder="Father's full name"
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mother's Name *</label>
              <input
                type="text"
                required
                placeholder="Mother's full name"
                value={formData.motherName}
                onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Mobile Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Residential Address *</label>
            <input
              type="text"
              required
              placeholder="House No, Village/Street, Post Office, District"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
            >
              Complete Student Admission
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Details: ${selectedStudent?.name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Admission Number</label>
              <input
                type="text"
                required
                value={formData.admissionNumber}
                onChange={(e) => setFormData({ ...formData, admissionNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class *</label>
              <select
                value={formData.classNumber}
                onChange={(e) => setFormData({ ...formData, classNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <option key={num} value={num}>Class {num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
              <select
                value={formData.sectionName}
                onChange={(e) => setFormData({ ...formData, sectionName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Father's Name</label>
              <input
                type="text"
                required
                value={formData.fatherName}
                onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Parent Mobile</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ID CARD PRINT PREVIEW */}
      {printIdCardStudent && (
        <StudentIdCardPrint
          student={printIdCardStudent}
          settings={settings}
          onClose={() => setPrintIdCardStudent(null)}
        />
      )}
    </div>
  );
};
