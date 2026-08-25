import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Home,
  GraduationCap,
  Users,
  CalendarCheck2,
  Sparkles,
  Settings,
  Search,
  X,
  ChevronRight,
  LogOut,
  Layers,
  BookOpen,
  Clock,
  FileText,
  UserCheck,
  ShieldCheck,
  Award,
  BookOpenCheck,
  Bell,
  Radio,
  Video,
  Image as ImageIcon,
  Building2,
  Wrench,
  Gift,
  Phone,
  TrendingUp,
  History,
  CheckCircle2
} from 'lucide-react';

export interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

interface HubDefinition {
  id: string;
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badge?: number | string;
  subTabs: {
    id: string;
    labelEn: string;
    labelHi: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout
}) => {
  const { userProfile, logout, registrationRequests } = useAuth();
  const { notices, students, teachers, language } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');

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

  const pendingStudentRequestsCount = useMemo(() => {
    return registrationRequests.filter(r => r.requestedRole === 'student' && r.status === 'PENDING').length;
  }, [registrationRequests]);

  const pendingTeacherRequestsCount = useMemo(() => {
    return registrationRequests.filter(r => r.requestedRole === 'teacher' && r.status === 'PENDING').length;
  }, [registrationRequests]);

  const activeNoticesCount = notices.filter(n => n.status === 'active').length;

  // The 6 Consolidated Master Modules (Hubs)
  const hubs: HubDefinition[] = useMemo(() => [
    {
      id: 'dashboard',
      nameEn: 'Executive Dashboard',
      nameHi: 'कार्यकारी डैशबोर्ड',
      descEn: 'Overview, stats & quick actions',
      descHi: 'समग्र सांख्यिकी एवं अवलोकन',
      icon: Home,
      color: 'amber',
      subTabs: []
    },
    {
      id: 'academics',
      nameEn: 'Students & Academics',
      nameHi: 'छात्र एवं शैक्षणिक',
      descEn: 'Students, classes, subjects & timetable',
      descHi: 'नामांकन, कक्षाएं, विषय व समय-सारिणी',
      icon: GraduationCap,
      color: 'indigo',
      badge: pendingStudentRequestsCount > 0 ? `${pendingStudentRequestsCount} New` : undefined,
      subTabs: [
        { id: 'students', labelEn: 'Student Directory & Admissions', labelHi: 'छात्र नामांकन व पंजिका', icon: GraduationCap },
        { id: 'classes', labelEn: 'Classes & Sections', labelHi: 'कक्षाएं एवं वर्ग', icon: Layers },
        { id: 'subjects', labelEn: 'Curriculum & Subjects', labelHi: 'विषय एवं पाठ्यक्रम', icon: BookOpen },
        { id: 'timetable', labelEn: 'Master Timetable', labelHi: 'मास्टर समय-सारिणी', icon: Clock },
        { id: 'documents', labelEn: 'Certificates & TC Vault', labelHi: 'प्रमाणपत्र व टीसी लॉकर', icon: FileText }
      ]
    },
    {
      id: 'faculty',
      nameEn: 'Faculty & Staff',
      nameHi: 'शिक्षक एवं कार्मिक',
      descEn: 'Teachers directory & class allocation',
      descHi: 'शिक्षक पंजिका व कार्य आवंटन',
      icon: Users,
      color: 'emerald',
      badge: pendingTeacherRequestsCount > 0 ? `${pendingTeacherRequestsCount} New` : `${teachers.length}`,
      subTabs: [
        { id: 'teachers', labelEn: 'Faculty Directory & Approvals', labelHi: 'शिक्षक पंजिका व अनुमोदन', icon: Users },
        { id: 'assignments', labelEn: 'Class Allocation', labelHi: 'शिक्षक कार्य आवंटन', icon: UserCheck },
        { id: 'profile', labelEn: 'Headmaster Record', labelHi: 'प्रधानाध्यापिका आधिकारिक रिकॉर्ड', icon: ShieldCheck }
      ]
    },
    {
      id: 'operations',
      nameEn: 'Daily Operations',
      nameHi: 'दैनिक संचालन व परीक्षा',
      descEn: 'Attendance, exams, homework & notices',
      descHi: 'उपस्थिति, परीक्षा परिणाम व सूचनाएं',
      icon: CalendarCheck2,
      color: 'purple',
      badge: activeNoticesCount > 0 ? `${activeNoticesCount} Notices` : undefined,
      subTabs: [
        { id: 'attendance', labelEn: 'Daily Attendance', labelHi: 'दैनिक उपस्थिति पंजिका', icon: CalendarCheck2 },
        { id: 'examinations', labelEn: 'Exams & Marks', labelHi: 'परीक्षा एवं प्रगति पत्र', icon: Award },
        { id: 'homework', labelEn: 'Homework & Broadcasts', labelHi: 'गृहकार्य एवं कार्य', icon: BookOpenCheck },
        { id: 'notices', labelEn: 'Circulars & Notices', labelHi: 'शासनादेश एवं सूचना पट्ट', icon: Bell },
        { id: 'notice-ticker', labelEn: 'Live Notice Ticker', labelHi: 'लाइव सूचना टिकर व अलर्ट', icon: Radio }
      ]
    },
    {
      id: 'cms',
      nameEn: 'Website & Media CMS',
      nameHi: 'वेबसाइट एवं गैलरी CMS',
      descEn: 'Homepage, videos, gallery & schemes',
      descHi: 'मुख्य पृष्ठ, वीडियो, गैलरी व योजनाएं',
      icon: Sparkles,
      color: 'blue',
      subTabs: [
        { id: 'homepage-mgmt', labelEn: 'Homepage & Banners', labelHi: 'मुख्य पृष्ठ प्रबंधन', icon: Sparkles },
        { id: 'notice-ticker', labelEn: 'Live Notice Ticker', labelHi: 'लाइव सूचना टिकर', icon: Radio },
        { id: 'educational-videos', labelEn: 'Educational Videos', labelHi: 'कक्षा 1-8 प्रेरक वीडियो', icon: Video },
        { id: 'media-library', labelEn: 'Photo & Video Gallery', labelHi: 'चित्र व वीडियो गैलरी', icon: ImageIcon },
        { id: 'school-profile', labelEn: 'School Profile & UDISE', labelHi: 'विद्यालय विवरण व UDISE', icon: Building2 },
        { id: 'facilities-mgmt', labelEn: 'Campus Facilities', labelHi: 'भौतिक सुविधाएं', icon: Wrench },
        { id: 'schemes-mgmt', labelEn: 'Govt Schemes & MDM', labelHi: 'योजनाएं व मिड-डे मील', icon: Gift },
        { id: 'admission-mgmt', labelEn: 'Admission Policy', labelHi: 'प्रवेश नियम व नीतियां', icon: GraduationCap },
        { id: 'contact-mgmt', labelEn: 'Contact & Timings', labelHi: 'संपर्क, समय व मैप', icon: Phone }
      ]
    },
    {
      id: 'governance',
      nameEn: 'Governance & Settings',
      nameHi: 'प्रशासन, रिपोर्ट्स व सेटिंग्स',
      descEn: 'Settings, user logins & audit logs',
      descHi: 'विद्यालय सेटिंग्स, लॉगिन व सुरक्षा',
      icon: Settings,
      color: 'rose',
      subTabs: [
        { id: 'settings', labelEn: 'School ERP Settings', labelHi: 'विद्यालय सिस्टम सेटिंग्स', icon: Settings },
        { id: 'users', labelEn: 'User Logins & Access', labelHi: 'उपयोगकर्ता व सुरक्षा', icon: ShieldCheck },
        { id: 'reports', labelEn: 'MIS Analytics & Reports', labelHi: 'प्रशासनिक विश्लेषण व रिपोर्ट', icon: TrendingUp },
        { id: 'audit', labelEn: 'Security Audit Logs', labelHi: 'सुरक्षा ऑडिट लॉग', icon: History }
      ]
    }
  ], [pendingStudentRequestsCount, activeNoticesCount, teachers.length]);

  // Determine active Hub from activeTab
  const currentHubId = useMemo(() => {
    if (activeTab === 'dashboard') return 'dashboard';
    
    // Check if activeTab matches any hub directly
    if (['academics', 'faculty', 'operations', 'cms', 'governance'].includes(activeTab)) {
      return activeTab;
    }

    // Check subTabs mapping
    for (const hub of hubs) {
      if (hub.subTabs.some(st => st.id === activeTab)) {
        return hub.id;
      }
    }

    return 'dashboard';
  }, [activeTab, hubs]);

  // Search Results for instant deep jump
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { hubId: string; tabId: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    hubs.forEach(hub => {
      // Check hub itself
      if (hub.nameEn.toLowerCase().includes(q) || hub.nameHi.toLowerCase().includes(q) || hub.id.toLowerCase().includes(q)) {
        results.push({
          hubId: hub.id,
          tabId: hub.id,
          title: language === 'hi' ? hub.nameHi : hub.nameEn,
          subtitle: language === 'hi' ? hub.descHi : hub.descEn,
          icon: hub.icon
        });
      }

      // Check subtabs
      hub.subTabs.forEach(st => {
        if (st.labelEn.toLowerCase().includes(q) || st.labelHi.toLowerCase().includes(q) || st.id.toLowerCase().includes(q)) {
          results.push({
            hubId: hub.id,
            tabId: st.id,
            title: language === 'hi' ? st.labelHi : st.labelEn,
            subtitle: language === 'hi' ? hub.nameHi : hub.nameEn,
            icon: st.icon
          });
        }
      });
    });

    return results;
  }, [searchQuery, hubs, language]);

  return (
    <>
      {/* Mobile Backdrop Overlay - Persistent with smooth opacity fade (eliminates unmount flicker) */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Container with GPU-accelerated smooth slide */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-slate-900 text-slate-100 border-r border-slate-800 flex flex-col justify-between shadow-2xl lg:shadow-none shrink-0
          transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Search Bar */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div 
              onClick={() => {
                onSelectTab('faculty');
                onClose();
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 touch-manipulation active:scale-[0.98] transition-transform"
              title="Click to view Directorate Profile"
            >
              <div className="relative shrink-0">
                <UserAvatar
                  userProfile={userProfile}
                  size="md"
                  className="ring-2 ring-amber-500/40 group-hover:ring-amber-400 transition-all rounded-2xl"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white group-hover:text-amber-300 transition-colors truncate">
                  {userProfile?.name || 'Headmaster Directorate'}
                </div>
                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  <span>Admin Control Center</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button with optimized 42px touch target */}
            <button
              onClick={onClose}
              className="lg:hidden min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:bg-slate-600 active:scale-95 text-slate-400 hover:text-white transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="mt-3.5 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'मॉड्यूल या कार्य खोजें...' : 'Search module (Attendance, Marks)...'}
              className="w-full pl-9 pr-8 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all touch-manipulation"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-lg touch-manipulation"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content Area */}
        <div className="p-3 space-y-2 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
          {/* Instant Search Results */}
          {searchQuery ? (
            <div className="space-y-1.5">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'hi' ? 'खोज परिणाम' : 'Search Results'} ({searchResults.length})
              </div>
              {searchResults.map((res, i) => {
                const Icon = res.icon;
                return (
                  <button
                    key={`${res.tabId}-${i}`}
                    onClick={() => {
                      onSelectTab(res.tabId);
                      setSearchQuery('');
                      onClose();
                    }}
                    className="w-full min-h-[48px] flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 active:scale-[0.98] text-slate-200 text-left transition-all group cursor-pointer touch-manipulation select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-slate-700/60 group-hover:bg-slate-950/20 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-amber-400 group-hover:text-slate-950" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate group-hover:text-slate-950">{res.title}</div>
                        <div className="text-[10px] text-slate-400 group-hover:text-slate-900 truncate">{res.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-950 shrink-0" />
                  </button>
                );
              })}
              {searchResults.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No matching modules found'}
                </div>
              )}
            </div>
          ) : (
            /* The 6 Clean Primary Hub Cards */
            <div className="space-y-1.5">
              <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {language === 'hi' ? 'मुख्य प्रशासनिक मॉड्यूल' : 'Core Administrative Hubs'}
              </div>

              {hubs.map((hub) => {
                const Icon = hub.icon;
                const isSelected = currentHubId === hub.id;

                return (
                  <button
                    key={hub.id}
                    onClick={() => {
                      onSelectTab(hub.id);
                      onClose();
                    }}
                    className={`w-full min-h-[50px] flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer group relative touch-manipulation select-none active:scale-[0.98] ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                        : 'bg-slate-800/40 hover:bg-slate-800 text-slate-200 border border-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700 group-hover:text-amber-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-black truncate ${isSelected ? 'text-slate-950' : 'text-slate-100 group-hover:text-amber-300'}`}>
                          {language === 'hi' ? hub.nameHi : hub.nameEn}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>
                          {language === 'hi' ? hub.descHi : hub.descEn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {hub.badge && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isSelected ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {hub.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 space-y-2 shrink-0">
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>System Online</span>
            </span>
            <span className="font-mono text-slate-500">v2.5 Simplified</span>
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
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-bold transition-all cursor-pointer touch-manipulation select-none active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};

