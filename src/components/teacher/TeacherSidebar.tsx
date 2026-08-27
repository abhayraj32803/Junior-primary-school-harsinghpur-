import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Home,
  UserCheck,
  Image as ImageIcon,
  GraduationCap,
  CalendarCheck2,
  Award,
  BookOpenCheck,
  Clock,
  LogOut,
  X,
  Sparkles,
  BookOpen,
  CheckCircle2
} from 'lucide-react';

export interface TeacherSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const TeacherSidebar: React.FC<TeacherSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout
}) => {
  const { userProfile, logout } = useAuth();
  const { settings, homeworkList, language } = useSchool();

  // Lock background scroll on mobile when drawer is open, and support ESC to close
  useEffect(() => {
    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const teacherNavGroups = [
    {
      titleEn: 'Teaching & Classroom',
      titleHi: 'कक्षा शिक्षण एवं दैनिक कार्य',
      items: [
        { id: 'dashboard', labelEn: 'Faculty Dashboard', labelHi: 'शिक्षक डैशबोर्ड', icon: Home },
        { id: 'students', labelEn: 'Assigned Students', labelHi: 'कक्षा के छात्र', icon: GraduationCap },
        { id: 'attendance', labelEn: 'Attendance Register', labelHi: 'दैनिक उपस्थिति पंजिका', icon: CalendarCheck2 },
        { id: 'marks', labelEn: 'Marks & Evaluations', labelHi: 'परीक्षा प्राप्तांक व प्रगति', icon: Award },
        { id: 'homework', labelEn: 'Homework Desk', labelHi: 'दैनिक गृहकार्य', icon: BookOpenCheck, badge: homeworkList.length },
        { id: 'timetable', labelEn: 'Teaching Timetable', labelHi: 'शिक्षण समय-सारिणी', icon: Clock },
      ]
    },
    {
      titleEn: 'Faculty Profile & Archive',
      titleHi: 'प्रोफाइल एवं मीडिया संग्रह',
      items: [
        { id: 'profile', labelEn: 'My Faculty Profile', labelHi: 'शिक्षक प्रोफाइल व विवरण', icon: UserCheck },
        { id: 'gallery-upload', labelEn: 'Media & Video Upload', labelHi: 'फोटो व वीडियो अपलोड', icon: ImageIcon },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay - Smooth fade-in/out */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between shadow-2xl lg:shadow-none shrink-0
          transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div 
              onClick={() => {
                onSelectTab('profile');
                onClose();
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 touch-manipulation active:scale-[0.98] transition-transform"
            >
              <div className="relative shrink-0">
                <UserAvatar
                  userProfile={userProfile}
                  size="md"
                  className="ring-2 ring-amber-500/40 group-hover:ring-amber-400 transition-all rounded-2xl"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                  {userProfile?.name || 'Faculty Member'}
                </div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span>Faculty Directorate</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-4 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
          {teacherNavGroups.map((group, idx) => (
            <div key={idx} className="space-y-1 bg-slate-950/40 p-2.5 rounded-2xl border border-slate-800/60">
              <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-amber-400/80">
                {language === 'hi' ? group.titleHi : group.titleEn}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`
                        w-full min-h-[46px] flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer group select-none touch-manipulation active:scale-[0.98]
                        ${isActive
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-amber-400'}`} />
                        <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/95 space-y-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-slate-400 truncate flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold text-slate-200 truncate">{settings.schoolName}</span>
          </div>
          <button
            onClick={async () => {
              if (onLogout) {
                await onLogout();
              } else {
                await logout();
              }
              onClose?.();
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 active:bg-rose-700 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'hi' ? 'साइन आउट (Logout)' : 'Sign Out / Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
