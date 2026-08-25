import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  ShieldCheck, 
  Search, 
  KeyRound, 
  CheckCircle2, 
  Trash2, 
  Lock, 
  GraduationCap, 
  AlertCircle, 
  UserPlus, 
  Clock, 
  ShieldAlert,
  Send,
  Sparkles,
  Ban,
  Activity,
  History,
  Check,
  X,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Student360Modal } from '../common/Student360Modal';
import { UserProfile, UserRole, AccountStatus, RegistrationRequest, Student } from '../../types';

export const AdminUsers: React.FC = () => {
  const { 
    allUsers, 
    userProfile, 
    registrationRequests,
    securityLogs,
    updateUserStatus, 
    updateUserRole, 
    deleteUserAccount, 
    resetUserPasswordByAdmin,
    createTeacherDirectly,
    approveRegistrationRequest,
    rejectRegistrationRequest
  } = useAuth();
  const { settings, students, addStudent, teachers, addTeacher } = useSchool();

  // Active Sub-Tab: 'users' | 'approvals' | 'security'
  const [activeTab, setActiveTab] = useState<'users' | 'approvals' | 'security'>('users');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');

  // 360 Student Profile Modal state
  const [selectedStudent360, setSelectedStudent360] = useState<Student | null>(null);
  const [selectedPendingReq, setSelectedPendingReq] = useState<RegistrationRequest | null>(null);
  const [is360ModalOpen, setIs360ModalOpen] = useState(false);

  // Direct Teacher Creation Modal State
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [tName, setTName] = useState('');
  const [tEmpId, setTEmpId] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPhone, setTPhone] = useState('');
  const [tDesignation, setTDesignation] = useState('Assistant Teacher (Primary)');
  const [tSubject, setTSubject] = useState('Mathematics & Environmental Studies');
  const [tQualification, setTQualification] = useState('B.Ed, B.Sc (TET Qualified)');
  const [tSpecialization, setTSpecialization] = useState('Elementary Education');
  const [tTempPassword, setTTempPassword] = useState('GovTeacher@2026');
  const [tLoading, setTLoading] = useState(false);
  const [tError, setTError] = useState<string | null>(null);
  const [tCreatedResult, setTCreatedResult] = useState<{ username: string; tempPass: string } | null>(null);

  // Approval / Rejection Modal State
  const [rejectModalReq, setRejectModalReq] = useState<RegistrationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Enrolment credentials could not be matched with school master records.');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Reset Password Modal State
  const [resetModalUser, setResetModalUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forceChangeToggle, setForceChangeToggle] = useState(true);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Delete confirmation
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UserProfile | null>(null);

  // Filtered users list
  const filteredUsers = allUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      u.name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.admissionNumber && u.admissionNumber.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingRequests = registrationRequests.filter(r => r.status === 'PENDING');

  const handleDirectCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setTError(null);
    setTLoading(true);

    const res = await createTeacherDirectly({
      fullName: tName.trim(),
      employeeId: tEmpId.trim() || `TCH-2026-00${allUsers.filter(u => u.role === 'teacher').length + 1}`,
      designation: tDesignation,
      subject: tSubject,
      qualification: tQualification,
      specialization: tSpecialization,
      phone: tPhone.trim(),
      email: tEmail.trim().toLowerCase(),
      temporaryPassword: tTempPassword.trim()
    });

    setTLoading(false);

    if (res.success && res.generatedUsername) {
      setTCreatedResult({
        username: res.generatedUsername,
        tempPass: tTempPassword.trim()
      });
      // reset form
      setTName('');
      setTEmpId('');
      setTEmail('');
      setTPhone('');
    } else {
      setTError(res.error || 'Failed to create teacher account.');
    }
  };

  const handleApprove = async (req: RegistrationRequest) => {
    setActionSuccessMsg(null);
    const res = await approveRegistrationRequest(req.id);
    if (res.success) {
      if (req.requestedRole === 'student') {
        const existingStudent = students.find(s => 
          (req.admissionNumber && s.admissionNumber.toLowerCase() === req.admissionNumber.toLowerCase()) ||
          (s.name.toLowerCase() === req.fullName.toLowerCase() && s.classNumber === (req.classNumber || 1))
        );

        if (!existingStudent) {
          const classNum = req.classNumber || 1;
          const secName = req.sectionName || 'A';
          addStudent({
            studentId: req.preferredUsername,
            admissionNumber: req.admissionNumber || `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
            registrationNumber: `SRN-${new Date().getFullYear()}-${String(classNum).padStart(2, '0')}${String(students.length + 1).padStart(2, '0')}`,
            name: req.fullName,
            dateOfBirth: req.dateOfBirth || '2015-01-01',
            dob: req.dateOfBirth || '2015-01-01',
            gender: 'Male',
            classId: `class-${classNum}`,
            classNumber: classNum,
            sectionId: `sec-${classNum}-${secName}`,
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
      } else if (req.requestedRole === 'teacher') {
        const existingTeacher = teachers.find(t =>
          (req.employeeId && t.employeeId?.toLowerCase() === req.employeeId.toLowerCase()) ||
          (t.name.toLowerCase() === req.fullName.toLowerCase())
        );

        if (!existingTeacher) {
          addTeacher({
            employeeId: req.employeeId || req.preferredUsername,
            name: req.fullName,
            email: req.email || '',
            phone: req.phone || '',
            designation: req.designation || 'Assistant Teacher (Primary)',
            qualification: req.qualification || 'B.Ed, TET Qualified',
            specialization: req.specialization || req.subject || 'Elementary Education',
            joiningDate: new Date().toISOString().split('T')[0],
            address: 'School Campus, Farrukhabad UP',
            photoURL: '',
            status: 'active'
          });
        }
      }

      setActionSuccessMsg(`Approved request for ${req.fullName}. User account provisioned with Login ID: ${req.preferredUsername}.`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
    }
  };

  const openStudent360ForRequest = (req: RegistrationRequest) => {
    const existing = students.find(s => 
      (req.admissionNumber && s.admissionNumber.toLowerCase() === req.admissionNumber.toLowerCase()) ||
      (s.name.toLowerCase() === req.fullName.toLowerCase() && s.classNumber === (req.classNumber || 1))
    );

    const classNum = req.classNumber || 1;
    const secName = req.sectionName || 'A';

    const studentObj: Student = existing || {
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
      rollNumber: '01',
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

    setSelectedStudent360(studentObj);
    setSelectedPendingReq(req);
    setIs360ModalOpen(true);
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReq) return;

    await rejectRegistrationRequest(rejectModalReq.id, rejectionReason.trim());
    setRejectModalReq(null);
    setActionSuccessMsg(`Registration request for ${rejectModalReq.fullName} rejected.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !newPassword.trim()) return;

    await resetUserPasswordByAdmin(resetModalUser.uid, newPassword.trim(), forceChangeToggle);
    setResetSuccess(true);
    setTimeout(() => {
      setResetModalUser(null);
      setResetSuccess(false);
      setNewPassword('');
    }, 1500);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmUser) return;
    await deleteUserAccount(deleteConfirmUser.uid);
    setDeleteConfirmUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Access Control (RBAC) & Accounts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            User Accounts & Security Console
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Directly provision teacher accounts, verify pending student/teacher registration applications, and manage passwords and security privileges for <strong>{settings.schoolName}</strong>.
          </p>
        </div>

        {/* Top Action Button */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={() => {
              setTCreatedResult(null);
              setIsCreateTeacherOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Provision Teacher Account</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Main Tab Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>User Accounts Directory</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-white text-[10px] font-mono">
              {allUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 relative ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Registration Approvals</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
                {pendingRequests.length} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authentication & Security Logs</span>
          </button>
        </div>
      </div>

      {/* TAB 1: USER ACCOUNTS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Name, Username (8090538115, TCH-...), or ID..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Roles (सभी भूमिकाएं)</option>
                <option value="admin">Head Teacher (प्रधानाध्यापिका)</option>
                <option value="teacher">Teachers (शिक्षक)</option>
                <option value="student">Students (छात्र)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active (सक्रिय)</option>
                <option value="pending">Pending (लंबित)</option>
                <option value="suspended">Suspended / Deactivated</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">User / Official Profile</th>
                    <th className="py-3 px-4">Login Username</th>
                    <th className="py-3 px-4">Role & Authority</th>
                    <th className="py-3 px-4">Linked ID / Class</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Security State</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                        No user accounts match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.uid} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                              u.role === 'admin' 
                                ? 'bg-amber-100 text-amber-800' 
                                : u.role === 'teacher' 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {u.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{u.name}</div>
                              <div className="text-[11px] text-slate-400">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Login Username */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {u.username}
                          </span>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                              <ShieldCheck className="w-3 h-3 text-amber-700" />
                              <span>Head Teacher</span>
                            </span>
                          ) : u.role === 'teacher' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <Users className="w-3 h-3 text-emerald-700" />
                              <span>Teacher</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                              <GraduationCap className="w-3 h-3 text-blue-700" />
                              <span>Student</span>
                            </span>
                          )}
                        </td>

                        {/* Linked ID / Class */}
                        <td className="py-3.5 px-4">
                          {u.role === 'student' ? (
                            <span className="text-slate-600 font-medium">
                              Class {u.classNumber || 5}-{u.sectionName || 'A'} • {u.admissionNumber || 'ADM'}
                            </span>
                          ) : u.role === 'teacher' ? (
                            <span className="text-slate-600 font-medium">
                              {u.employeeId || 'TCH'} • {u.designation || 'Faculty'}
                            </span>
                          ) : (
                            <span className="text-slate-600 font-medium">
                              UDISE: {settings.udiseCode}
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          <select
                            value={u.status}
                            disabled={u.role === 'admin' && u.uid === userProfile?.uid}
                            onChange={(e) => updateUserStatus(u.uid, e.target.value as AccountStatus)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold border ${
                              u.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : u.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="disabled">Disabled</option>
                          </select>
                        </td>

                        {/* Security State */}
                        <td className="py-3.5 px-4">
                          {u.mustChangePassword ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Temp Password</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                              <span>Secured</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setNewPassword('');
                                setForceChangeToggle(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                              title="Reset Password"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            {u.role !== 'admin' && (
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REGISTRATION APPROVALS QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Pending Registration Verification Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect applicant credentials and approve or reject access requests.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200">
              {pendingRequests.length} Awaiting Verification
            </div>
          </div>

          {registrationRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 font-medium">
              No registration requests submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrationRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={`p-5 rounded-2xl border transition-all ${
                    req.status === 'PENDING'
                      ? 'bg-white border-amber-300 shadow-md'
                      : req.status === 'APPROVED'
                      ? 'bg-slate-50/80 border-emerald-200 opacity-80'
                      : 'bg-slate-50/80 border-rose-200 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                        req.requestedRole === 'teacher' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.requestedRole === 'teacher' ? <Users className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{req.fullName}</h4>
                        <span className="text-[11px] font-mono font-bold text-amber-700">
                          {req.preferredUsername}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      req.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 animate-pulse'
                        : req.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role Applied:</span>
                      <span className="font-bold text-slate-800 capitalize">{req.requestedRole}</span>
                    </div>

                    {req.requestedRole === 'student' ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Admission / SR No:</span>
                          <span className="font-mono font-bold text-slate-900">{req.admissionNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Class & Section:</span>
                          <span className="font-semibold text-slate-800">Class {req.classNumber}-{req.sectionName}</span>
                        </div>
                        {req.fatherName && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Father/Guardian:</span>
                            <span className="text-slate-700">{req.fatherName}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Employee ID:</span>
                          <span className="font-mono font-bold text-slate-900">{req.employeeId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Designation & Subject:</span>
                          <span className="font-semibold text-slate-800">{req.designation} ({req.subject})</span>
                        </div>
                        {req.qualification && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">Qualification:</span>
                            <span className="text-slate-700">{req.qualification}</span>
                          </div>
                        )}
                      </>
                    )}

                    <div className="flex justify-between">
                      <span className="text-slate-500">Contact:</span>
                      <span className="text-slate-700">{req.phone || req.email}</span>
                    </div>

                    <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Submitted:</span>
                      <span>{new Date(req.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Actions for Pending */}
                  {req.status === 'PENDING' && (
                    <div className="mt-4 space-y-2">
                      {req.requestedRole === 'student' && (
                        <button
                          type="button"
                          onClick={() => openStudent360ForRequest(req)}
                          className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View 360° Profile & Vault</span>
                        </button>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(req)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve & Activate</span>
                        </button>

                        <button
                          onClick={() => setRejectModalReq(req)}
                          className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SECURITY & AUTHENTICATION AUDIT LOGS */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Security & Authentication Event History
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Immutable audit trail of portal logins, security lockouts, and credential modifications.
              </p>
            </div>
            <div className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-xl">
              {securityLogs.length} Events Logged
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Username / Actor</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Event Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {log.username}
                      </td>
                      <td className="py-3 px-4 uppercase text-slate-600">
                        {log.role}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {log.action}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'BLOCKED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Direct Teacher Creation Modal */}
      <Modal
        isOpen={isCreateTeacherOpen}
        onClose={() => setIsCreateTeacherOpen(false)}
        title="Provision Teacher Account (Head Teacher Action)"
      >
        {tCreatedResult ? (
          <div className="space-y-4 text-center py-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-black text-slate-900">
              Teacher Account Successfully Provisioned
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-500">Generated Login ID:</span>
                <span className="font-mono font-bold text-amber-700">{tCreatedResult.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Temporary Password:</span>
                <span className="font-mono font-bold text-slate-900">{tCreatedResult.tempPass}</span>
              </div>
              <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                <strong>Mandatory Update:</strong> Teacher will be forced to change this temporary password upon their first login.
              </div>
            </div>
            <button
              onClick={() => setIsCreateTeacherOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleDirectCreateTeacher} className="space-y-4">
            <div className="text-xs text-slate-600 leading-relaxed">
              Create an official faculty account with auto-generated Login ID (e.g. <code>TCH-2026-00X</code>) and a temporary access key.
            </div>

            {tError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{tError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name *</label>
                <input
                  type="text"
                  value={tName}
                  onChange={(e) => setTName(e.target.value)}
                  placeholder="e.g. Smt. Neha Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Employee / Staff ID</label>
                <input
                  type="text"
                  value={tEmpId}
                  onChange={(e) => setTEmpId(e.target.value)}
                  placeholder="e.g. TCH-2026-005"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official / Contact Email *</label>
                <input
                  type="email"
                  value={tEmail}
                  onChange={(e) => setTEmail(e.target.value)}
                  placeholder="neha.sharma@school.gov.in"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={tPhone}
                  onChange={(e) => setTPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                <select
                  value={tDesignation}
                  onChange={(e) => setTDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                >
                  <option value="Assistant Teacher (Primary)">Assistant Teacher (Primary)</option>
                  <option value="Assistant Teacher (Upper Primary)">Assistant Teacher (Upper Primary)</option>
                  <option value="Shiksha Mitra">Shiksha Mitra</option>
                  <option value="Special Educator">Special Educator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teaching Subjects</label>
                <input
                  type="text"
                  value={tSubject}
                  onChange={(e) => setTSubject(e.target.value)}
                  placeholder="e.g. Science & Mathematics"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Temporary Password *</label>
              <input
                type="text"
                value={tTempPassword}
                onChange={(e) => setTTempPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-amber-800 focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setIsCreateTeacherOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={tLoading}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs"
              >
                {tLoading ? 'Provisioning...' : 'Provision Teacher'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reject Request Modal */}
      <Modal
        isOpen={!!rejectModalReq}
        onClose={() => setRejectModalReq(null)}
        title="Reject Registration Request"
      >
        {rejectModalReq && (
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              Please specify the official reason for rejecting the registration of <strong>{rejectModalReq.fullName}</strong> ({rejectModalReq.preferredUsername}):
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-rose-500"
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectModalReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={!!resetModalUser}
        onClose={() => setResetModalUser(null)}
        title={`Reset Password for ${resetModalUser?.name}`}
      >
        {resetSuccess ? (
          <div className="text-center py-4 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="text-xs font-bold text-slate-900">Password Updated Successfully</p>
          </div>
        ) : (
          <form onSubmit={handleExecutePasswordReset} className="space-y-4">
            <div className="text-xs text-slate-600">
              Account Login ID: <span className="font-mono font-bold text-slate-900">{resetModalUser?.username}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Assigned Password *
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 chars)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-amber-500"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={forceChangeToggle}
                onChange={(e) => setForceChangeToggle(e.target.checked)}
                className="rounded text-amber-500 focus:ring-0"
              />
              <span>Force user to change password on next login</span>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Are you sure you want to permanently revoke credentials for <strong>{deleteConfirmUser?.name}</strong> ({deleteConfirmUser?.username})?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteConfirmUser(null)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteDelete}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
            >
              Revoke & Delete
            </button>
          </div>
        </div>
      </Modal>
      {/* Student 360° Profile Modal */}
      {selectedStudent360 && is360ModalOpen && (
        <Student360Modal
          student={selectedStudent360}
          isOpen={is360ModalOpen}
          onClose={() => {
            setIs360ModalOpen(false);
            setSelectedStudent360(null);
            setSelectedPendingReq(null);
          }}
          pendingRequest={selectedPendingReq}
          onApproveRequest={async (reqId) => {
            const req = registrationRequests.find(r => r.id === reqId);
            if (req) {
              await handleApprove(req);
              setIs360ModalOpen(false);
              setSelectedStudent360(null);
              setSelectedPendingReq(null);
            }
          }}
          onRejectRequest={async (reqId, reason) => {
            await rejectRegistrationRequest(reqId, reason);
            setIs360ModalOpen(false);
            setSelectedStudent360(null);
            setSelectedPendingReq(null);
            setActionSuccessMsg('Registration request rejected.');
          }}
          canManageDocuments={true}
        />
      )}
    </div>
  );
};
