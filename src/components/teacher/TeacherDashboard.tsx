import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  BookOpen, 
  CalendarCheck2, 
  Award, 
  Clock, 
  Users, 
  Bell, 
  BookOpenCheck, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  UserCheck,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

interface TeacherDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onNavigateTab }) => {
  const { userProfile } = useAuth();
  const { teachers, teacherAssignments, students, homeworkList, notices, timetable, gallery } = useSchool();

  const currentTeacher = teachers.find(t => t.id === userProfile?.entityId) || teachers[0];
  const photoURL = userProfile?.photoURL || currentTeacher?.photoURL;
  const myAssignments = teacherAssignments.filter(a => a.teacherId === currentTeacher?.id);
  const myHomework = homeworkList.filter(h => h.teacherId === currentTeacher?.id || h.teacherName.includes(currentTeacher?.name || ''));
  const mySchedule = timetable.filter(t => t.teacherName.includes(currentTeacher?.name || ''));
  const myUploadedPhotos = gallery.filter(g => g.uploadedBy === userProfile?.id || g.uploaderRole === 'Teacher' || (g.uploaderName && userProfile?.name && g.uploaderName.includes(userProfile.name)));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-5 relative z-10">
          <UserAvatar
            userProfile={userProfile}
            photoURL={currentTeacher?.photoURL}
            name={currentTeacher?.name || userProfile?.name}
            role="teacher"
            size="xl"
            onClick={() => onNavigateTab('profile')}
            className="hover:scale-105 transition-transform"
          />

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Faculty Educator Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {currentTeacher?.name || userProfile?.name || 'Teacher'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {currentTeacher?.designation || 'Assistant Teacher'} • {currentTeacher?.qualification || 'Graduate'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 relative z-10 shrink-0">
          <button
            onClick={() => onNavigateTab('gallery-upload')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Photos & Videos (फोटो व वीडियो)</span>
          </button>
          <button
            onClick={() => onNavigateTab('profile')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700 shadow-md transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <span>My Profile (प्रोफाइल)</span>
          </button>
          <button
            onClick={() => onNavigateTab('students')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <Users className="w-4 h-4 text-purple-200" />
            <span>My Students (छात्र सूची)</span>
          </button>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Take Attendance</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab('timetable')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Classes</span>
            <BookOpen className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myAssignments.length} Allotments</div>
          <div className="text-[11px] text-slate-500 font-medium">Classes 6, 7, 8 (Science & Math)</div>
        </div>

        <div 
          onClick={() => onNavigateTab('homework')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Homework</span>
            <BookOpenCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{myHomework.length} Tasks</div>
          <div className="text-[11px] text-emerald-600 font-medium">Distributed to students</div>
        </div>

        <div 
          onClick={() => onNavigateTab('gallery-upload')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Media & Video Archive</span>
            <Camera className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{gallery.length} Photos & Videos</div>
          <div className="text-[11px] text-rose-600 font-medium">{myUploadedPhotos.length} uploaded by you • Upload new</div>
        </div>

        <div 
          onClick={() => onNavigateTab('timetable')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 cursor-pointer transition-all space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Weekly Period Load</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{mySchedule.length} Periods / Wk</div>
          <div className="text-[11px] text-slate-500 font-medium">Monday to Saturday</div>
        </div>
      </div>

      {/* Grid: Allotments + Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: My Teaching Allocations */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>My Teaching Allotments</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">2025-2026 Session</span>
          </div>

          <div className="space-y-2.5">
            {myAssignments.map((asgn) => (
              <div key={asgn.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 block text-sm">
                    {asgn.subjectName}
                  </span>
                  <span className="text-slate-500">
                    Class {asgn.classNumber} - Section '{asgn.sectionName}'
                  </span>
                </div>
                <button
                  onClick={() => onNavigateTab('attendance')}
                  className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-600 font-bold text-xs shadow-xs"
                >
                  Register
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Today's Period Schedule */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Today's Class Schedule</span>
            </h3>
            <button
              onClick={() => onNavigateTab('timetable')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Full Schedule
            </button>
          </div>

          <div className="space-y-2">
            {mySchedule.slice(0, 4).map((slot) => (
              <div key={slot.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">
                    Period {slot.periodNumber} • {slot.subjectName}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Class {slot.classNumber} - '{slot.sectionName}' ({slot.roomNumber})
                  </div>
                </div>
                <div className="font-mono text-[11px] text-amber-700 font-bold px-2 py-0.5 bg-amber-50 rounded-md">
                  {slot.startTime} - {slot.endTime}
                </div>
              </div>
            ))}
            {mySchedule.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">No scheduled periods for today.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
