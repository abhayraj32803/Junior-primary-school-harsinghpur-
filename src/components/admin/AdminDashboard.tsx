import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  CalendarCheck2, 
  ShieldCheck, 
  Settings,
  Sparkles,
  Award,
  BookOpen,
  Clock,
  FileText,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  History,
  AlertCircle,
  PlusCircle,
  Search,
  Bell,
  Radio,
  FileCheck,
  ExternalLink,
  BookOpenCheck,
  UserPlus
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { AdminMetricCard } from './ui/AdminMetricCard';
import { AdminSectionHeader } from './ui/AdminSectionHeader';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenCommandPalette?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  onNavigateTab, 
  onOpenCommandPalette 
}) => {
  const { userProfile, registrationRequests } = useAuth();
  const { students, teachers, classes, sections, attendance, notices, auditLogs, settings, language } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const totalTodayLogged = todayAttendance.length;
  const attendanceRate = totalTodayLogged > 0 ? Math.round(((presentCount + (lateCount * 0.8)) / totalTodayLogged) * 100) : 95;

  const activeStudents = students.filter(s => s.status === 'active');
  const activeTeachers = teachers.filter(t => t.status === 'active');
  const activeNotices = notices.filter(n => n.status === 'active').slice(0, 4);
  const recentLogs = auditLogs.slice(0, 5);

  const pendingStudentRequests = registrationRequests.filter(
    r => r.requestedRole === 'student' && r.status === 'PENDING'
  );

  const pendingTeacherRequests = registrationRequests.filter(
    r => r.requestedRole === 'teacher' && r.status === 'PENDING'
  );

  // Class-wise attendance summary for primary & upper primary (Classes 1-8)
  const classAttendanceSummaries = [1, 2, 3, 4, 5, 6, 7, 8].map(classNum => {
    const classStudents = activeStudents.filter(s => s.classNumber === classNum);
    const studentIds = new Set(classStudents.map(s => s.id));
    const classTodayAtt = todayAttendance.filter(a => studentIds.has(a.studentId));
    const classPresent = classTodayAtt.filter(a => a.status === 'present').length;
    const isSubmitted = classTodayAtt.length > 0;
    const percentage = classStudents.length > 0 && isSubmitted
      ? Math.round((classPresent / classStudents.length) * 100)
      : isSubmitted ? 100 : 0;

    return {
      classNum,
      studentCount: classStudents.length,
      isSubmitted,
      presentCount: classPresent,
      percentage
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Directorate Welcome Header */}
      <div className="bg-[#0F172A] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4 min-w-0">
          <UserAvatar
            userProfile={userProfile}
            size="lg"
            onClick={() => onNavigateTab('faculty')}
            className="ring-2 ring-indigo-500/40 hover:ring-indigo-400 transition-all cursor-pointer rounded-xl shrink-0"
          />

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'प्रधानाध्यापिका प्रशासनिक नियंत्रण' : 'Executive ERP Directorate'}</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Session {settings.academicYear || '2024-2025'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
              {userProfile?.name || 'Headmaster Directorate'}
            </h1>
            <p className="text-xs text-slate-400 font-normal truncate">
              {settings.schoolName} • U-DISE Code: {settings.schoolCode || '09150101234'} • Classes 1–8
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer shadow-2xs group"
              title="Open Global Search (Ctrl + K)"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">{language === 'hi' ? 'खोजें...' : 'Quick Search'}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700 font-mono text-[9px] font-bold">
                ⌘K
              </kbd>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            id="btn-admin-quick-attendance"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-indigo-200" />
            <span>{language === 'hi' ? 'दैनिक उपस्थिति' : 'Mark Attendance'}</span>
          </button>
          
          <button
            onClick={() => onNavigateTab('students')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            id="btn-admin-quick-students"
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-300" />
            <span>{language === 'hi' ? 'छात्र पंजिका' : 'Student Registry'}</span>
          </button>
        </div>
      </div>

      {/* Pending Approvals & Admissions Alert Banner */}
      {(pendingTeacherRequests.length > 0 || pendingStudentRequests.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {pendingTeacherRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md border border-amber-300">
                      {language === 'hi' ? 'शिक्षक अनुमोदन' : 'Faculty Approvals'}
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {pendingTeacherRequests.length} {language === 'hi' ? 'नए आवेदन' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-900 mt-1 font-normal">
                    {language === 'hi' 
                      ? 'नए शिक्षकों ने पंजीकरण किया है। प्रोफाइल व लॉगिन अधिकार प्रदान करें।' 
                      : 'New educators awaiting administrative verification and class allocation.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('teachers')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'स्वीकृत करें' : 'Review'}</span>
              </button>
            </div>
          )}

          {pendingStudentRequests.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900 bg-blue-200/80 px-2 py-0.5 rounded-md border border-blue-300">
                      {language === 'hi' ? 'छात्र प्रवेश आवेदन' : 'Admissions'}
                    </span>
                    <span className="text-xs font-bold text-blue-900">
                      {pendingStudentRequests.length} {language === 'hi' ? 'नए प्रवेश' : 'Applications'}
                    </span>
                  </div>
                  <p className="text-xs text-blue-900 mt-1 font-normal">
                    {language === 'hi' 
                      ? 'ऑनलाइन प्रवेश हेतु आवेदन प्राप्त हुए हैं। पंजिका में जोड़ें।' 
                      : 'New online student admission applications waiting for approval.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('students')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'समीक्षा करें' : 'Review'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Primary KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminMetricCard
          label={language === 'hi' ? 'कुल नामांकित छात्र' : 'Total Students'}
          value={activeStudents.length}
          subtext={
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <span>{pendingStudentRequests.length > 0 ? `${pendingStudentRequests.length} Pending Admissions` : 'Enrolled across Classes 1-8'}</span>
            </span>
          }
          icon={GraduationCap}
          variant="indigo"
          onClick={() => onNavigateTab('academics')}
        />

        <AdminMetricCard
          label={language === 'hi' ? 'शिक्षक व स्टाफ' : 'Teaching Staff'}
          value={`${activeTeachers.length} Faculty`}
          subtext={
            pendingTeacherRequests.length > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{pendingTeacherRequests.length} Pending Approvals</span>
              </span>
            ) : (
              <span className="text-slate-500 font-normal">Service records verified</span>
            )
          }
          icon={Users}
          variant="teal"
          onClick={() => onNavigateTab('faculty')}
        />

        <AdminMetricCard
          label={language === 'hi' ? 'कक्षाएं व वर्ग' : 'Classes & Sections'}
          value={`${classes.length} Classes`}
          subtext={
            <span className="text-slate-500 font-normal">
              {sections.length} Active Sections (Primary & Upper Primary)
            </span>
          }
          icon={Layers}
          variant="amber"
          onClick={() => onNavigateTab('academics')}
        />

        <AdminMetricCard
          label={language === 'hi' ? 'आज की उपस्थिति' : "Today's Attendance"}
          value={`${attendanceRate}%`}
          subtext={
            <span className="text-slate-600 font-normal flex items-center gap-2">
              <span className="text-emerald-700 font-semibold">{presentCount} Present</span>
              <span>•</span>
              <span className="text-amber-700 font-semibold">{lateCount} Late</span>
              <span>•</span>
              <span className="text-red-700 font-semibold">{absentCount} Absent</span>
            </span>
          }
          icon={CalendarCheck2}
          variant="indigo"
          onClick={() => onNavigateTab('operations')}
        />
      </div>

      {/* College-Style 1-Click Action Launchpad */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172033]">
              {language === 'hi' ? 'त्वरित कार्य केंद्र (Quick Launchpad)' : 'Quick Action Launchpad'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'अक्सर उपयोग होने वाले कार्यों के सीधे शॉर्टकट' : 'One-click shortcuts to primary administrative routines'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
              {language === 'hi' ? 'दैनिक उपस्थिति' : 'Mark Attendance'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Today's Registry</span>
          </button>

          <button
            onClick={() => onNavigateTab('students')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
              {language === 'hi' ? 'छात्र नामांकन' : 'Enroll Student'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Directory & TC</span>
          </button>

          <button
            onClick={() => onNavigateTab('examinations')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              {language === 'hi' ? 'परीक्षा एवं अंक' : 'Exam Marks'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Gradebooks</span>
          </button>

          <button
            onClick={() => onNavigateTab('documents')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-cyan-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
              <FileCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-cyan-600 transition-colors">
              {language === 'hi' ? 'टीसी व प्रमाणपत्र' : 'TC & Certs'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Instant Issue</span>
          </button>

          <button
            onClick={() => onNavigateTab('notices')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
              {language === 'hi' ? 'सूचना व परिपत्र' : 'Post Circular'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Notice Board</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all flex flex-col items-center text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-2 group-hover:bg-slate-800 group-hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
              {language === 'hi' ? 'सिस्टम सेटिंग्स' : 'ERP Settings'}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">School Config</span>
          </button>
        </div>
      </div>

      {/* Class-wise Attendance Grid (Live Pulse) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{language === 'hi' ? 'कक्षावार आज की उपस्थिति (Live Attendance Pulse)' : "Today's Class-wise Attendance Pulse"}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'कक्षा 1 से 8 तक की वास्तविक स्थिति' : 'Real-time status overview across primary & upper primary classrooms'}
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('attendance')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>{language === 'hi' ? 'पूरी उपस्थिति पंजिका खोलें' : 'Open Attendance Register'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {classAttendanceSummaries.map(({ classNum, studentCount, isSubmitted, presentCount, percentage }) => (
            <div
              key={classNum}
              onClick={() => onNavigateTab('attendance')}
              className={`p-3 rounded-xl border transition-all cursor-pointer text-center ${
                isSubmitted
                  ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
              }`}
            >
              <div className="text-[11px] font-black text-slate-700 uppercase">
                Class {classNum}
              </div>
              <div className="text-lg font-black text-slate-900 my-0.5">
                {studentCount} <span className="text-[10px] font-normal text-slate-500">students</span>
              </div>

              {isSubmitted ? (
                <div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${percentage >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-700 mt-1">
                    {presentCount} Present ({percentage}%)
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-bold text-amber-700 mt-1">
                  Pending Mark
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* The 5 Consolidated Core Administrative Hubs */}
      <div className="space-y-3">
        <AdminSectionHeader
          title={language === 'hi' ? 'प्रशासनिक नियंत्रण केंद्र' : 'Core Administrative Hubs'}
          description={language === 'hi' ? 'सभी शैक्षणिक व प्रशासनिक सुविधाएं 5 मुख्य मॉड्यूल्स में उपलब्ध हैं' : 'Consolidated access to all 24 school modules with zero clutter'}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Hub 1: Academics & Students */}
          <div
            onClick={() => onNavigateTab('academics')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-100">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                  <span>6 Sections</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-indigo-600 transition-colors">
                {language === 'hi' ? 'छात्र एवं शैक्षणिक प्रबंधन' : 'Students & Academics'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-normal">
                {language === 'hi' ? 'छात्र पंजिका, कक्षाएं, विषय, मास्टर समय-सारिणी एवं प्रमाणपत्र लॉकर' : 'Student registry, admissions, rollover, classes, curriculum, timetable & TC certificates.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Directory</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Promotion</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Classes</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Timetable</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">TC Vault</span>
            </div>
          </div>

          {/* Hub 2: Faculty & Staff */}
          <div
            onClick={() => onNavigateTab('faculty')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                  <span>3 Sections</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-emerald-600 transition-colors">
                {language === 'hi' ? 'शिक्षक एवं कार्मिक' : 'Faculty & Staff'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-normal">
                {language === 'hi' ? 'शिक्षक पंजिका, ऑनलाइन अनुमोदन, कार्य आवंटन एवं हेडमास्टर प्रोफाइल' : 'Teacher registry, online registration approvals, class allocations & Headmaster profile.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Teachers</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Approvals</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Assignments</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Directorate</span>
            </div>
          </div>

          {/* Hub 3: Daily Operations */}
          <div
            onClick={() => onNavigateTab('operations')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors border border-purple-100">
                  <CalendarCheck2 className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100 flex items-center gap-1">
                  <span>5 Sections</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-purple-600 transition-colors">
                {language === 'hi' ? 'दैनिक संचालन व परीक्षा' : 'Daily Operations'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-normal">
                {language === 'hi' ? 'दैनिक उपस्थिति, परीक्षा प्रगति पत्र, गृहकार्य एवं आधिकारिक परिपत्र' : 'Daily attendance registers, examination gradebooks, homework tasks & notice ticker.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Attendance</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Exams</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Homework</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Notices</span>
            </div>
          </div>

          {/* Hub 4: Website & Media CMS */}
          <div
            onClick={() => onNavigateTab('cms')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors border border-blue-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                  <span>9 Sections</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-blue-600 transition-colors">
                {language === 'hi' ? 'वेबसाइट एवं मीडिया CMS' : 'Website & Media CMS'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-normal">
                {language === 'hi' ? 'मुख्य पृष्ठ, बैनर, शैक्षिक वीडियो, फोटो गैलरी, सुविधाएं एवं योजनाएं' : 'Homepage layout, hero banners, educational videos, media gallery & campus facilities.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Homepage</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Videos</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Gallery</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Facilities</span>
            </div>
          </div>

          {/* Hub 5: Governance & Settings */}
          <div
            onClick={() => onNavigateTab('governance')}
            className="p-5 rounded-xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between md:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors border border-rose-100">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
                  <span>4 Sections</span>
                  <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-rose-600 transition-colors">
                {language === 'hi' ? 'प्रशासन, रिपोर्ट्स व सेटिंग्स' : 'Governance & Settings'}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 line-clamp-2 font-normal">
                {language === 'hi' ? 'विद्यालय सिस्टम सेटिंग्स, उपयोगकर्ता व लॉगिन, एमआईएस रिपोर्ट्स एवं सुरक्षा लॉग' : 'Institutional settings, user accounts, MIS analytics & security audit logs.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-600">
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Settings</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Users</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">MIS Reports</span>
              <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200/70">Audit Logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Active Circulars & Recent Security Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
        {/* Active Circulars */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>{language === 'hi' ? 'सक्रिय शासनादेश व सूचनाएं' : 'Active Public Notices'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'सभी देखें' : 'View All'}
            </button>
          </div>

          <div className="space-y-2.5">
            {activeNotices.map((notice) => (
              <div key={notice.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#172033] truncate">
                    {notice.title}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {notice.date}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-1 line-clamp-1 font-normal">
                  {notice.content}
                </p>
              </div>
            ))}

            {activeNotices.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No active circulars published
              </div>
            )}
          </div>
        </div>

        {/* Security Audit Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#172033] flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              <span>{language === 'hi' ? 'हालिया सुरक्षा व प्रशासनिक लॉग' : 'Recent System Activity'}</span>
            </h3>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              {language === 'hi' ? 'पूरा ऑडिट देखें' : 'View Audit Trail'}
            </button>
          </div>

          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <div className="min-w-0">
                  <div className="text-xs font-medium text-[#172033] truncate">
                    {log.action}
                  </div>
                  <div className="text-[10px] text-slate-500 font-normal truncate">
                    By {log.performedBy} ({log.role})
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                </span>
              </div>
            ))}

            {recentLogs.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent activity recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
