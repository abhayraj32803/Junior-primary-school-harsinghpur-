import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { Teacher, RegistrationRequest } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Mail, 
  Phone, 
  GraduationCap, 
  BookOpen, 
  Award,
  CheckCircle,
  UserX,
  UserCheck,
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  Lock,
  Eye,
  RefreshCw,
  Sparkles,
  X,
  FileText,
  BadgeCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';

type TeacherTab = 'directory' | 'pending_approvals' | 'access_control';

export const AdminTeachers: React.FC = () => {
  const { teachers, teacherAssignments, addTeacher, updateTeacher, language, settings, addAuditLog } = useSchool();
  const { registrationRequests, approveRegistrationRequest, rejectRegistrationRequest, allUsers, setAllUsers, createTeacherDirectly, resetUserPasswordByAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<TeacherTab>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [designationFilter, setDesignationFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  // Approval flow modals
  const [approvalModalReq, setApprovalModalReq] = useState<RegistrationRequest | null>(null);
  const [rejectModalReq, setRejectModalReq] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [assignedUsername, setAssignedUsername] = useState('');
  const [assignedDesignation, setAssignedDesignation] = useState('Assistant Teacher (Primary)');
  const [assignedQualification, setAssignedQualification] = useState('');
  const [assignedSpecialization, setAssignedSpecialization] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [initialPassword, setInitialPassword] = useState('Teacher@2026');
  const [isProcessingApproval, setIsProcessingApproval] = useState(false);

  // Success / Credential Slip Modal
  const [credentialSlip, setCredentialSlip] = useState<{
    name: string;
    username: string;
    role: string;
    designation: string;
    employeeId: string;
    temporaryPassword?: string;
    email?: string;
    phone?: string;
  } | null>(null);
  const [copiedSlip, setCopiedSlip] = useState(false);

  // Password reset modal for existing faculty
  const [resetModalTeacher, setResetModalTeacher] = useState<Teacher | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // Status Notification
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Add / Edit form data
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    phone: '',
    username: '',
    qualification: '',
    designation: 'Assistant Teacher (Primary)',
    specialization: '',
    joiningDate: new Date().toISOString().split('T')[0],
    address: 'School Residential Campus, District',
    photoURL: '',
    autoCreateLogin: true,
    initialPassword: 'Teacher@2026',
    showPhonePublicly: false,
    showOnWebsite: true
  });

  // Pending teacher requests
  const pendingTeacherRequests = useMemo(() => {
    return registrationRequests.filter(
      r => r.requestedRole === 'teacher' && r.status === 'PENDING'
    );
  }, [registrationRequests]);

  const allTeacherRequests = useMemo(() => {
    return registrationRequests.filter(r => r.requestedRole === 'teacher');
  }, [registrationRequests]);

  // Filtered teachers list
  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchSearch = 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.designation && t.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.phone && t.phone.includes(searchTerm));

      const matchDesignation = 
        designationFilter === 'ALL' || 
        t.designation.toLowerCase().includes(designationFilter.toLowerCase());

      return matchSearch && matchDesignation;
    });
  }, [teachers, searchTerm, designationFilter]);

  // Handle open Add Modal
  const handleOpenAdd = () => {
    const nextIndex = teachers.length + 1;
    const defaultUsername = `TCH-2026-${String(nextIndex).padStart(3, '0')}`;
    setFormData({
      employeeId: defaultUsername,
      name: '',
      email: '',
      phone: '+91 ',
      username: defaultUsername,
      qualification: 'B.Sc, B.Ed (Basic Education)',
      designation: 'Assistant Teacher (Primary)',
      specialization: 'General Primary & Environmental Studies',
      joiningDate: new Date().toISOString().split('T')[0],
      address: 'School Campus, Farrukhabad UP',
      photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      autoCreateLogin: true,
      initialPassword: 'Teacher@2026',
      showPhonePublicly: false,
      showOnWebsite: true
    });
    setIsAddModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEdit = (t: Teacher) => {
    setSelectedTeacher(t);
    const userAcc = allUsers.find(u => 
      (t.employeeId && u.employeeId === t.employeeId) ||
      (t.email && u.email === t.email) ||
      (u.name.toLowerCase() === t.name.toLowerCase() && u.role === 'teacher')
    );
    setFormData({
      employeeId: t.employeeId,
      name: t.name,
      email: t.email,
      phone: t.phone,
      username: userAcc?.username || t.employeeId || '',
      qualification: t.qualification,
      designation: t.designation,
      specialization: t.specialization || '',
      joiningDate: t.joiningDate,
      address: t.address,
      photoURL: t.photoURL || '',
      autoCreateLogin: false,
      initialPassword: '',
      showPhonePublicly: t.showPhonePublicly ?? false,
      showOnWebsite: t.showOnWebsite ?? true
    });
    setIsEditModalOpen(true);
  };

  // Save new teacher
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newId = await addTeacher({
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      qualification: formData.qualification,
      designation: formData.designation,
      specialization: formData.specialization,
      joiningDate: formData.joiningDate,
      address: formData.address,
      photoURL: formData.photoURL,
      status: 'active',
      showPhonePublicly: formData.showPhonePublicly,
      showOnWebsite: formData.showOnWebsite
    });

    setIsAddModalOpen(false);

    let createdUsername = formData.username || formData.employeeId.toUpperCase();

    if (formData.autoCreateLogin) {
      const authRes = await createTeacherDirectly({
        fullName: formData.name,
        employeeId: formData.employeeId,
        designation: formData.designation,
        subject: formData.specialization,
        qualification: formData.qualification,
        phone: formData.phone,
        email: formData.email,
        username: formData.username || formData.employeeId,
        password: formData.initialPassword || 'Teacher@2026',
        showPhonePublicly: formData.showPhonePublicly,
        showOnWebsite: formData.showOnWebsite
      });

      if (authRes.success && authRes.generatedUsername) {
        createdUsername = authRes.generatedUsername;
      }

      setCredentialSlip({
        name: formData.name,
        username: createdUsername,
        role: 'Teacher',
        designation: formData.designation,
        employeeId: formData.employeeId,
        temporaryPassword: formData.initialPassword || 'Teacher@2026',
        email: formData.email,
        phone: formData.phone
      });
    }

    setBannerNotice(language === 'hi' ? `शिक्षक ${formData.name} का रिकॉर्ड एवं यूजरनेम (${createdUsername}) सफलतापूर्वक सृजित किया गया!` : `Teacher record for ${formData.name} & login account (${createdUsername}) created successfully!`);
    setTimeout(() => setBannerNotice(null), 5000);
  };

  // Save edited teacher
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;
    await updateTeacher(selectedTeacher.id, {
      employeeId: formData.employeeId,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      qualification: formData.qualification,
      designation: formData.designation,
      specialization: formData.specialization,
      joiningDate: formData.joiningDate,
      address: formData.address,
      photoURL: formData.photoURL,
      showPhonePublicly: formData.showPhonePublicly,
      showOnWebsite: formData.showOnWebsite
    });
    setIsEditModalOpen(false);
    setBannerNotice(language === 'hi' ? `शिक्षक विवरण एवं गोपनीयता सेटिंग्स सफलतापूर्वक अपडेट की गईं!` : `Faculty record and privacy settings updated successfully!`);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  // Open Approval Modal for a pending teacher request
  const openApprovalModal = (req: RegistrationRequest) => {
    setApprovalModalReq(req);
    setAssignedUsername(req.preferredUsername || `TCH-2026-${String(teachers.length + 1).padStart(3, '0')}`);
    setAssignedEmployeeId(req.employeeId || `EHMS-${Math.floor(100000 + Math.random() * 900000)}`);
    setAssignedDesignation(req.designation || 'Assistant Teacher (Primary)');
    setAssignedQualification(req.qualification || 'B.Ed, TET Qualified');
    setAssignedSpecialization(req.specialization || req.subject || 'Elementary Education');
    setInitialPassword(req.password || 'Teacher@2026');
  };

  // Confirm Approval of a Teacher Registration
  const handleConfirmApproval = async () => {
    if (!approvalModalReq) return;
    setIsProcessingApproval(true);

    try {
      const res = await approveRegistrationRequest(approvalModalReq.id, assignedUsername.toUpperCase());
      
      if (res.success) {
        // Also ensure teacher profile is added to school directory
        const existingTeacher = teachers.find(t => 
          (assignedEmployeeId && t.employeeId?.toLowerCase() === assignedEmployeeId.toLowerCase()) ||
          (t.name.toLowerCase() === approvalModalReq.fullName.toLowerCase())
        );

        if (!existingTeacher) {
          await addTeacher({
            employeeId: assignedEmployeeId,
            name: approvalModalReq.fullName,
            email: approvalModalReq.email || '',
            phone: approvalModalReq.phone || '',
            designation: assignedDesignation,
            qualification: assignedQualification,
            specialization: assignedSpecialization,
            joiningDate: new Date().toISOString().split('T')[0],
            address: 'School Residential Campus, District',
            photoURL: approvalModalReq.photoURL || '',
            status: 'active'
          });
        }

        // Show Credential Slip
        setCredentialSlip({
          name: approvalModalReq.fullName,
          username: assignedUsername.toUpperCase(),
          role: 'Teacher / Faculty',
          designation: assignedDesignation,
          employeeId: assignedEmployeeId,
          temporaryPassword: initialPassword,
          email: approvalModalReq.email,
          phone: approvalModalReq.phone
        });

        setApprovalModalReq(null);
        setBannerNotice(language === 'hi' 
          ? `शिक्षक ${approvalModalReq.fullName} का पंजीकरण स्वीकृत कर दिया गया है! अब वे लॉगिन कर सकते हैं।` 
          : `Teacher ${approvalModalReq.fullName} approved and authorized for login!`
        );
        setTimeout(() => setBannerNotice(null), 6000);
      } else {
        alert(res.error || 'Failed to approve registration request.');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving teacher registration.');
    } finally {
      setIsProcessingApproval(false);
    }
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!rejectModalReq) return;
    const res = await rejectRegistrationRequest(rejectModalReq.id, rejectionReason || 'Information does not match official school records');
    if (res.success) {
      setBannerNotice(language === 'hi' ? 'शिक्षक पंजीकरण आवेदन अस्वीकृत कर दिया गया।' : 'Registration request rejected.');
      setRejectModalReq(null);
      setRejectionReason('');
      setTimeout(() => setBannerNotice(null), 4000);
    }
  };

  // Handle direct Password Reset for a teacher
  const handleResetTeacherPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalTeacher) return;

    if (newPasswordInput.length < 6) {
      alert(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.');
      return;
    }

    // Find user in allUsers
    const user = allUsers.find(u => 
      (resetModalTeacher.employeeId && u.employeeId === resetModalTeacher.employeeId) ||
      (resetModalTeacher.email && u.email === resetModalTeacher.email) ||
      (u.name.toLowerCase() === resetModalTeacher.name.toLowerCase() && u.role === 'teacher')
    );

    if (user) {
      setAllUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, password: newPasswordInput, mustChangePassword: false } : u));
    }

    await addAuditLog('RESET_PASSWORD', 'Teacher', resetModalTeacher.id, `Admin reset password for faculty ${resetModalTeacher.name} (${resetModalTeacher.employeeId})`);

    setResetSuccessMsg(language === 'hi' ? `पासवर्ड सफलतापूर्वक अपडेट किया गया: ${newPasswordInput}` : `Password successfully updated: ${newPasswordInput}`);
    setTimeout(() => {
      setResetSuccessMsg(null);
      setResetModalTeacher(null);
      setNewPasswordInput('');
    }, 2500);
  };

  // Copy Credential Slip
  const handleCopyCredentials = () => {
    if (!credentialSlip) return;
    const text = `==============================
${settings.schoolName.toUpperCase()}
OFFICIAL TEACHER LOGIN CREDENTIALS
==============================
Teacher Name: ${credentialSlip.name}
Designation: ${credentialSlip.designation}
Employee / EHMS ID: ${credentialSlip.employeeId}

LOGIN DETAILS:
Role Selection: Teacher / Staff (शिक्षक)
Login ID / Username: ${credentialSlip.username}
Password: ${credentialSlip.temporaryPassword || 'Teacher@2026'}
Portal URL: ${window.location.origin}

Instructions:
1. Open the School Portal and choose "Teacher / Staff" login.
2. Enter the Login ID and Password above.
3. Access your daily attendance, homework, and classroom management hub.
==============================`;

    navigator.clipboard.writeText(text);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      {bannerNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{bannerNotice}</span>
          </div>
          <button onClick={() => setBannerNotice(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Teacher Approvals Alert Banner */}
      {pendingTeacherRequests.length > 0 && activeTab !== 'pending_approvals' && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-600/10 border-2 border-amber-400 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">
                  {language === 'hi' ? 'लंबित शिक्षक अनुमोदन' : 'Pending Teacher Approval'}
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {pendingTeacherRequests.length} {language === 'hi' ? 'आवेदन समीक्षा हेतु उपलब्ध' : 'New Applications'}
                </span>
              </div>
              <p className="text-xs text-amber-950 font-semibold mt-0.5">
                {language === 'hi' 
                  ? 'नए शिक्षकों ने पंजीकरण किया है। प्रोफाइल व लॉगिन अनुमति हेतु तत्काल अनुमोदन करें।' 
                  : 'New educators have registered online. Review and approve to grant dashboard login access.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('pending_approvals')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{language === 'hi' ? 'अनुमोदन सूची देखें' : 'Review & Approve Now'}</span>
            <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] flex items-center justify-center font-mono">
              {pendingTeacherRequests.length}
            </span>
          </button>
        </div>
      )}

      {/* Main Controls & Sub-Tabs Header */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                {language === 'hi' ? 'कार्मिक नियंत्रण पटल' : 'Faculty Command Console'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-semibold">
                {teachers.length} {language === 'hi' ? 'सत्यापित शिक्षक' : 'Verified Teachers'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'शिक्षक प्रबंधन एवं ऑनलाइन अनुमोदन' : 'Faculty Management & Teacher Approvals'}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'hi' ? 'नया शिक्षक नियुक्त करें' : 'Appoint New Faculty'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto custom-scrollbar">
          {/* Tab 1: Faculty Directory */}
          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'directory'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <Users className={`w-4 h-4 ${activeTab === 'directory' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{language === 'hi' ? 'शिक्षक पंजिका' : 'Faculty Directory'}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeTab === 'directory' ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
            }`}>
              {teachers.length}
            </span>
          </button>

          {/* Tab 2: Pending Approvals */}
          <button
            onClick={() => setActiveTab('pending_approvals')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'pending_approvals'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <BadgeCheck className={`w-4 h-4 ${activeTab === 'pending_approvals' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{language === 'hi' ? 'लंबित शिक्षक अनुमोदन' : 'Pending Registrations & Approvals'}</span>
            {pendingTeacherRequests.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                {pendingTeacherRequests.length} {language === 'hi' ? 'लंबित' : 'Pending'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                0
              </span>
            )}
          </button>

          {/* Tab 3: Access Control & Login Passwords */}
          <button
            onClick={() => setActiveTab('access_control')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
              activeTab === 'access_control'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
            }`}
          >
            <KeyRound className={`w-4 h-4 ${activeTab === 'access_control' ? 'text-amber-400' : 'text-slate-400'}`} />
            <span>{language === 'hi' ? 'लॉगिन व पासवर्ड नियंत्रण' : 'Login Credentials & Access'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FACULTY DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-5">
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={language === 'hi' ? 'शिक्षक नाम, ईएचएमएस आईडी, योग्यता से खोजें...' : 'Search teachers by name, ID, qualification...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-hidden focus:border-amber-500 w-full sm:w-auto"
              >
                <option value="ALL">{language === 'hi' ? 'सभी पद (All Designations)' : 'All Designations'}</option>
                <option value="Head Teacher">Head Teacher / In-charge</option>
                <option value="Assistant Teacher">Assistant Teacher (UP/Primary)</option>
                <option value="Shiksha Mitra">Shiksha Mitra / Parateacher</option>
                <option value="Instructor">Instructors</option>
              </select>
            </div>
          </div>

          {/* Teacher Cards Grid */}
          {filteredTeachers.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Users className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">
                {language === 'hi' ? 'कोई शिक्षक रिकॉर्ड नहीं मिला' : 'No teacher records found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {language === 'hi' ? 'खोज शब्द बदलें या "नया शिक्षक नियुक्त करें" बटन से नया रिकॉर्ड जोड़ें।' : 'Try changing search criteria or click "Appoint New Faculty" to add a new record.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTeachers.map((teacher) => {
                const assignedCount = teacherAssignments.filter(a => a.teacherId === teacher.id).length;
                const userAcc = allUsers.find(u => 
                  (teacher.employeeId && u.employeeId === teacher.employeeId) ||
                  (teacher.email && u.email === teacher.email) ||
                  (u.name.toLowerCase() === teacher.name.toLowerCase() && u.role === 'teacher')
                );

                return (
                  <div 
                    key={teacher.id}
                    className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-amber-400/50 transition-all group"
                  >
                    <div>
                      {/* Teacher Header Bar */}
                      <div className="bg-slate-900 p-4 sm:p-5 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 border-2 border-amber-400 overflow-hidden shrink-0 shadow-sm">
                            {teacher.photoURL ? (
                              <img src={teacher.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-black text-amber-400 text-lg">
                                {teacher.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-white leading-tight">{teacher.name}</h3>
                            <div className="text-[11px] text-amber-400 font-bold">{teacher.designation}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{teacher.employeeId}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 relative z-10">
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            className="p-2 rounded-xl bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                            title={language === 'hi' ? 'विवरण संपादित करें' : 'Edit Teacher'}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Content Details */}
                      <div className="p-5 space-y-3 text-xs">
                        {/* Login Account Status */}
                        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/80">
                          <span className="text-slate-500 font-semibold">
                            {language === 'hi' ? 'लॉगिन स्थिति:' : 'Login Access:'}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="font-bold text-emerald-700 text-[11px]">
                              {userAcc ? (language === 'hi' ? 'सक्रिय खाता' : 'Active Account') : (language === 'hi' ? 'क्रेडेंशियल उपलब्ध' : 'Verified')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            {language === 'hi' ? 'शैक्षणिक योग्यता:' : 'Academic Qualification:'}
                          </span>
                          <div className="font-bold text-slate-800 mt-0.5">{teacher.qualification}</div>
                        </div>

                        {teacher.specialization && (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                              {language === 'hi' ? 'विशेषज्ञता / विषय:' : 'Specialization & Subjects:'}
                            </span>
                            <div className="text-slate-700 font-semibold">{teacher.specialization}</div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-slate-500 font-medium">
                            {language === 'hi' ? 'कक्षा कार्यभार:' : 'Assigned Classes:'}
                          </span>
                          <span className="font-bold text-amber-700 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px]">
                            {assignedCount} {language === 'hi' ? 'कक्षाएं आवंटित' : 'Classes Assigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Controls & Quick Actions */}
                    <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 space-y-2 text-[11px] text-slate-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{teacher.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{teacher.phone}</span>
                        </div>
                      </div>

                      {/* Quick Admin Actions */}
                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <button
                          onClick={() => {
                            setResetModalTeacher(teacher);
                            setNewPasswordInput('Teacher@2026');
                          }}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        >
                          <KeyRound className="w-3 h-3 text-amber-600" />
                          <span>{language === 'hi' ? 'पासवर्ड बदलें' : 'Reset Password'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setCredentialSlip({
                              name: teacher.name,
                              username: teacher.employeeId.toUpperCase(),
                              role: 'Teacher',
                              designation: teacher.designation,
                              employeeId: teacher.employeeId,
                              temporaryPassword: 'Teacher@2026',
                              email: teacher.email,
                              phone: teacher.phone
                            });
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title={language === 'hi' ? 'लॉगिन पर्ची बनाएं' : 'Generate Login Slip'}
                        >
                          <FileText className="w-3 h-3 text-amber-700" />
                          <span>{language === 'hi' ? 'लॉगिन पर्ची' : 'Slip'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: PENDING TEACHER REGISTRATIONS & APPROVALS */}
      {activeTab === 'pending_approvals' && (
        <div className="space-y-5">
          {/* Header Info */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {language === 'hi' ? 'ऑनलाइन शिक्षक पंजीकरण एवं सत्यापन कतार' : 'Online Teacher Registration Verification Queue'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' 
                  ? 'शिक्षकों द्वारा सबमिट किए गए क्रेडेंशियल का परीक्षण करें और लॉगिन अधिकार प्रदान करने हेतु अनुमोदित करें।' 
                  : 'Inspect teacher applicant credentials and approve or reject portal access requests.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 px-3 py-1.5 rounded-xl border border-amber-200">
                {pendingTeacherRequests.length} {language === 'hi' ? 'समीक्षा हेतु लंबित' : 'Awaiting Approval'}
              </span>
            </div>
          </div>

          {/* Pending Applications List */}
          {pendingTeacherRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {language === 'hi' ? 'कोई लंबित शिक्षक पंजीकरण नहीं है' : 'No Pending Teacher Registrations'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'hi' 
                  ? 'सभी शिक्षक पंजीकरण अनुमोदित हैं। जब भी कोई शिक्षक ऑनलाइन रजिस्टर करेगा, वह यहाँ अनुमोदन हेतु प्रदर्शित होगा।' 
                  : 'All teacher registration requests have been reviewed and approved.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingTeacherRequests.map((req) => (
                <div 
                  key={req.id}
                  className="bg-white rounded-3xl border-2 border-amber-300 shadow-md p-5 flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-lg shrink-0">
                          {req.fullName ? req.fullName.charAt(0) : 'T'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{req.fullName}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                              Pending
                            </span>
                          </div>
                          <div className="text-[11px] font-mono font-bold text-amber-800 mt-0.5">
                            {language === 'hi' ? 'प्रस्तावित लॉगिन आईडी:' : 'Requested ID:'} {req.preferredUsername}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'hi' ? 'कर्मचारी/EHMS आईडी:' : 'Employee / EHMS ID:'}</span>
                        <span className="font-mono font-bold text-slate-900">{req.employeeId || 'To Be Assigned'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'hi' ? 'पद / धारित पदनाम:' : 'Designation:'}</span>
                        <span className="font-bold text-slate-800">{req.designation || 'Assistant Teacher (Primary)'}</span>
                      </div>

                      {req.subject && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === 'hi' ? 'मुख्य विषय:' : 'Subject:'}</span>
                          <span className="font-semibold text-slate-800">{req.subject}</span>
                        </div>
                      )}

                      {req.qualification && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === 'hi' ? 'योग्यता:' : 'Qualification:'}</span>
                          <span className="text-slate-800 font-medium">{req.qualification}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-500">{language === 'hi' ? 'मोबाइल नंबर:' : 'Phone:'}</span>
                        <span className="font-mono font-bold text-slate-800">{req.phone || 'N/A'}</span>
                      </div>

                      {req.email && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">{language === 'hi' ? 'ईमेल आईडी:' : 'Email:'}</span>
                          <span className="text-slate-800 font-medium">{req.email}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                        <span>{language === 'hi' ? 'पंजीकरण दिनांक:' : 'Submitted:'}</span>
                        <span>{new Date(req.createdAt).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2.5">
                    <button
                      onClick={() => openApprovalModal(req)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{language === 'hi' ? 'अनुमोदित व सक्रिय करें' : 'Approve & Authorize Login'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setRejectModalReq(req);
                        setRejectionReason('');
                      }}
                      className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                      <span>{language === 'hi' ? 'अस्वीकृत' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Historical Teacher Requests Table */}
          {allTeacherRequests.filter(r => r.status !== 'PENDING').length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h4 className="text-sm font-black text-slate-900">
                {language === 'hi' ? 'पूर्व शिक्षक पंजीकरण इतिहास' : 'Past Teacher Registration History'}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-bold">
                      <th className="pb-2">{language === 'hi' ? 'शिक्षक नाम' : 'Teacher'}</th>
                      <th className="pb-2">{language === 'hi' ? 'लॉगिन आईडी' : 'Login ID'}</th>
                      <th className="pb-2">{language === 'hi' ? 'पदनाम' : 'Designation'}</th>
                      <th className="pb-2">{language === 'hi' ? 'संपर्क' : 'Contact'}</th>
                      <th className="pb-2">{language === 'hi' ? 'स्थिति' : 'Status'}</th>
                      <th className="pb-2">{language === 'hi' ? 'समीक्षा दिनांक' : 'Reviewed At'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allTeacherRequests.filter(r => r.status !== 'PENDING').map(req => (
                      <tr key={req.id} className="text-slate-700">
                        <td className="py-2.5 font-bold text-slate-900">{req.fullName}</td>
                        <td className="py-2.5 font-mono">{req.preferredUsername}</td>
                        <td className="py-2.5">{req.designation || 'Teacher'}</td>
                        <td className="py-2.5">{req.phone}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-slate-400">
                          {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: LOGIN CREDENTIALS & ACCESS CONTROL */}
      {activeTab === 'access_control' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {language === 'hi' ? 'शिक्षक लॉगिन क्रेडेंशियल एवं पासवर्ड नियंत्रण' : 'Teacher Portal Login Credentials & Access Control'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi' 
                  ? 'शिक्षकों के पासवर्ड रीसेट करें, लॉगिन पहुंच सक्षम/अक्षम करें और क्रेडेंशियल पर्ची प्रिंट करें।' 
                  : 'Manage teacher login privileges, issue password resets, and generate official authorization slips.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">{language === 'hi' ? 'शिक्षक' : 'Teacher'}</th>
                    <th className="p-4">{language === 'hi' ? 'लॉगिन आईडी / यूजरनेम' : 'Login ID / Username'}</th>
                    <th className="p-4">{language === 'hi' ? 'पद / ईएचएमएस आईडी' : 'Designation / EHMS'}</th>
                    <th className="p-4">{language === 'hi' ? 'लॉगिन स्थिति' : 'Access Status'}</th>
                    <th className="p-4 text-right">{language === 'hi' ? 'प्रशासनिक नियंत्रण' : 'Admin Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {teachers.map((teacher) => {
                    const userAcc = allUsers.find(u => 
                      (teacher.employeeId && u.employeeId === teacher.employeeId) ||
                      (teacher.email && u.email === teacher.email) ||
                      (u.name.toLowerCase() === teacher.name.toLowerCase() && u.role === 'teacher')
                    );

                    return (
                      <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {teacher.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{teacher.name}</div>
                              <div className="text-[11px] text-slate-400">{teacher.email || teacher.phone}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-mono font-bold text-amber-700">
                          {userAcc ? userAcc.username : teacher.employeeId}
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-slate-800">{teacher.designation}</div>
                          <div className="text-[10px] font-mono text-slate-400">{teacher.employeeId}</div>
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{language === 'hi' ? 'सक्रिय लॉगिन' : 'Authorized'}</span>
                          </span>
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setResetModalTeacher(teacher);
                                setNewPasswordInput('Teacher@2026');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <KeyRound className="w-3 h-3 text-amber-600" />
                              <span>{language === 'hi' ? 'पासवर्ड बदलें' : 'Reset Password'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setCredentialSlip({
                                  name: teacher.name,
                                  username: (userAcc?.username || teacher.employeeId).toUpperCase(),
                                  role: 'Teacher',
                                  designation: teacher.designation,
                                  employeeId: teacher.employeeId,
                                  temporaryPassword: 'Teacher@2026',
                                  email: teacher.email,
                                  phone: teacher.phone
                                });
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            >
                              <FileText className="w-3 h-3" />
                              <span>{language === 'hi' ? 'लॉगिन पर्ची' : 'Login Slip'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPROVAL MODAL: Review & Authorize Teacher */}
      <Modal
        isOpen={!!approvalModalReq}
        onClose={() => setApprovalModalReq(null)}
        title={language === 'hi' ? 'शिक्षक पंजीकरण अनुमोदन एवं प्रोफाइल सक्रियण' : 'Teacher Registration Approval & Authorization'}
        maxWidth="xl"
      >
        {approvalModalReq && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{language === 'hi' ? 'प्रधानाध्यापिका आधिकारिक अनुमोदन' : 'Headmaster Authorization Directorate'}</span>
              </div>
              <p className="text-xs">
                {language === 'hi' 
                  ? `आप ${approvalModalReq.fullName} के शिक्षक पंजीकरण को अनुमोदित कर रहे हैं। अनुमोदन के पश्चात वे अपने क्रेडेंशियल से लॉगिन कर सकेंगे।`
                  : `Approving ${approvalModalReq.fullName} will create their official faculty account and permit them to sign in.`}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'आधिकारिक लॉगिन आईडी (Username) *' : 'Assigned Login ID / Username *'}
                </label>
                <input
                  type="text"
                  required
                  value={assignedUsername}
                  onChange={(e) => setAssignedUsername(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'मानव संपदा / ईएचएमएस कोड *' : 'EHMS / Employee Reg Code *'}
                </label>
                <input
                  type="text"
                  required
                  value={assignedEmployeeId}
                  onChange={(e) => setAssignedEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'पदनाम (Designation) *' : 'Designation *'}
                </label>
                <select
                  value={assignedDesignation}
                  onChange={(e) => setAssignedDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="Head Teacher">Head Teacher / In-charge</option>
                  <option value="Assistant Teacher (Upper Primary)">Assistant Teacher (Upper Primary)</option>
                  <option value="Assistant Teacher (Primary)">Assistant Teacher (Primary)</option>
                  <option value="Shiksha Mitra / Parateacher">Shiksha Mitra / Parateacher</option>
                  <option value="Physical Education Instructor">Physical Education Instructor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'शैक्षणिक योग्यता *' : 'Academic Qualifications *'}
                </label>
                <input
                  type="text"
                  required
                  value={assignedQualification}
                  onChange={(e) => setAssignedQualification(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'विशेषज्ञता / अध्यापन विषय' : 'Specialization & Subjects'}
              </label>
              <input
                type="text"
                value={assignedSpecialization}
                onChange={(e) => setAssignedSpecialization(e.target.value)}
                placeholder="e.g. Mathematics, Science, Environmental Studies"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'प्रारंभिक पासवर्ड (Initial Password)' : 'Initial Password'}
              </label>
              <input
                type="text"
                value={initialPassword}
                onChange={(e) => setInitialPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApprovalModalReq(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                {language === 'hi' ? 'रद्द करें' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isProcessingApproval}
                onClick={handleConfirmApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {isProcessingApproval ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{language === 'hi' ? 'अनुमोदित करें व सक्रिय करें' : 'Authorize & Activate Teacher'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={!!rejectModalReq}
        onClose={() => setRejectModalReq(null)}
        title={language === 'hi' ? 'शिक्षक पंजीकरण अस्वीकरण' : 'Reject Teacher Registration'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            {language === 'hi' 
              ? `क्या आप वाकई ${rejectModalReq?.fullName} का शिक्षक पंजीकरण आवेदन अस्वीकृत करना चाहते हैं?`
              : `Are you sure you want to reject registration for ${rejectModalReq?.fullName}?`}
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'hi' ? 'अस्वीकृति का कारण (Rejection Reason)' : 'Rejection Reason'}
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Employee ID not matching BSA records / Duplicate registration"
              rows={3}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setRejectModalReq(null)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              onClick={handleConfirmRejection}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'अस्वीकृत करें' : 'Confirm Rejection'}
            </button>
          </div>
        </div>
      </Modal>

      {/* OFFICIAL CREDENTIAL SLIP MODAL */}
      <Modal
        isOpen={!!credentialSlip}
        onClose={() => setCredentialSlip(null)}
        title={language === 'hi' ? 'शिक्षक आधिकारिक लॉगिन पर्ची (Official Slip)' : 'Official Faculty Login Authorization Slip'}
        maxWidth="lg"
      >
        {credentialSlip && (
          <div className="space-y-4">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-3 font-mono">
              <div className="text-center border-b border-slate-800 pb-3">
                <div className="text-amber-400 font-black text-sm">
                  {settings.schoolName.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-400">
                  UDISE: {settings.schoolCode} • Basic Education Department UP
                </div>
                <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  OFFICIAL TEACHER ACCESS PASS
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">Teacher Name:</span>
                  <span className="text-white font-bold">{credentialSlip.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">Designation:</span>
                  <span className="text-amber-400 font-bold">{credentialSlip.designation}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">Employee / EHMS ID:</span>
                  <span className="text-white">{credentialSlip.employeeId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">Portal Login ID:</span>
                  <span className="text-amber-400 font-black text-sm">{credentialSlip.username}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/60 pb-1">
                  <span className="text-slate-400">Security Password:</span>
                  <span className="text-emerald-400 font-bold">{credentialSlip.temporaryPassword || 'Teacher@2026'}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Role on Login:</span>
                  <span className="text-white">Teacher / Staff (शिक्षक)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                {copiedSlip ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    <span>{language === 'hi' ? 'विवरण कॉपी हो गया!' : 'Credentials Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{language === 'hi' ? 'लॉगिन विवरण कॉपी करें' : 'Copy Login Details'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setCredentialSlip(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {language === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PASSWORD RESET MODAL FOR FACULTY */}
      <Modal
        isOpen={!!resetModalTeacher}
        onClose={() => {
          setResetModalTeacher(null);
          setResetSuccessMsg(null);
        }}
        title={language === 'hi' ? `शिक्षक पासवर्ड रीसेट: ${resetModalTeacher?.name}` : `Reset Password: ${resetModalTeacher?.name}`}
        maxWidth="md"
      >
        <form onSubmit={handleResetTeacherPassword} className="space-y-4">
          {resetSuccessMsg ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetSuccessMsg}</span>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-600">
                {language === 'hi' 
                  ? `शिक्षक ${resetModalTeacher?.name} (${resetModalTeacher?.employeeId}) के लिए नया पासवर्ड सेट करें:` 
                  : `Enter a new login password for faculty member ${resetModalTeacher?.name}:`}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'hi' ? 'नया पासवर्ड (New Password) *' : 'New Password *'}
                </label>
                <input
                  type="text"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="e.g. Teacher@2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                >
                  {language === 'hi' ? 'पासवर्ड सुरक्षित करें' : 'Save New Password'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* ADD NEW FACULTY MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={language === 'hi' ? 'नए शिक्षक / स्टॉफ की नियुक्ति करें' : 'Appoint New Teaching Faculty'}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'कर्मचारी/ईएचएमएस आईडी *' : 'Employee / EHMS ID *'}
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'शिक्षक का पूरा नाम *' : 'Teacher Full Name *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Smt. Sunita Devi"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'ईमेल आईडी *' : 'Email Address *'}
              </label>
              <input
                type="email"
                required
                placeholder="teacher@school.gov.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर *' : 'Phone Number *'}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'पदनाम *' : 'Designation *'}
              </label>
              <select
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              >
                <option value="Head Teacher">Head Teacher / In-charge</option>
                <option value="Assistant Teacher (Upper Primary)">Assistant Teacher (Upper Primary)</option>
                <option value="Assistant Teacher (Primary)">Assistant Teacher (Primary)</option>
                <option value="Shiksha Mitra / Parateacher">Shiksha Mitra / Parateacher</option>
                <option value="Physical Education Instructor">Physical Education Instructor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'शैक्षणिक योग्यता *' : 'Academic Qualifications *'}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. M.A, B.Ed (Basic Education)"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'hi' ? 'विषय विशेषज्ञता' : 'Subject Specialization'}
            </label>
            <input
              type="text"
              placeholder="e.g. Mathematics, Science, Sanskrit, Social Studies"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Credentials and Security Settings for Faculty */}
          <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-black text-amber-950 block">
                  {language === 'hi' ? 'शिक्षक यूजरनेम व लॉगिन पासवर्ड (Admin Controlled Credentials)' : 'Faculty Login ID & Security Password'}
                </span>
                <span className="text-[11px] text-amber-800">
                  {language === 'hi' ? 'शिक्षक स्वयं खाता नहीं बना सकते, एडमिन द्वारा ही यूजरनेम/पासवर्ड सृजित होगा' : 'Teachers cannot self-register; Admin creates and manages their login credentials directly.'}
                </span>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.autoCreateLogin}
                  onChange={(e) => setFormData({ ...formData, autoCreateLogin: e.target.checked })}
                  className="w-4 h-4 accent-amber-600 rounded"
                />
                <span className="text-xs font-bold text-amber-900">{language === 'hi' ? 'सक्रिय लॉगिन बनाएं' : 'Enable Portal Login'}</span>
              </label>
            </div>

            {formData.autoCreateLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200">
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    {language === 'hi' ? 'पोर्टल यूजरनेम (Username ID)' : 'Portal Username'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toUpperCase() })}
                    placeholder="TCH-2026-001"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">
                    {language === 'hi' ? 'प्रारंभिक पासवर्ड (Password)' : 'Initial Password'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.initialPassword}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    placeholder="Teacher@2026"
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Privacy & Public Website Display Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'hi' ? 'वेबसाइट प्रदर्शन एवं गोपनीयता सेटिंग्स (Website Display & Privacy)' : 'Website Directory & Privacy Controls'}</span>
            </div>

            <label className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnWebsite}
                onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {language === 'hi' ? 'वेबसाइट के "शिक्षक एवं स्टॉफ" अनुभाग में प्रदर्शित करें' : 'Show in Website Faculty Section / Directory'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'वेबसाइट पर शिक्षक का नाम, पदनाम, योग्यता एवं फोटो दिखाई देगा' : 'Teacher name, designation, qualification and photo will be visible publicly.'}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPhonePublicly}
                onChange={(e) => setFormData({ ...formData, showPhonePublicly: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {language === 'hi' ? 'वेबसाइट पर शिक्षक का मोबाइल नंबर सार्वजनिक प्रदर्शित करें' : 'Display Mobile Number Publicly on Website'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'यदि शिक्षक अनुमति दें तो अभिभावकों/जनता हेतु मोबाइल नंबर दृश्यमान रहेगा, अन्यथा गोपनीय रहेगा' : 'Mobile number will only be visible if allowed; otherwise kept private.'}
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer"
            >
              {language === 'hi' ? 'शिक्षक रिकॉर्ड सुरक्षित करें' : 'Save Faculty Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT FACULTY MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={language === 'hi' ? `शिक्षक विवरण संपादन: ${selectedTeacher?.name}` : `Edit Faculty Record: ${selectedTeacher?.name}`}
        maxWidth="xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'कर्मचारी आईडी' : 'Employee ID'}
              </label>
              <input
                type="text"
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'पूरा नाम' : 'Full Name'}
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'ईमेल आईडी' : 'Email Address'}
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'मोबाइल नंबर' : 'Phone'}
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'पदनाम' : 'Designation'}
              </label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'hi' ? 'योग्यता' : 'Qualification'}
              </label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'hi' ? 'विशेषज्ञता' : 'Specialization'}
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Privacy & Public Website Display Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="text-xs font-bold text-slate-900 mb-1 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'hi' ? 'वेबसाइट प्रदर्शन एवं गोपनीयता सेटिंग्स (Website Display & Privacy)' : 'Website Directory & Privacy Controls'}</span>
            </div>

            <label className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showOnWebsite}
                onChange={(e) => setFormData({ ...formData, showOnWebsite: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-blue-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {language === 'hi' ? 'वेबसाइट के "शिक्षक एवं स्टॉफ" अनुभाग में प्रदर्शित करें' : 'Show in Website Faculty Section / Directory'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'वेबसाइट पर शिक्षक का नाम, पदनाम, योग्यता एवं फोटो दिखाई देगा' : 'Teacher name, designation, qualification and photo will be visible publicly.'}
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-slate-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPhonePublicly}
                onChange={(e) => setFormData({ ...formData, showPhonePublicly: e.target.checked })}
                className="w-4 h-4 mt-0.5 accent-emerald-600 rounded"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {language === 'hi' ? 'वेबसाइट पर शिक्षक का मोबाइल नंबर सार्वजनिक प्रदर्शित करें' : 'Display Mobile Number Publicly on Website'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'यदि शिक्षक अनुमति दें तो अभिभावकों/जनता हेतु मोबाइल नंबर दृश्यमान रहेगा, अन्यथा गोपनीय रहेगा' : 'Mobile number will only be visible if allowed; otherwise kept private.'}
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              {language === 'hi' ? 'अपडेट सुरक्षित करें' : 'Update Faculty Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
