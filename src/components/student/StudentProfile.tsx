import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { StudentDocument } from '../../types';
import { 
  User, 
  Printer, 
  ShieldCheck, 
  FileText, 
  Calendar, 
  MapPin, 
  Phone, 
  Heart, 
  Eye, 
  CheckCircle2, 
  Camera, 
  Upload, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Edit3,
  Save,
  X,
  Download,
  RefreshCw,
  Building2,
  GraduationCap,
  Layers,
  BookOpen,
  FileCheck,
  CreditCard,
  UserCheck,
  Mail,
  KeyRound,
  Zap
} from 'lucide-react';
import { StudentEmailVerificationModal } from '../common/StudentEmailVerificationModal';
import { StudentIdCardPrint } from '../common/StudentIdCardPrint';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { UserAvatar } from '../common/UserAvatar';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { Student360Modal } from '../common/Student360Modal';
import { downloadDocumentFile } from '../../utils/fileDownloader';
import { resolveCurrentStudent } from '../../utils/studentUtils';

interface StudentProfileProps {
  onNavigateTab?: (tab: string) => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ onNavigateTab }) => {
  const { userProfile, updateStudentProfile, isEmailVerified, checkAndReloadEmailVerification, instantVerifyStudentEmail } = useAuth();
  const { students, documents, settings, language, updateStudent } = useSchool();

  const currentStudent = resolveCurrentStudent(userProfile, students);
  const myDocs = documents.filter(d => d.studentId === currentStudent?.id || d.studentName === currentStudent?.name);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [is360Open, setIs360Open] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [instantLoading, setInstantLoading] = useState(false);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<StudentDocument | null>(null);
  const [activeTab, setActiveTab] = useState<'biodata' | 'academic' | 'contact' | 'docs'>('biodata');

  const handleInstantVerify = async () => {
    setInstantLoading(true);
    await instantVerifyStudentEmail();
    setInstantLoading(false);
  };

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editFullName, setEditFullName] = useState(currentStudent?.name || '');
  const [editFatherName, setEditFatherName] = useState(currentStudent?.fatherName || '');
  const [editMotherName, setEditMotherName] = useState(currentStudent?.motherName || '');
  const [editPhone, setEditPhone] = useState(currentStudent?.phone || currentStudent?.mobile || '');
  const [editAddress, setEditAddress] = useState(currentStudent?.address || '');
  const [editBloodGroup, setEditBloodGroup] = useState(currentStudent?.bloodGroup || 'O+');
  const [editDob, setEditDob] = useState(currentStudent?.dob || currentStudent?.dateOfBirth || '2015-05-15');
  const [editGender, setEditGender] = useState<'Male' | 'Female' | 'Other'>(currentStudent?.gender || 'Male');
  const [editCategory, setEditCategory] = useState(currentStudent?.category || 'General');
  const [editAadhaar, setEditAadhaar] = useState(currentStudent?.aadhaarNumber || '');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditFullName(currentStudent?.name || currentStudent?.fullName || '');
    setEditFatherName(currentStudent?.fatherName || '');
    setEditMotherName(currentStudent?.motherName || '');
    setEditPhone(currentStudent?.phone || currentStudent?.mobile || '');
    setEditAddress(currentStudent?.address || '');
    setEditBloodGroup(currentStudent?.bloodGroup || 'O+');
    setEditDob(currentStudent?.dob || currentStudent?.dateOfBirth || '2015-05-15');
    setEditGender(currentStudent?.gender || 'Male');
    setEditCategory(currentStudent?.category || 'General');
    setEditAadhaar(currentStudent?.aadhaarNumber || '');
    setIsEditing(true);
    setSaveSuccessMsg(null);
  };

  const handleSaveProfile = async () => {
    if (!currentStudent) return;
    setIsSaving(true);
    const resolvedName = (editFullName.trim() || currentStudent.name).trim();
    const updatedData = {
      name: resolvedName,
      fullName: resolvedName,
      fatherName: editFatherName.trim(),
      motherName: editMotherName.trim(),
      guardianName: editFatherName.trim() || currentStudent.guardianName || editFatherName.trim(),
      phone: editPhone.trim(),
      mobile: editPhone.trim(),
      address: editAddress.trim(),
      bloodGroup: editBloodGroup,
      dob: editDob,
      dateOfBirth: editDob,
      gender: editGender,
      category: editCategory,
      aadhaarNumber: editAadhaar.trim()
    };

    // Update in Auth Context (Firestore users/{uid} & students/{uid})
    if (userProfile?.uid) {
      await updateStudentProfile(userProfile.uid, updatedData);
    }
    // Update in School Context state
    updateStudent(currentStudent.id, updatedData);

    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccessMsg(language === 'hi' ? 'विवरण सफलतापूर्वक सहेज लिया गया। आपका पहचान पत्र (ID Card) नवीनतम विवरणों के साथ स्वतः अपडेट हो गया है।' : 'Profile details updated successfully. Your official ID card is now updated with these details.');
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const verifiedCount = myDocs.filter(d => d.verificationStatus === 'VERIFIED' || d.verified).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-200 mb-1.5 shadow-xs">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद पंजीकृत छात्र' : 'UP Basic Education Board Enrolled Student'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'छात्र आधिकारिक प्रोफाइल एवं विवरण' : 'Student Official Profile & Biodata'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'hi' ? 'सत्यापित शैक्षणिक पहचान, डिजिटल आईडी कार्ड एवं दस्तावेज़ लॉकर' : 'Verified academic identity, digital ID card credentials & certificate vault'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentStudent && (
            <button
              onClick={() => setIs360Open(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? '360° समग्र डॉसियर' : '360° Dossier'}</span>
            </button>
          )}

          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'hi' ? 'विवरण संपादित करें' : 'Edit Biodata'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>रद्द करें</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setIsPrintOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'आईडी कार्ड प्रिंट' : 'Print ID Card'}</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Main Student Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-800 relative">
          
          {/* Student Photo */}
          <div className="relative group shrink-0">
            <UserAvatar
              userProfile={userProfile}
              photoURL={currentStudent?.photoURL}
              name={currentStudent?.name || userProfile?.name}
              role="student"
              size="2xl"
              onClick={() => setIsPhotoModalOpen(true)}
            />

            <button
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Update Student Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Student Name & Core Info */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enrolled Student • Session {settings.academicYear || '2025-2026'}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700">
                Roll #{currentStudent?.rollNumber || '01'}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold border border-slate-700">
                ID: {currentStudent?.studentId || 'STU-001'}
              </span>
            </div>

            {isEditing ? (
              <div className="pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {language === 'hi' ? 'छात्र का पूरा नाम (Official Name)' : 'Student Full Name'}
                </label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full max-w-md px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-base font-bold text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{currentStudent?.name}</h3>
                <p className="text-sm font-semibold text-slate-300">
                  Class {currentStudent?.classNumber} - Section '{currentStudent?.sectionName}' • Reg No: <span className="font-mono text-amber-300">{currentStudent?.registrationNumber || currentStudent?.admissionNumber}</span>
                </p>
              </>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-400 pt-1 font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {settings.schoolName}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {currentStudent?.address || `${settings.block}, ${settings.district}`}
              </span>
            </div>
          </div>

        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('biodata')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'biodata'
                ? 'border-indigo-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{language === 'hi' ? 'व्यक्तिगत विवरण (Biodata)' : 'Personal Biodata'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academic')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'academic'
                ? 'border-indigo-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>{language === 'hi' ? 'शैक्षणिक एवं कक्षा विवरण' : 'Academic & Class'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'contact'
                ? 'border-indigo-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{language === 'hi' ? 'अभिभावक एवं पता' : 'Guardian & Address'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'docs'
                ? 'border-indigo-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्रमाणपत्र लॉकर' : 'Document Vault'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-800 text-[10px]">
              {myDocs.length}
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* TAB: Biodata */}
          {activeTab === 'biodata' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Father's Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editFatherName}
                      onChange={(e) => setEditFatherName(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentStudent?.fatherName}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Mother's Name</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editMotherName}
                      onChange={(e) => setEditMotherName(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentStudent?.motherName}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Date of Birth (DOB)</span>
                  {isEditing ? (
                    <input
                      type="date"
                      value={editDob}
                      onChange={(e) => setEditDob(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentStudent?.dob || currentStudent?.dateOfBirth}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Gender & Blood Group</span>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <select
                        value={editBloodGroup}
                        onChange={(e) => setEditBloodGroup(e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <span>{currentStudent?.gender}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-black border border-rose-200">
                        {currentStudent?.bloodGroup || 'O+'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Social Category</span>
                  {isEditing ? (
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      {['General', 'OBC', 'SC', 'ST', 'EWS'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentStudent?.category || 'General'}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Aadhaar (UIDAI Number)</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editAadhaar}
                      onChange={(e) => setEditAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm">{currentStudent?.aadhaarNumber || 'Not Linked'}</div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: Academic */}
          {activeTab === 'academic' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Class & Section</span>
                  <div className="font-bold text-slate-900 text-sm">Class {currentStudent?.classNumber} - Section '{currentStudent?.sectionName}'</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Roll Number</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">#{currentStudent?.rollNumber}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Admission / Registration No.</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">{currentStudent?.registrationNumber || currentStudent?.admissionNumber}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Current Academic Session</span>
                  <div className="font-bold text-slate-900 text-sm">{settings.academicYear || '2025-2026'}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">School U-DISE Code</span>
                  <div className="font-mono font-bold text-amber-700 text-sm">{settings.schoolCode}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Enrollment Status</span>
                  <div className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Active & Verified</span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB: Contact & Address */}
          {activeTab === 'contact' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Emergency Contact Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm">{currentStudent?.phone || currentStudent?.mobile}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Parent / Guardian Name</span>
                  <div className="font-bold text-slate-900 text-sm">{currentStudent?.fatherName || currentStudent?.guardianName}</div>
                </div>

                {/* Email and Verification Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Registered Email Address & Verification</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isEmailVerified 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{isEmailVerified ? (language === 'hi' ? 'सत्यापित ईमेल' : 'Verified Email') : (language === 'hi' ? 'सत्यापन लंबित' : 'Pending OTP Verification')}</span>
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
                    <div className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{userProfile?.email || currentStudent?.email || 'student@school.gov.in'}</span>
                    </div>
                    {!isEmailVerified && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsVerificationModalOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                          <span>{language === 'hi' ? '6-अंकों का कोड दर्ज करें' : 'Verify OTP'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleInstantVerify}
                          disabled={instantLoading}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                          title="Instant 1-Click Verification"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>{instantLoading ? '...' : (language === 'hi' ? '⚡ 1-क्लिक सत्यापन' : '⚡ Instant Verify')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Full Residential Address</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentStudent?.address}</div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: Document Locker */}
          {activeTab === 'docs' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  {language === 'hi' ? 'अपलोड किए गए दस्तावेज़ एवं सत्यापन स्थिति' : 'Uploaded Certificates & Verification Records'}
                </span>
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('documents')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{language === 'hi' ? 'दस्तावेज़ लॉकर खोलें' : 'Open Vault & Upload'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myDocs.map((doc) => {
                  const isVerified = (doc.verificationStatus === 'VERIFIED' || doc.verified) && !doc.hasPendingUpdate;
                  return (
                    <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:border-amber-400 transition-colors shadow-2xs">
                      <div className="space-y-1 min-w-0 pr-2">
                        <span className="font-bold text-slate-900 block truncate">{doc.title}</span>
                        {doc.hasPendingUpdate ? (
                          <span className="text-[10px] text-amber-700 font-bold flex items-center gap-1">
                            <RefreshCw className="w-3 h-3 text-amber-600 animate-spin" />
                            <span>{language === 'hi' ? 'अपडेट लंबित' : 'Update Pending'}</span>
                          </span>
                        ) : isVerified ? (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{language === 'hi' ? 'सत्यापित' : 'Verified'}</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>{language === 'hi' ? 'समीक्षा में' : 'Under Review'}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => downloadDocumentFile(doc.fileURL, doc.fileName || `${doc.title}.pdf`)}
                          className="p-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedDocForViewer(doc)}
                          className="p-2 bg-white border border-slate-200 hover:bg-amber-50 rounded-xl text-slate-600 hover:text-amber-900 transition-colors cursor-pointer"
                          title="Inspect Document"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {myDocs.length === 0 && (
                  <div className="col-span-full py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                    <div className="text-xs text-slate-500 font-medium">
                      {language === 'hi' ? 'कोई दस्तावेज़ संलग्न नहीं है।' : 'No attached certificates in your vault.'}
                    </div>
                    {onNavigateTab && (
                      <button
                        onClick={() => onNavigateTab('documents')}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer shadow-sm"
                      >
                        {language === 'hi' ? '+ दस्तावेज़ अपलोड करें' : '+ Upload Documents Now'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Print ID Card Modal */}
      {isPrintOpen && currentStudent && (
        <StudentIdCardPrint
          student={currentStudent}
          settings={settings}
          onClose={() => setIsPrintOpen(false)}
          onEditProfile={() => {
            setIsEditing(true);
            handleStartEdit();
          }}
        />
      )}

      {/* Student 360 Modal */}
      {is360Open && currentStudent && (
        <Student360Modal
          student={currentStudent}
          isOpen={is360Open}
          onClose={() => setIs360Open(false)}
          canManageDocuments={true}
        />
      )}

      {/* Document Viewer Modal */}
      {selectedDocForViewer && (
        <DocumentViewerModal
          document={selectedDocForViewer}
          isOpen={!!selectedDocForViewer}
          onClose={() => setSelectedDocForViewer(null)}
          canVerify={false}
        />
      )}

      {/* 6-Digit Email Verification Code Modal */}
      <StudentEmailVerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        email={userProfile?.email || currentStudent?.email || ''}
        studentName={currentStudent?.name || userProfile?.fullName}
        studentId={currentStudent?.studentId || userProfile?.username}
        uid={userProfile?.uid}
        onSuccess={async () => {
          if (checkAndReloadEmailVerification) {
            await checkAndReloadEmailVerification();
          }
        }}
      />
    </div>
  );
};

