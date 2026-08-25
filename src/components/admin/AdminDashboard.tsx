import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  Users, 
  GraduationCap, 
  Layers, 
  CalendarCheck2, 
  BellRing, 
  History, 
  BookOpenCheck, 
  PlusCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Settings,
  Image as ImageIcon,
  Clock,
  FileText
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { userProfile, registrationRequests } = useAuth();
  const { students, teachers, classes, sections, attendance, notices, auditLogs, homeworkList, examinations, settings, language } = useSchool();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.date === todayStr);
  const presentCount = todayAttendance.filter(a => a.status === 'present').length;
  const lateCount = todayAttendance.filter(a => a.status === 'late').length;
  const absentCount = todayAttendance.filter(a => a.status === 'absent').length;
  const totalTodayLogged = todayAttendance.length;
  const attendanceRate = totalTodayLogged > 0 ? Math.round(((presentCount + lateCount) / totalTodayLogged) * 100) : 95;

  const activeStudents = students.filter(s => s.status === 'active');
  const activeTeachers = teachers.filter(t => t.status === 'active');
  const activeNotices = notices.filter(n => n.status === 'active').slice(0, 3);
  const recentLogs = auditLogs.slice(0, 5);

  const pendingStudentRequestsCount = registrationRequests.filter(
    r => r.requestedRole === 'student' && r.status === 'PENDING'
  ).length;

  const pendingTeacherRequestsCount = registrationRequests.filter(
    r => r.requestedRole === 'teacher' && r.status === 'PENDING'
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          <UserAvatar
            userProfile={userProfile}
            size="xl"
            onClick={() => onNavigateTab('faculty')}
            className="hover:scale-105 transition-transform"
          />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'प्रधानाध्यापिका प्रशासनिक नियंत्रण' : 'Headmaster Directorate'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {userProfile?.name || 'Headmaster Administrative Directorate'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              {settings.schoolName} • U-DISE: {settings.schoolCode} • {settings.academicYear}
            </p>
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex flex-wrap gap-2 relative z-10 shrink-0">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            id="btn-admin-quick-attendance"
          >
            <CalendarCheck2 className="w-4 h-4 text-purple-200" />
            <span>{language === 'hi' ? 'दैनिक उपस्थिति' : 'Take Attendance'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('students')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-colors cursor-pointer"
            id="btn-admin-quick-students"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{language === 'hi' ? 'छात्र पंजिका' : 'Students Directory'}</span>
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>{language === 'hi' ? 'सिस्टम सेटिंग्स' : 'System Settings'}</span>
          </button>
        </div>
      </div>

      {/* Pending Teacher Approvals Fast-Action Alert Banner */}
      {pendingTeacherRequestsCount > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/25 to-amber-600/15 border-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm animate-pulse">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 bg-amber-200/90 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {language === 'hi' ? 'शिक्षक अनुमोदन आवश्यक' : 'Teacher Approval Required'}
                </span>
                <span className="text-xs font-bold text-amber-900">
                  {pendingTeacherRequestsCount} {language === 'hi' ? 'नए आवेदन' : 'Pending'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-950 font-bold mt-0.5">
                {language === 'hi' 
                  ? 'नए शिक्षकों ने पोर्टल पर पंजीकरण किया है। प्रोफाइल व लॉगिन अधिकार प्रदान करने हेतु तत्काल स्वीकृत करें।' 
                  : 'New educators registered online. Review and approve to authorize dashboard access.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('faculty')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 cursor-pointer shadow-md transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'hi' ? 'शिक्षक समीक्षा व अनुमोदन' : 'Review & Approve Teachers'}</span>
          </button>
        </div>
      )}

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Students */}
        <div 
          onClick={() => onNavigateTab('academics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'कुल छात्र' : 'Total Students'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeStudents.length}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span>{language === 'hi' ? `कक्षा 1-8 नामांकित (${pendingStudentRequestsCount} नए)` : `Enrolled across Classes 1-8`}</span>
          </div>
        </div>

        {/* Metric 2: Faculty */}
        <div 
          onClick={() => onNavigateTab('faculty')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'शिक्षक व स्टाफ' : 'Teaching Staff'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{activeTeachers.length} {language === 'hi' ? 'शिक्षक' : 'Teachers'}</div>
          <div className="text-[11px] font-semibold mt-1">
            {pendingTeacherRequestsCount > 0 ? (
              <span className="text-amber-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{language === 'hi' ? `${pendingTeacherRequestsCount} नए शिक्षक अनुमोदन हेतु` : `${pendingTeacherRequestsCount} Pending Approvals`}</span>
              </span>
            ) : (
              <span className="text-slate-500">{language === 'hi' ? 'मानव संपदा सत्यापित' : 'Faculty Service Records'}</span>
            )}
          </div>
        </div>

        {/* Metric 3: Classes & Sections */}
        <div 
          onClick={() => onNavigateTab('academics')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'कक्षाएं / वर्ग' : 'Classes / Sections'}
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">8 {language === 'hi' ? 'कक्षाएं' : 'Classes'} • {sections.length} {language === 'hi' ? 'वर्ग' : 'Sections'}</div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1">
            {language === 'hi' ? 'प्राथमिक (1-5) व उच्च प्राथमिक (6-8)' : 'Primary (1-5) & Upper Primary (6-8)'}
          </div>
        </div>

        {/* Metric 4: Today Attendance */}
        <div 
          onClick={() => onNavigateTab('operations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'hi' ? 'आज की उपस्थिति' : "Today's Attendance"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{attendanceRate}% {language === 'hi' ? 'उपस्थित' : 'Present'}</div>
          <div className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-2">
            <span className="text-emerald-600 font-bold">{presentCount} P</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{lateCount} L</span>
            <span>•</span>
            <span className="text-red-600 font-bold">{absentCount} A</span>
          </div>
        </div>
      </div>

      {/* The 5 Core Administrative Hubs (Simplified & Clear Navigation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-black text-lg text-slate-900">
              {language === 'hi' ? 'प्रशासनिक नियंत्रण केंद्र (Master Modules)' : 'Core Administrative Hubs'}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'hi' ? 'सभी सुविधाएं 5 प्रमुख मॉड्यूल्स में सुव्यवस्थित हैं' : 'Consolidated access to all 24 school modules with zero clutter'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* HUB 1: Academics & Students */}
          <div
            onClick={() => onNavigateTab('academics')}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-indigo-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 flex items-center gap-1">
                  <span>5 {language === 'hi' ? 'सेक्शन' : 'Sections'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                {language === 'hi' ? 'छात्र एवं शैक्षणिक प्रबंधन' : 'Students & Academics'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {language === 'hi' ? 'छात्र पंजिका, कक्षाएं, विषय, मास्टर समय-सारिणी एवं प्रमाणपत्र लॉकर' : 'Student directory, admissions, classes, subjects, timetable & TC certificates.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">छात्र पंजिका</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">कक्षाएं</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">समय-सारिणी</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">टीसी लॉकर</span>
            </div>
          </div>

          {/* HUB 2: Faculty & Staff */}
          <div
            onClick={() => onNavigateTab('faculty')}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 flex items-center gap-1">
                  <span>3 {language === 'hi' ? 'सेक्शन' : 'Sections'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 group-hover:text-emerald-600 transition-colors">
                {language === 'hi' ? 'शिक्षक एवं कार्मिक' : 'Faculty & Staff'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {language === 'hi' ? 'शिक्षक पंजिका, कक्षा-विषय आवंटन एवं प्रधानाध्यापिका प्रोफाइल' : 'Teacher service records, class/subject assignments & Headmaster profile.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">शिक्षक पंजिका</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">कार्य आवंटन</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">मानव संपदा</span>
            </div>
          </div>

          {/* HUB 3: Daily Operations */}
          <div
            onClick={() => onNavigateTab('operations')}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-purple-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-xs">
                  <CalendarCheck2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-100 flex items-center gap-1">
                  <span>4 {language === 'hi' ? 'सेक्शन' : 'Sections'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 group-hover:text-purple-600 transition-colors">
                {language === 'hi' ? 'दैनिक संचालन एवं मूल्यांकन' : 'Daily Operations & Evaluation'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {language === 'hi' ? 'दैनिक उपस्थिति पंजिका, परीक्षा एवं प्रगति पत्र, गृहकार्य व शासनादेश सूचनाएं' : 'Attendance register, examinations & marksheets, homework & circulars.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">दैनिक उपस्थिति</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">परीक्षा व अंक</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">सूचना पट्ट</span>
            </div>
          </div>

          {/* HUB 4: Website CMS */}
          <div
            onClick={() => onNavigateTab('cms')}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex items-center gap-1">
                  <span>8 {language === 'hi' ? 'सेक्शन' : 'Sections'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                {language === 'hi' ? 'वेबसाइट एवं गैलरी CMS' : 'Public Website & Media CMS'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {language === 'hi' ? 'मुख्य पृष्ठ, प्रेरक वीडियो, चित्र गैलरी, भौतिक सुविधाएं, मिड-डे मील व प्रवेश' : 'Homepage layout, educational videos, gallery, campus facilities & MDM schemes.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">होमपेज</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">प्रेरक वीडियो</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">फोटो गैलरी</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">सुविधाएं</span>
            </div>
          </div>

          {/* HUB 5: Governance & Settings */}
          <div
            onClick={() => onNavigateTab('governance')}
            className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-rose-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shadow-xs">
                  <Settings className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-100 flex items-center gap-1">
                  <span>4 {language === 'hi' ? 'सेक्शन' : 'Sections'}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </div>
              <h4 className="font-black text-base text-slate-900 group-hover:text-rose-600 transition-colors">
                {language === 'hi' ? 'प्रशासन, रिपोर्ट्स व सेटिंग्स' : 'Governance, MIS & Security'}
              </h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {language === 'hi' ? 'विद्यालय सिस्टम सेटिंग्स, उपयोगकर्ता लॉगिन, प्रशासनिक विश्लेषण व ऑडिट लॉग' : 'School ERP settings, user accounts, MIS reports & security audit logs.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[11px] font-bold text-slate-600">
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">सेटिंग्स</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">लॉगिन सुरक्षा</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">MIS रिपोर्ट</span>
              <span className="px-2 py-0.5 rounded-lg bg-slate-50 border border-slate-200">ऑडिट लॉग</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Notices & Recent Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Active Circulars & Notices */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-800">
                {language === 'hi' ? 'सक्रिय सूचनाएं एवं शासनादेश' : 'Active Notices & Announcements'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('notices')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'सभी सूचनाएं' : 'Manage Notices'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeNotices.map((notice) => (
              <div key={notice.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-xs bg-amber-100 text-amber-800">
                    {notice.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{notice.publishDate}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{notice.title}</h4>
                <p className="text-[11px] text-slate-600 line-clamp-2">{notice.description}</p>
              </div>
            ))}
            {activeNotices.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                {language === 'hi' ? 'कोई सक्रिय सूचना नहीं है।' : 'No active circulars posted.'}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Audit Trail & Recent Events */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-800">
                {language === 'hi' ? 'हालिया प्रशासनिक गतिविधि' : 'Recent Institutional Activity Logs'}
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <span>{language === 'hi' ? 'ऑडिट लॉग' : 'Full Audit Trail'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-xs bg-slate-200 text-slate-700">
                      {log.action}
                    </span>
                    <span className="text-slate-600">{log.entity}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{log.details}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-600">{log.userName.split(' ')[0]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
