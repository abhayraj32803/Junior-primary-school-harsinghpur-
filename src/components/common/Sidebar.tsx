import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Layers, 
  BookMarked, 
  UserCheck, 
  CalendarCheck2, 
  FileSpreadsheet, 
  BookOpenCheck, 
  Clock, 
  BellRing, 
  FileText, 
  BarChart3, 
  History, 
  Settings, 
  BookOpen, 
  Award, 
  FileCheck,
  X,
  School,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, isOpen, onClose }) => {
  const { role, userProfile } = useAuth();
  const { settings, homeworkList, notices } = useSchool();

  const getMenuItems = () => {
    if (role === 'admin') {
      return [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students Directory', icon: GraduationCap },
        { id: 'teachers', label: 'Faculty & Staff', icon: Users },
        { id: 'classes', label: 'Classes & Sections', icon: Layers },
        { id: 'subjects', label: 'Subjects Management', icon: BookMarked },
        { id: 'assignments', label: 'Teacher Assignments', icon: UserCheck },
        { id: 'attendance', label: 'School Attendance', icon: CalendarCheck2 },
        { id: 'examinations', label: 'Exams & Marks', icon: FileSpreadsheet },
        { id: 'homework', label: 'Homework Oversight', icon: BookOpenCheck },
        { id: 'timetable', label: 'Master Timetable', icon: Clock },
        { id: 'notices', label: 'Notices & Circulars', icon: BellRing, badge: notices.filter(n => n.status === 'active').length },
        { id: 'documents', label: 'Student Documents', icon: FileText },
        { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
        { id: 'audit', label: 'Audit Trail Logs', icon: History },
        { id: 'settings', label: 'School Settings', icon: Settings },
      ];
    } else if (role === 'teacher') {
      return [
        { id: 'dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard },
        { id: 'my-classes', label: 'My Assigned Classes', icon: Layers },
        { id: 'my-students', label: 'My Students', icon: GraduationCap },
        { id: 'attendance', label: 'Mark Attendance', icon: CalendarCheck2 },
        { id: 'marks', label: 'Enter Exam Marks', icon: FileSpreadsheet },
        { id: 'homework', label: 'Homework & Tasks', icon: BookOpenCheck, badge: homeworkList.length },
        { id: 'timetable', label: 'My Timetable', icon: Clock },
        { id: 'notices', label: 'Class Notices', icon: BellRing },
        { id: 'my-profile', label: 'My Faculty Profile', icon: UserCheck },
      ];
    } else {
      // Student
      return [
        { id: 'dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
        { id: 'my-profile', label: 'Student ID & Profile', icon: GraduationCap },
        { id: 'attendance', label: 'My Attendance Record', icon: CalendarCheck2 },
        { id: 'subjects', label: 'My Enrolled Subjects', icon: BookOpen },
        { id: 'results', label: 'Exam Results & Marks', icon: Award },
        { id: 'homework', label: 'My Homework Tasks', icon: FileCheck },
        { id: 'timetable', label: 'Weekly Timetable', icon: Clock },
        { id: 'notices', label: 'School Notices', icon: BellRing },
        { id: 'documents', label: 'My Certificates', icon: FileText },
      ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none border-r border-slate-800`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Govt. School Portal</div>
              <div className="text-sm font-semibold text-white truncate max-w-[150px]">Classes 1 to 8</div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Mini Banner */}
        <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <UserAvatar 
              userProfile={userProfile}
              size="sm"
              shape="circle"
            />
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate">{userProfile?.name}</div>
              <div className="text-[10px] text-amber-400 font-medium capitalize flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {userProfile?.role} {role === 'student' ? '(Class 8-A)' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {role === 'admin' ? 'Administrative Suite' : role === 'teacher' ? 'Faculty Tools' : 'Student Space'}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (window.innerWidth < 1024) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive 
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                  <span>{item.label}</span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-950" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="truncate">
            <div className="font-semibold text-slate-300">{settings.academicYear}</div>
            <div className="text-[10px] text-slate-500">Government Primary & Upper Primary</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400" title="System Online"></div>
        </div>
      </aside>
    </>
  );
};
