import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  UserCheck, 
  Camera, 
  ShieldCheck, 
  BookOpen, 
  Mail, 
  Phone, 
  Calendar, 
  Award, 
  Layers, 
  KeyRound, 
  Printer, 
  Building2,
  CheckCircle2,
  GraduationCap,
  Edit3,
  Save,
  X,
  Sparkles,
  School,
  Check
} from 'lucide-react';
import { ProfilePhotoModal } from '../common/ProfilePhotoModal';
import { UserAvatar } from '../common/UserAvatar';

export const TeacherProfile: React.FC = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { teachers, teacherAssignments, classes, settings, language, updateTeacher } = useSchool();
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'ehrms'>('overview');

  const currentTeacher = teachers.find(t => t.id === userProfile?.entityId || t.email === userProfile?.email) || teachers[0];
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentTeacher?.name || userProfile?.name || '');
  const [editPhone, setEditPhone] = useState(currentTeacher?.phone || userProfile?.phone || '');
  const [editEmail, setEditEmail] = useState(currentTeacher?.email || userProfile?.email || '');
  const [editSubject, setEditSubject] = useState(currentTeacher?.subject || 'All General Subjects');
  const [editQualification, setEditQualification] = useState(currentTeacher?.qualification || 'B.Ed / D.El.Ed, Post Graduate');
  const [editDesignation, setEditDesignation] = useState(currentTeacher?.designation || 'Assistant Teacher (सहायक अध्यापक)');
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = () => {
    setEditName(currentTeacher?.name || userProfile?.name || '');
    setEditPhone(currentTeacher?.phone || userProfile?.phone || '');
    setEditEmail(currentTeacher?.email || userProfile?.email || '');
    setEditSubject(currentTeacher?.subject || 'All General Subjects');
    setEditQualification(currentTeacher?.qualification || 'B.Ed / D.El.Ed, Post Graduate');
    setEditDesignation(currentTeacher?.designation || 'Assistant Teacher (सहायक अध्यापक)');
    setIsEditing(true);
    setSaveSuccess(null);
  };

  const handleSaveProfile = async () => {
    if (!currentTeacher) return;
    setIsSaving(true);
    try {
      const updatedTeacherData = {
        ...currentTeacher,
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim(),
        subject: editSubject.trim(),
        qualification: editQualification.trim(),
        designation: editDesignation.trim()
      };

      // Update in SchoolContext
      updateTeacher(currentTeacher.id, updatedTeacherData);

      // Update in Auth Context
      if (userProfile?.uid && updateUserProfile) {
        await updateUserProfile({
          name: editName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          designation: editDesignation.trim()
        });
      }

      setIsEditing(false);
      setSaveSuccess(language === 'hi' ? 'शिक्षक प्रोफ़ाइल विवरण सफलतापूर्वक सहेज लिया गया।' : 'Faculty profile updated successfully.');
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-1.5 shadow-xs">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा परिषद अधिकृत' : 'UP Basic Education Board Faculty'}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {language === 'hi' ? 'शिक्षक आधिकारिक प्रोफाइल एवं सेवा विवरण' : 'Faculty Official Profile & Service Record'}
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {language === 'hi' ? 'मानव संपदा एवं ईएचआरएमएस (eHRMS) आधारित प्रमाणित शिक्षक रिकॉर्ड' : 'Official Manav Sampada / eHRMS verified faculty service profile'}
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

      {/* Main Faculty ID Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Banner Top */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border-b border-slate-800 relative">
          
          {/* Profile Photo */}
          <div className="relative group shrink-0">
            <UserAvatar
              userProfile={userProfile}
              photoURL={currentTeacher?.photoURL}
              name={currentTeacher?.name || userProfile?.name}
              role="teacher"
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

          {/* Teacher Basic Info */}
          <div className="text-center md:text-left space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Active Faculty (सक्रिय शिक्षक)</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 text-amber-400 text-xs font-mono font-bold border border-slate-700">
                eHRMS ID: {currentTeacher?.employeeCode || userProfile?.username || 'UP-TCH-2024'}
              </span>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teacher Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Designation</label>
                  <input
                    type="text"
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{currentTeacher?.name}</h3>
                <p className="text-sm font-semibold text-slate-300">
                  {currentTeacher?.designation || 'Assistant Teacher (सहायक अध्यापक)'}
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
                {currentTeacher?.qualification || 'B.Ed / D.El.Ed, Post Graduate'}
              </span>
            </div>
          </div>

        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/50 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'व्यक्तिगत व सेवा विवरण' : 'Service & Biodata'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'assignments'
                ? 'border-emerald-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'hi' ? 'आवंटित कक्षाएं व विषय' : 'Assigned Classes'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ehrms')}
            className={`pb-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ehrms'
                ? 'border-emerald-600 text-slate-900 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{language === 'hi' ? 'मानव संपदा साख' : 'Manav Sampada Compliance'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Full Name</span>
                  <div className="font-bold text-slate-900 text-sm">{currentTeacher?.name}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Designation (पदनाम)</span>
                  <div className="font-bold text-slate-900 text-sm">{currentTeacher?.designation}</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Primary Subject Specialization</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm text-emerald-700">{currentTeacher?.subject || 'All General Subjects'}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Registered Mobile No.</span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm">{currentTeacher?.phone || userProfile?.phone}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Official Email Address</span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold font-mono"
                    />
                  ) : (
                    <div className="font-mono font-bold text-slate-900 text-sm truncate">{currentTeacher?.email || userProfile?.email}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Educational Qualification</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editQualification}
                      onChange={(e) => setEditQualification(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    />
                  ) : (
                    <div className="font-bold text-slate-900 text-sm">{currentTeacher?.qualification || 'B.Ed / D.El.Ed, Post Graduate'}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assignments' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">
                  {language === 'hi' ? 'वर्तमान शैक्षणिक सत्र में आवंटित कक्षाएं एवं विषय' : 'Active Teaching Allotment for Current Academic Session'}
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black border border-emerald-200">
                  {myAssignments.length} Allotments
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {myAssignments.length > 0 ? (
                  myAssignments.map((a) => (
                    <div key={a.id} className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="text-xs font-black text-emerald-950 block">Class {a.classNumber} - Section '{a.sectionName}'</span>
                        <span className="text-[11px] text-emerald-700 font-bold">{a.subjectName}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-200/80 text-emerald-950 text-[10px] font-black font-mono">
                        {a.academicYear}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full p-8 rounded-2xl bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200 space-y-2">
                    <BookOpen className="w-6 h-6 text-slate-400 mx-auto" />
                    <div>Classes 1 to 8 Integrated Primary & Upper Primary Curriculum Allocation</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ehrms' && (
            <div className="space-y-4 animate-in fade-in text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>eHRMS & Manav Sampada Portal Linkage</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Employee service book, payroll verification, casual leave applications (CL), and appraisal reports are linked with the Directorate of Basic Education Uttar Pradesh.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Institutional Biometric & Attendance Compliance</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Verified daily faculty attendance records, pedagogical lesson plans, and classroom student engagement assessments.
                  </p>
                </div>
              </div>
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

