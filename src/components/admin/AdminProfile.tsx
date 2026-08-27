import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  ShieldCheck, 
  Camera, 
  Building2, 
  Users, 
  GraduationCap, 
  Award, 
  KeyRound, 
  Lock, 
  History, 
  Phone, 
  Mail, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Edit3,
  Save,
  X,
  Printer,
  BookOpen,
  School,
  FileCheck,
  Check
} from 'lucide-react';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { UserAvatar } from '../common/UserAvatar';

interface AdminProfileProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminProfile: React.FC<AdminProfileProps> = ({ onNavigateTab }) => {
  const { userProfile, updateUserProfile } = useAuth();
  const { settings, students, teachers, language, updateSettings } = useSchool();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'authority' | 'security'>('overview');

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userProfile?.name || 'Smt. Kiran Shakya');
  const [editPhone, setEditPhone] = useState(userProfile?.phone || settings.phone || '');
  const [editEmail, setEditEmail] = useState(userProfile?.email || settings.email || '');
  const [editDesignation, setEditDesignation] = useState(userProfile?.designation || 'Headmaster / Head Teacher (प्रधानाध्यापिका)');
  const [editQualification, setEditQualification] = useState('M.A., B.Ed., State Best Teacher Awardee');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditName(userProfile?.name || settings.headTeacherName || 'Smt. Kiran Shakya');
    setEditPhone(userProfile?.phone || settings.phone || '');
    setEditEmail(userProfile?.email || settings.email || '');
    setEditDesignation(userProfile?.designation || 'Headmaster / Head Teacher (प्रधानाध्यापिका)');
    setIsEditing(true);
    setSaveSuccess(null);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      if (userProfile?.uid && updateUserProfile) {
        await updateUserProfile({
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          designation: editDesignation.trim()
        });
      }
      // Also sync head teacher name & contact in SchoolSettings
      await updateSettings({
        ...settings,
        headTeacherName: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim()
      });

      setIsEditing(false);
      setSaveSuccess(language === 'hi' ? 'प्रधानाध्यापिका प्रोफ़ाइल व संपर्क विवरण सफलतापूर्वक सहेज लिया गया।' : 'Headmaster profile and credentials successfully updated.');
      setTimeout(() => setSaveSuccess(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-bold border border-red-200 mb-1.5 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
            <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद अधिकृत' : 'UP Basic Education Board Authority'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'प्रधानाध्यापिका आधिकारिक प्रोफाइल एवं अधिकार' : 'Headmaster Official Profile & Governance'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'hi' 
              ? 'प्रधानाध्यापक के अधिकार, संस्थागत रिकॉर्ड एवं प्रशासनिक सुरक्षा विवरण' 
              : 'Institutional head of school credentials, administrative security and ERP system access'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!isEditing ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'hi' ? 'विवरण संपादित करें' : 'Edit Profile'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>रद्द करें</span>
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'फ़ोटो बदलें' : 'Update Photo'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top duration-200 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* Main Official Identity Card Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-800 relative">
          
          {/* Profile Photo with Camera Trigger */}
          <div className="relative group shrink-0">
            <UserAvatar
              userProfile={userProfile}
              size="2xl"
              onClick={() => setIsPhotoModalOpen(true)}
            />

            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Change Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Basic Head Info */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-xs font-bold border border-red-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                <span>Headmaster Authority (प्रधानाध्यापक)</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700">
                UDISE: {settings.schoolCode}
              </span>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName ?? ''}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation ?? ''}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {userProfile?.name || settings.headTeacherName || 'Smt. Kiran Shakya'}
                </h3>
                <p className="text-sm font-semibold text-slate-300">
                  {userProfile?.designation || 'Headmaster / Head Teacher (प्रधानाध्यापिका)'}
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
                <Award className="w-3.5 h-3.5 text-blue-400" />
                {settings.block || 'Shamsabad'}, {settings.district || 'Farrukhabad'}
              </span>
            </div>
          </div>

        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveSubTab('overview')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'overview'
                ? 'border-amber-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'संस्थागत साख व विवरण' : 'Institutional Credentials'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('authority')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'authority'
                ? 'border-amber-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'प्रशासनिक अधिकार' : 'Administrative Roles'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('security')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'security'
                ? 'border-amber-500 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{language === 'hi' ? 'सुरक्षा व शॉर्टकट' : 'Governance & Shortcuts'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {activeSubTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Headmaster Name</span>
                  <div className="font-bold text-slate-900 text-sm">{userProfile?.name || settings.headTeacherName}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Mobile / Login Phone</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editPhone ?? ''}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm">{userProfile?.phone || settings.phone}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official School Email</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editEmail ?? ''}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm truncate">{userProfile?.email || settings.email}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">School U-DISE Code</span>
                  <div className="font-mono font-bold text-amber-700 text-sm">{settings.schoolCode}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled Students</span>
                  <div className="font-bold text-slate-900 text-sm">{students.length} Students (Active)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Faculty & Staff Count</span>
                  <div className="font-bold text-slate-900 text-sm">{teachers.length} Certified Teachers</div>
                </div>

              </div>

              {/* Institutional Summary Banner */}
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-black">
                    <School className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-slate-900 text-sm block">{settings.schoolName}</span>
                    <span className="text-slate-600">Session {settings.academicYear} • Affiliation #{settings.affiliationNumber}</span>
                  </div>
                </div>

                {onNavigateTab && (
                  <button
                    type="button"
                    onClick={() => onNavigateTab('settings')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer self-end sm:self-auto"
                  >
                    Open Master Settings
                  </button>
                )}
              </div>
            </div>
          )}

          {activeSubTab === 'authority' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Academic & Student Admissions Authority</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Full authority to sanction new enrollments, generate official transfer certificates (TC), verify government scholarships, and issue certified Marksheets and Report Cards.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Faculty & Teacher Assignment Management</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Allocate class teachers, subject timetables, inspect daily faculty attendance, approve leaves, and manage human resource records compliant with Manav Sampada.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Document Verification & Institutional Seals</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Official digital verification of student identity documents (Aadhaar, Birth Certificate, Bank Passbook, Ration Card) with audit trail timestamps.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>ERP System Administration & Access Control</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Administer master security credentials, manage role-based user logins, review security audit logs, and trigger institutional database synchronization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'security' && (
            <div className="space-y-4 animate-in fade-in">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>{language === 'hi' ? 'त्वरित प्रशासनिक नियंत्रण व प्रबंधन' : 'Quick Governance Actions'}</span>
              </h4>

              {onNavigateTab && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => onNavigateTab('users')}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">User Logins & Security</span>
                      <span className="text-[11px] text-slate-500">Manage credentials & passwords</span>
                    </div>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('audit')}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">Security Audit Logs</span>
                      <span className="text-[11px] text-slate-500">Track all logins & updates</span>
                    </div>
                    <History className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigateTab('settings')}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div>
                      <span className="text-xs font-black text-slate-900 block">School ERP Settings</span>
                      <span className="text-[11px] text-slate-500">Update school info & session</span>
                    </div>
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Photo Update Modal */}
      <ProfilePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />

    </div>
  );
};

