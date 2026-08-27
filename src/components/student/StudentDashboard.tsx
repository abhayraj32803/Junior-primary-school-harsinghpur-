import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  GraduationCap, 
  CalendarCheck2, 
  Award, 
  BookOpenCheck, 
  Clock, 
  Bell, 
  Printer, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Play,
  Pause,
  Maximize2,
  Film,
  Sparkles,
  Video,
  Flame,
  X,
  ChevronRight,
  ExternalLink,
  Mail,
  Send,
  RefreshCw,
  KeyRound,
  Zap
} from 'lucide-react';
import { StudentEmailVerificationModal } from '../common/StudentEmailVerificationModal';
import { ReportCardPrint } from '../common/ReportCardPrint';
import { StudentIdCardPrint } from '../common/StudentIdCardPrint';
import { UserAvatar } from '../common/UserAvatar';
import { parseVideoUrl } from '../../utils/mediaUtils';
import { GalleryItem } from '../../types';
import { resolveCurrentStudent } from '../../utils/studentUtils';

interface StudentDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { 
    userProfile, 
    isEmailVerified, 
    sendStudentVerificationEmail, 
    checkAndReloadEmailVerification,
    instantVerifyStudentEmail 
  } = useAuth();
  const { 
    students, 
    examinations, 
    marks, 
    homeworkList, 
    notices, 
    timetable, 
    settings, 
    gallery,
    language,
    getStudentAttendanceStats 
  } = useSchool();

  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailStatusMsg, setEmailStatusMsg] = useState<string | null>(null);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  const handleResendEmail = async () => {
    setResendingEmail(true);
    setEmailStatusMsg(null);
    const res = await sendStudentVerificationEmail();
    setResendingEmail(false);
    if (res.success) {
      setEmailStatusMsg(res.message || 'सत्यापन कोड/लिंक भेज दिया गया है।');
    } else {
      setEmailStatusMsg(res.error || 'ईमेल भेजने में त्रुटि हुई।');
    }
  };

  const handleInstantVerifyEmail = async () => {
    setResendingEmail(true);
    setEmailStatusMsg(null);
    const res = await instantVerifyStudentEmail();
    setResendingEmail(false);
    if (res.success) {
      setEmailStatusMsg(res.message || 'ईमेल और खाता सफलतापूर्वक सत्यापित हो गया!');
    } else {
      setEmailStatusMsg(res.error || 'सत्यापन विफल रहा।');
    }
  };

  const handleCheckEmail = async () => {
    setResendingEmail(true);
    const res = await checkAndReloadEmailVerification();
    setResendingEmail(false);
    if (res.isVerified) {
      setEmailStatusMsg('बधाई हो! आपका ईमेल सत्यापित हो चुका है।');
    } else {
      setEmailStatusMsg('ईमेल अभी तक सत्यापित नहीं हुआ है। कृपया 6-अंकों का कोड दर्ज करें।');
    }
  };

  const currentStudent = useMemo(() => resolveCurrentStudent(userProfile, students), [userProfile, students]);
  const attendanceStats = getStudentAttendanceStats(currentStudent?.id || '');

  const myHomework = homeworkList.filter(h => h.classNumber === currentStudent?.classNumber);
  const mySchedule = timetable.filter(t => t.classNumber === currentStudent?.classNumber && t.sectionName === currentStudent?.sectionName);
  const myMarks = marks.filter(m => m.studentId === currentStudent?.id);
  const latestExam = examinations[0];

  const [printReport, setPrintReport] = useState(false);
  const [printIdCard, setPrintIdCard] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<GalleryItem | null>(null);
  const [inlinePlayingVideoId, setInlinePlayingVideoId] = useState<string | null>(null);

  // Filter top educational/motivational videos tailored for the student's class (1-8)
  const motivationalVideos = useMemo(() => {
    const allVideos = gallery.filter(item => item.isPublic !== false && (item.mediaType === 'video' || item.youtubeId || item.videoURL));
    const studentClassNum = currentStudent?.classNumber || 5;

    // Sort or filter based on student's current grade
    return allVideos.sort((a, b) => {
      // Prioritize exact matching class category
      const aMatches = 
        (studentClassNum <= 3 && (a.targetClass === 'Class 1-3' || a.tags?.includes('Class1to3'))) ||
        (studentClassNum >= 4 && studentClassNum <= 5 && (a.targetClass === 'Class 4-5' || a.targetClass === 'Class 1-5')) ||
        (studentClassNum >= 6 && (a.targetClass === 'Class 6-8' || a.tags?.includes('Class6to8')));

      const bMatches = 
        (studentClassNum <= 3 && (b.targetClass === 'Class 1-3' || b.tags?.includes('Class1to3'))) ||
        (studentClassNum >= 4 && studentClassNum <= 5 && (b.targetClass === 'Class 4-5' || b.targetClass === 'Class 1-5')) ||
        (studentClassNum >= 6 && (b.targetClass === 'Class 6-8' || b.tags?.includes('Class6to8')));

      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    }).slice(0, 4);
  }, [gallery, currentStudent]);

  return (
    <div className="space-y-6">
      {/* Email Verification Alert Banner */}
      {!isEmailVerified && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-black text-blue-950 flex items-center gap-2">
                <span>{language === 'hi' ? 'ईमेल सत्यापन आवश्यक (Email Verification Pending)' : 'Email Verification Pending'}</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                {language === 'hi'
                  ? `सुरक्षा के लिए कृपया अपने पंजीकृत ईमेल (${userProfile?.email || 'Registered Email'}) पर भेजे गए 6-अंकों के कोड से सत्यापन पूरा करें।`
                  : `Please enter the 6-digit verification code sent to your registered email (${userProfile?.email || 'Registered Email'}) to unlock all student features.`}
              </p>
              {emailStatusMsg && (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{emailStatusMsg}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setVerificationModalOpen(true)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'hi' ? 'सत्यापन कोड दर्ज करें' : 'Enter 6-Digit OTP'}</span>
            </button>
            <button
              onClick={handleInstantVerifyEmail}
              disabled={resendingEmail}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              title="Instant 1-Click Verification"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'hi' ? '⚡ 1-क्लिक सत्यापन' : '⚡ 1-Click Verify'}</span>
            </button>
            <button
              onClick={handleResendEmail}
              disabled={resendingEmail}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Resend code"
            >
              <Send className="w-3.5 h-3.5 text-blue-600" />
              <span>{resendingEmail ? '...' : (language === 'hi' ? 'कोड भेजें' : 'Resend')}</span>
            </button>
            <button
              onClick={handleCheckEmail}
              disabled={resendingEmail}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resendingEmail ? 'animate-spin' : ''}`} />
              <span>{language === 'hi' ? 'जांचें' : 'Check'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Approval Pending Notice (if unapproved) */}
      {userProfile && userProfile.isApproved === false && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-black text-amber-950 flex items-center gap-2">
              <span>{language === 'hi' ? 'प्रोफाइल सत्यापन प्रक्रियाधीन' : 'Profile Verification in Progress'}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                {language === 'hi' ? 'एडमिन समीक्षा' : 'Admin Review'}
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              {language === 'hi'
                ? 'आपका छात्र खाता सक्रिय है और आप अध्ययन सामग्री, समय सारिणी एवं गृहकार्य देख सकते हैं। विद्यालय प्रधानाध्यापिका (Admin) द्वारा प्रोफाइल का अंतिम सत्यापन किया जा रहा है।'
                : 'Your student account is active and you have access to learning materials, schedule, and homework. Final profile approval will be completed by the Headmaster.'}
            </p>
          </div>
        </div>
      )}

      {/* Student Welcome Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <UserAvatar
            userProfile={userProfile}
            photoURL={currentStudent?.photoURL}
            name={currentStudent?.name || userProfile?.name}
            role="student"
            size="xl"
            onClick={() => onNavigateTab('profile')}
            className="hover:scale-105 transition-transform"
          />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
              Class {currentStudent?.classNumber} - Section '{currentStudent?.sectionName}'
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentStudent?.name}
            </h2>
            <div className="text-xs text-slate-300 flex flex-wrap items-center gap-3">
              <span>Roll No: <strong>#{currentStudent?.rollNumber}</strong></span>
              <span>•</span>
              <span>Reg: <strong className="font-mono">{currentStudent?.registrationNumber}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 relative z-10 shrink-0">
          <button
            onClick={() => setPrintIdCard(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Digital ID Card</span>
          </button>
          <button
            onClick={() => setPrintReport(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition-colors"
          >
            <Award className="w-4 h-4" />
            <span>Official Report Card</span>
          </button>
        </div>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Attendance KPI */}
        <div 
          onClick={() => onNavigateTab('attendance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Track</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{attendanceStats.percentage}%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">
            {attendanceStats.present} Present / {attendanceStats.total} School Days
          </div>
        </div>

        {/* Pending Homework */}
        <div 
          onClick={() => onNavigateTab('homework')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Homework Tasks</span>
            <BookOpenCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myHomework.length} Active</div>
          <div className="text-[11px] text-slate-500 font-medium">Daily Notebook Problems</div>
        </div>

        {/* Evaluation Grades */}
        <div 
          onClick={() => onNavigateTab('marks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Academic Standing</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">Grade A1</div>
          <div className="text-[11px] text-amber-700 font-medium">Mid-Term Evaluation</div>
        </div>
      </div>

      {/* Grid: Homework + Timetable */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Homework Feed */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpenCheck className="w-4 h-4 text-blue-600" />
              <span>Assigned Homework</span>
            </h3>
            <button
              onClick={() => onNavigateTab('homework')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {myHomework.slice(0, 3).map((hw) => (
              <div key={hw.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    {hw.subjectName}
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold">Due: {hw.dueDate}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900">{hw.title}</h4>
                <p className="text-xs text-slate-600 line-clamp-2">{hw.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Class Timetable Preview */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Today's Daily Timetable</span>
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800"
            >
              Full Week
            </button>
          </div>

          <div className="space-y-2">
            {mySchedule.slice(0, 4).map((slot) => (
              <div key={slot.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">Period {slot.periodNumber} • {slot.subjectName}</div>
                  <div className="text-slate-500 text-[11px]">{slot.teacherName} ({slot.roomNumber})</div>
                </div>
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                  {slot.startTime} - {slot.endTime}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Motivational Learning & Smart Classroom Video Hub */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 sm:p-7 rounded-3xl text-white shadow-lg border border-indigo-900/50 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{language === 'hi' ? 'स्मार्ट क्लास एवं छात्र प्रेरणा' : 'Smart Classes & Student Motivation'}</span>
            </div>
            <h3 className="text-lg font-black text-white">
              {language === 'hi' ? '🌟 शीर्ष शैक्षिक एवं प्रेरक वीडियो (Top Learning Videos)' : '🌟 Inspiring Smart Classes & Learning Videos'}
            </h3>
            <p className="text-xs text-slate-300">
              {language === 'hi'
                ? 'कठिन विषयों को आसान बनाएं, विज्ञान प्रयोग देखें और बड़े सपने देखने के लिए प्रेरित हों।'
                : 'Watch interactive classroom videos, science experiments & motivational talks to boost your studies.'}
            </p>
          </div>

          <div className="shrink-0">
            <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>{language === 'hi' ? 'सकारात्मक ऊर्जा' : 'Daily Inspiration'}</span>
            </span>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {motivationalVideos.map((video) => {
            const isPlaying = inlinePlayingVideoId === video.id;
            const thumb = video.thumbnailURL || video.imageUrl || video.imageURL || 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80';
            const parsed = parseVideoUrl(video.videoURL || (video.youtubeId ? `https://youtube.com/watch?v=${video.youtubeId}` : ''));

            return (
              <div
                key={video.id}
                className={`group bg-slate-800/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col justify-between border ${
                  isPlaying 
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-800' 
                    : 'border-slate-700/80 hover:border-amber-400/80 hover:bg-slate-800'
                }`}
              >
                {/* Live Inline Video Player or Thumbnail */}
                <div className="aspect-video relative bg-black overflow-hidden">
                  {isPlaying ? (
                    <div className="w-full h-full relative bg-black">
                      {parsed.embedUrl ? (
                        <iframe
                          src={`${parsed.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                          title={video.titleEn}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : video.videoURL ? (
                        <video
                          src={video.videoURL}
                          controls
                          autoPlay
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-xs">
                          <Film className="w-6 h-6 mb-1 text-slate-600" />
                          <span>Video loading...</span>
                        </div>
                      )}

                      {/* Top Overlay controls */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={() => setActiveVideoModal(video)}
                          className="p-1 rounded-md bg-black/80 hover:bg-slate-800 text-white transition-colors cursor-pointer"
                          title="Expand"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setInlinePlayingVideoId(null)}
                          className="p-1 rounded-md bg-black/80 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="Stop"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => setInlinePlayingVideoId(video.id)}
                      className="w-full h-full relative cursor-pointer group/thumb"
                    >
                      <img
                        src={thumb}
                        alt={video.titleEn}
                        className="w-full h-full object-cover transform scale-100 group-hover:scale-108 group-hover/thumb:scale-108 transition-transform duration-500 ease-out opacity-85 group-hover:opacity-100"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20 group-hover/thumb:from-black/60 transition-colors flex items-center justify-center pointer-events-none">
                        <div className="w-11 h-11 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-95 group-hover/thumb:scale-110 group-hover/thumb:bg-amber-400 ring-2 ring-white/40 group-hover/thumb:ring-4 group-hover/thumb:ring-amber-400/50 transition-all duration-300">
                          <Play className="w-4 h-4 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      {/* Target Class Pill */}
                      <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                        {video.targetClass && (
                          <span className="px-2 py-0.5 rounded bg-amber-500 text-gov-navy-950 text-[9px] font-black shadow-sm">
                            {video.targetClass}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-bold">
                          {language === 'hi' ? 'सरल हिंदी' : 'Easy Hindi'}
                        </span>
                      </div>

                      {video.duration && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white font-bold">
                          {video.duration}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-amber-400 block tracking-wider">
                      {video.category}
                    </span>
                    <h4 className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors line-clamp-2 mt-0.5">
                      {language === 'hi' && video.titleHi ? video.titleHi : video.titleEn}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] font-bold">
                    {isPlaying ? (
                      <button
                        type="button"
                        onClick={() => setInlinePlayingVideoId(null)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Pause className="w-3 h-3 fill-current" />
                        <span>{language === 'hi' ? 'वीडियो बंद करें' : 'Stop Video'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setInlinePlayingVideoId(video.id)}
                        className="text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{language === 'hi' ? 'सीधे चलाएं' : 'Play Video'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setActiveVideoModal(video)}
                      className="text-slate-400 hover:text-white"
                      title="Details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Video Modal in Student Dashboard */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
                <h4 className="font-bold text-sm text-white truncate">
                  {language === 'hi' && activeVideoModal.titleHi ? activeVideoModal.titleHi : activeVideoModal.titleEn}
                </h4>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black relative">
              {(() => {
                const parsed = parseVideoUrl(activeVideoModal.videoURL || (activeVideoModal.youtubeId ? `https://youtube.com/watch?v=${activeVideoModal.youtubeId}` : ''));
                if (parsed.embedUrl) {
                  return (
                    <iframe
                      src={`${parsed.embedUrl}?autoplay=1&rel=0&modestbranding=1`}
                      title={activeVideoModal.titleEn}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                } else if (activeVideoModal.videoURL) {
                  return (
                    <video
                      src={activeVideoModal.videoURL}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                } else {
                  return (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 p-6 text-sm">
                      Video content is loading...
                    </div>
                  );
                }
              })()}
            </div>

            <div className="p-4 bg-slate-900 text-xs text-slate-300 leading-relaxed border-t border-slate-800">
              {language === 'hi' && activeVideoModal.captionHi ? activeVideoModal.captionHi : activeVideoModal.captionEn || activeVideoModal.titleEn}
            </div>
          </div>
        </div>
      )}

      {/* Print ID Card Modal */}
      {printIdCard && currentStudent && (
        <StudentIdCardPrint
          student={currentStudent}
          settings={settings}
          onClose={() => setPrintIdCard(false)}
          onEditProfile={() => {
            setPrintIdCard(false);
            if (onNavigateTab) onNavigateTab('profile');
          }}
        />
      )}

      {/* Print Report Card Modal */}
      {printReport && currentStudent && latestExam && (
        <ReportCardPrint
          student={currentStudent}
          exam={latestExam}
          marks={myMarks}
          attendancePercentage={attendanceStats.percentage}
          settings={settings}
          onClose={() => setPrintReport(false)}
        />
      )}

      {/* 6-Digit Email Verification Code Modal */}
      <StudentEmailVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        email={userProfile?.email || currentStudent?.email || ''}
        studentName={userProfile?.fullName || currentStudent?.name}
        studentId={userProfile?.username || currentStudent?.id}
        uid={userProfile?.uid}
        onSuccess={async () => {
          if (checkAndReloadEmailVerification) {
            await checkAndReloadEmailVerification();
          }
          setEmailStatusMsg('ईमेल सफलतापूर्वक सत्यापित हो गया है!');
        }}
      />
    </div>
  );
};
