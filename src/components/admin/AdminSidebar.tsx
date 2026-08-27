import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  LayoutDashboard,
  GraduationCap,
  Users2,
  CalendarCheck2,
  Sparkles,
  Settings2,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  LogOut,
  Layers3,
  BookOpen,
  CalendarClock,
  ScrollText,
  Users,
  UserCheck2,
  ShieldCheck,
  Award,
  BookOpenCheck,
  BellRing,
  Radio,
  Video,
  Images,
  Building2,
  Wrench,
  Utensils,
  PhoneCall,
  TrendingUp,
  History,
  CheckCircle2,
  UserCog,
  FileCheck2,
  Activity,
  SlidersHorizontal,
  LayoutTemplate,
  Contact2
} from 'lucide-react';

export interface AdminSidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

interface SubModuleDefinition {
  id: string;
  labelEn: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
}

interface ModuleTheme {
  tintBg: string;
  activeBg: string;
  activeBorder: string;
  activeText: string;
  activeIconBg: string;
  activeIconText: string;
  badgeBg: string;
  indicatorColor: string;
}

interface ModuleDefinition {
  id: string;
  category: 'MAIN' | 'ACADEMICS' | 'FACULTY' | 'OPERATIONS' | 'CMS' | 'GOVERNANCE';
  categoryLabelEn: string;
  categoryLabelHi: string;
  nameEn: string;
  nameHi: string;
  descEn: string;
  descHi: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number | string;
  theme: ModuleTheme;
  subTabs: SubModuleDefinition[];
}

const MODULE_THEMES: Record<string, ModuleTheme> = {
  MAIN: {
    tintBg: 'hover:bg-amber-500/10 hover:border-amber-500/30',
    activeBg: 'bg-amber-500/12 text-amber-200 border-amber-500/35 shadow-xs',
    activeBorder: 'border-amber-500/40',
    activeText: 'text-amber-100',
    activeIconBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    activeIconText: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    indicatorColor: 'bg-amber-400'
  },
  ACADEMICS: {
    tintBg: 'hover:bg-blue-500/10 hover:border-blue-500/30',
    activeBg: 'bg-blue-500/12 text-blue-200 border-blue-500/35 shadow-xs',
    activeBorder: 'border-blue-500/40',
    activeText: 'text-blue-100',
    activeIconBg: 'bg-blue-500/20 border-blue-400/40 text-blue-300',
    activeIconText: 'text-blue-300',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    indicatorColor: 'bg-blue-400'
  },
  FACULTY: {
    tintBg: 'hover:bg-emerald-500/10 hover:border-emerald-500/30',
    activeBg: 'bg-emerald-500/12 text-emerald-200 border-emerald-500/35 shadow-xs',
    activeBorder: 'border-emerald-500/40',
    activeText: 'text-emerald-100',
    activeIconBg: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300',
    activeIconText: 'text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    indicatorColor: 'bg-emerald-400'
  },
  OPERATIONS: {
    tintBg: 'hover:bg-amber-500/10 hover:border-amber-500/30',
    activeBg: 'bg-amber-500/12 text-amber-200 border-amber-500/35 shadow-xs',
    activeBorder: 'border-amber-500/40',
    activeText: 'text-amber-100',
    activeIconBg: 'bg-amber-500/20 border-amber-400/40 text-amber-300',
    activeIconText: 'text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    indicatorColor: 'bg-amber-400'
  },
  CMS: {
    tintBg: 'hover:bg-sky-500/10 hover:border-sky-500/30',
    activeBg: 'bg-sky-500/12 text-sky-200 border-sky-500/35 shadow-xs',
    activeBorder: 'border-sky-500/40',
    activeText: 'text-sky-100',
    activeIconBg: 'bg-sky-500/20 border-sky-400/40 text-sky-300',
    activeIconText: 'text-sky-300',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    indicatorColor: 'bg-sky-400'
  },
  GOVERNANCE: {
    tintBg: 'hover:bg-purple-500/10 hover:border-purple-500/30',
    activeBg: 'bg-purple-500/12 text-purple-200 border-purple-500/35 shadow-xs',
    activeBorder: 'border-purple-500/40',
    activeText: 'text-purple-100',
    activeIconBg: 'bg-purple-500/20 border-purple-400/40 text-purple-300',
    activeIconText: 'text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    indicatorColor: 'bg-purple-400'
  }
};

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  onLogout
}) => {
  const { userProfile, logout, registrationRequests } = useAuth();
  const { notices, teachers, language } = useSchool();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    academics: true,
    faculty: false,
    operations: false,
    cms: false,
    governance: false
  });

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

  // Master Categorized Navigation: 'Academics', 'Faculty', 'Operations', 'CMS', 'Governance' & Executive Dashboard
  const modules: ModuleDefinition[] = useMemo(() => [
    {
      id: 'dashboard',
      category: 'MAIN',
      categoryLabelEn: 'Core Control',
      categoryLabelHi: 'मुख्य नियंत्रण',
      nameEn: 'Executive Dashboard',
      nameHi: 'कार्यकारी डैशबोर्ड',
      descEn: 'Overview, KPIs & quick actions',
      descHi: 'समग्र सांख्यिकी एवं अवलोकन',
      icon: LayoutDashboard,
      theme: MODULE_THEMES.MAIN,
      subTabs: []
    },
    {
      id: 'academics',
      category: 'ACADEMICS',
      categoryLabelEn: 'Academics',
      categoryLabelHi: 'शैक्षणिक मॉड्यूल',
      nameEn: 'Academics',
      nameHi: 'शैक्षणिक केंद्र',
      descEn: 'Students, classes, subjects & TC vault',
      descHi: 'नामांकन, कक्षाएं, विषय व समय-सारिणी',
      icon: GraduationCap,
      badge: pendingStudentRequestsCount > 0 ? `${pendingStudentRequestsCount} New` : undefined,
      theme: MODULE_THEMES.ACADEMICS,
      subTabs: [
        { 
          id: 'students', 
          labelEn: 'Students & Admissions', 
          labelHi: 'छात्र नामांकन व पंजिका', 
          icon: Contact2,
          badge: pendingStudentRequestsCount > 0 ? `${pendingStudentRequestsCount} New` : undefined
        },
        { id: 'classes', labelEn: 'Classes & Sections', labelHi: 'कक्षाएं एवं वर्ग', icon: Layers3 },
        { id: 'subjects', labelEn: 'Curriculum & Subjects', labelHi: 'विषय एवं पाठ्यक्रम', icon: BookOpen },
        { id: 'timetable', labelEn: 'Master Timetable', labelHi: 'मास्टर समय-सारिणी', icon: CalendarClock },
        { id: 'documents', labelEn: 'Certificates & TC Vault', labelHi: 'प्रमाणपत्र व टीसी लॉकर', icon: ScrollText }
      ]
    },
    {
      id: 'faculty',
      category: 'FACULTY',
      categoryLabelEn: 'Faculty',
      categoryLabelHi: 'शिक्षक मॉड्यूल',
      nameEn: 'Faculty',
      nameHi: 'शिक्षक केंद्र',
      descEn: 'Directory, approvals & allocation',
      descHi: 'शिक्षक पंजिका व कार्य आवंटन',
      icon: Users2,
      badge: pendingTeacherRequestsCount > 0 ? `${pendingTeacherRequestsCount} New` : `${teachers.length}`,
      theme: MODULE_THEMES.FACULTY,
      subTabs: [
        { 
          id: 'teachers', 
          labelEn: 'Faculty Directory & Approvals', 
          labelHi: 'शिक्षक पंजिका व अनुमोदन', 
          icon: Users,
          badge: pendingTeacherRequestsCount > 0 ? `${pendingTeacherRequestsCount}` : undefined
        },
        { id: 'assignments', labelEn: 'Class Allocation', labelHi: 'शिक्षक कार्य आवंटन', icon: UserCheck2 },
        { id: 'profile', labelEn: 'Headmaster Record', labelHi: 'प्रधानाध्यापक आधिकारिक रिकॉर्ड', icon: ShieldCheck }
      ]
    },
    {
      id: 'operations',
      category: 'OPERATIONS',
      categoryLabelEn: 'Operations',
      categoryLabelHi: 'संचालन मॉड्यूल',
      nameEn: 'Operations',
      nameHi: 'संचालन केंद्र',
      descEn: 'Attendance, exams, homework & notices',
      descHi: 'उपस्थिति, परीक्षा परिणाम व सूचनाएं',
      icon: CalendarCheck2,
      badge: activeNoticesCount > 0 ? `${activeNoticesCount} Active` : undefined,
      theme: MODULE_THEMES.OPERATIONS,
      subTabs: [
        { id: 'attendance', labelEn: 'Daily Attendance', labelHi: 'दैनिक उपस्थिति पंजिका', icon: Activity },
        { id: 'examinations', labelEn: 'Exams & Marks', labelHi: 'परीक्षा एवं प्रगति पत्र', icon: Award },
        { id: 'homework', labelEn: 'Homework & Broadcasts', labelHi: 'गृहकार्य एवं कार्य', icon: BookOpenCheck },
        { id: 'notices', labelEn: 'Circulars & Notices', labelHi: 'शासनादेश एवं सूचना पट्ट', icon: BellRing }
      ]
    },
    {
      id: 'cms',
      category: 'CMS',
      categoryLabelEn: 'CMS',
      categoryLabelHi: 'वेबसाइट व मीडिया CMS',
      nameEn: 'CMS',
      nameHi: 'वेबसाइट CMS',
      descEn: 'Homepage, videos, gallery & schemes',
      descHi: 'मुख्य पृष्ठ, वीडियो, गैलरी व योजनाएं',
      icon: Sparkles,
      theme: MODULE_THEMES.CMS,
      subTabs: [
        { id: 'homepage-mgmt', labelEn: 'Homepage & Banners', labelHi: 'मुख्य पृष्ठ प्रबंधन', icon: LayoutTemplate },
        { id: 'notice-ticker', labelEn: 'Live Notice Ticker', labelHi: 'लाइव सूचना टिकर व अलर्ट', icon: Radio },
        { id: 'educational-videos', labelEn: 'Educational Videos', labelHi: 'कक्षा 1-8 प्रेरक वीडियो', icon: Video },
        { id: 'media-library', labelEn: 'Photo & Video Gallery', labelHi: 'चित्र व वीडियो गैलरी', icon: Images },
        { id: 'school-profile', labelEn: 'School Profile & UDISE', labelHi: 'विद्यालय विवरण व UDISE', icon: Building2 },
        { id: 'facilities-mgmt', labelEn: 'Campus Facilities', labelHi: 'भौतिक सुविधाएं', icon: Wrench },
        { id: 'schemes-mgmt', labelEn: 'Govt Schemes & MDM', labelHi: 'योजनाएं व मिड-डे मील', icon: Utensils },
        { id: 'admission-mgmt', labelEn: 'Admission Policy', labelHi: 'प्रवेश नियम व नीतियां', icon: FileCheck2 },
        { id: 'contact-mgmt', labelEn: 'Contact & Timings', labelHi: 'संपर्क, समय व मैप', icon: PhoneCall }
      ]
    },
    {
      id: 'governance',
      category: 'GOVERNANCE',
      categoryLabelEn: 'Governance',
      categoryLabelHi: 'प्रशासन व गवर्नेंस',
      nameEn: 'Governance',
      nameHi: 'प्रशासन व सेटिंग्स',
      descEn: 'Settings, user logins & audit logs',
      descHi: 'विद्यालय सेटिंग्स, लॉगिन व सुरक्षा',
      icon: Settings2,
      theme: MODULE_THEMES.GOVERNANCE,
      subTabs: [
        { id: 'settings', labelEn: 'School ERP Settings', labelHi: 'विद्यालय सिस्टम सेटिंग्स', icon: SlidersHorizontal },
        { id: 'users', labelEn: 'User Logins & Access', labelHi: 'उपयोगकर्ता व सुरक्षा', icon: UserCog },
        { id: 'reports', labelEn: 'MIS Analytics & Reports', labelHi: 'प्रशासनिक विश्लेषण व रिपोर्ट', icon: TrendingUp },
        { id: 'audit', labelEn: 'Security Audit Logs', labelHi: 'सुरक्षा ऑडिट लॉग', icon: History }
      ]
    }
  ], [pendingStudentRequestsCount, pendingTeacherRequestsCount, activeNoticesCount, teachers.length]);

  // Determine active Module from activeTab and auto-expand that module
  const currentModuleId = useMemo(() => {
    if (activeTab === 'dashboard') return 'dashboard';
    
    if (['academics', 'faculty', 'operations', 'cms', 'governance'].includes(activeTab)) {
      return activeTab;
    }

    for (const mod of modules) {
      if (mod.subTabs.some(st => st.id === activeTab)) {
        return mod.id;
      }
    }

    return 'dashboard';
  }, [activeTab, modules]);

  useEffect(() => {
    if (currentModuleId && currentModuleId !== 'dashboard') {
      setExpandedModules(prev => ({ ...prev, [currentModuleId]: true }));
    }
  }, [currentModuleId]);

  const toggleModuleExpansion = (moduleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  // Search Results for instant deep jump
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { 
      moduleId: string; 
      tabId: string; 
      title: string; 
      subtitle: string; 
      icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
      theme: ModuleTheme;
    }[] = [];

    modules.forEach(mod => {
      if (mod.nameEn.toLowerCase().includes(q) || mod.nameHi.toLowerCase().includes(q) || mod.id.toLowerCase().includes(q)) {
        results.push({
          moduleId: mod.id,
          tabId: mod.id,
          title: language === 'hi' ? mod.nameHi : mod.nameEn,
          subtitle: language === 'hi' ? mod.descHi : mod.descEn,
          icon: mod.icon,
          theme: mod.theme
        });
      }

      mod.subTabs.forEach(st => {
        if (st.labelEn.toLowerCase().includes(q) || st.labelHi.toLowerCase().includes(q) || st.id.toLowerCase().includes(q)) {
          results.push({
            moduleId: mod.id,
            tabId: st.id,
            title: language === 'hi' ? st.labelHi : st.labelEn,
            subtitle: language === 'hi' ? mod.nameHi : mod.nameEn,
            icon: st.icon,
            theme: mod.theme
          });
        }
      });
    });

    return results;
  }, [searchQuery, modules, language]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-[#060913]/80 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Container with Premium Dark Base */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-[#0A0E1A] text-slate-100 border-r border-slate-800/80 flex flex-col justify-between shadow-2xl lg:shadow-none shrink-0
          transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Search Bar */}
        <div className="p-3.5 sm:p-4 bg-[#080B14] border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div 
              onClick={() => {
                onSelectTab('faculty');
                onClose();
              }}
              className="flex items-center gap-3 min-w-0 cursor-pointer group flex-1 touch-manipulation active:scale-[0.98] transition-transform min-h-[44px]"
              title="Click to view Directorate Profile"
              id="btn-admin-profile-header"
            >
              <div className="relative shrink-0">
                <UserAvatar
                  userProfile={userProfile}
                  size="md"
                  className="ring-2 ring-indigo-500/30 group-hover:ring-indigo-400/60 transition-all rounded-xl shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0A0E1A]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {userProfile?.name || 'Headmaster Directorate'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  <span>Admin ERP Suite</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0 border border-slate-700/60"
              aria-label="Close sidebar"
              id="btn-admin-sidebar-close"
            >
              <X className="w-5 h-5 text-white" strokeWidth={2} />
            </button>
          </div>

          {/* Quick Search */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'मॉड्यूल खोजें (उपस्थिति, अंक, CMS)...' : 'Search modules (Academics, CMS)...'}
              className="w-full pl-9 pr-8 min-h-[38px] py-2 bg-slate-900/90 border border-slate-700/60 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] text-slate-400 hover:text-white flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content Area */}
        <div className="p-3 space-y-3 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
          {/* Instant Search Results */}
          {searchQuery ? (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
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
                    className={`w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-200 active:scale-[0.98] text-slate-200 text-left transition-all group cursor-pointer border border-transparent`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center shrink-0 border border-slate-700/60 group-hover:border-indigo-500/30 transition-colors">
                        <Icon className="w-4 h-4 text-slate-300 group-hover:text-indigo-300 transition-colors" strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate group-hover:text-indigo-200 transition-colors">{res.title}</div>
                        <div className="text-[10px] text-slate-400 group-hover:text-indigo-300/70 truncate transition-colors">{res.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-300 shrink-0 transition-colors" strokeWidth={2} />
                  </button>
                );
              })}
              {searchResults.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400">
                  {language === 'hi' ? 'कोई मॉड्यूल नहीं मिला' : 'No matching modules found'}
                </div>
              )}
            </div>
          ) : (
            /* Categorized Modules: Academics, Faculty, Operations, CMS, Governance */
            <div className="space-y-3">
              {modules.map((mod, index) => {
                const Icon = mod.icon;
                const isModuleActive = currentModuleId === mod.id;
                const isExpanded = expandedModules[mod.id] || false;
                const hasSubTabs = mod.subTabs.length > 0;
                const theme = mod.theme;

                return (
                  <div key={mod.id} className="space-y-1">
                    {/* Category Label Header */}
                    {(index === 0 || mod.category !== modules[index - 1].category) && (
                      <div className="px-2 pt-1 pb-0.5 text-[10px] font-bold text-slate-400/80 uppercase tracking-wider flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.indicatorColor}`} />
                        <span>{language === 'hi' ? mod.categoryLabelHi : mod.categoryLabelEn}</span>
                      </div>
                    )}

                    {/* Master Module Tile with Subtle Background Tint on Active State */}
                    <div
                      className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer group relative touch-manipulation border ${
                        isModuleActive
                          ? theme.activeBg
                          : `bg-slate-800/30 ${theme.tintBg} text-slate-300 border-slate-800/60`
                      }`}
                      onClick={() => {
                        onSelectTab(mod.id);
                        onClose();
                      }}
                      id={`nav-module-${mod.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
                          isModuleActive
                            ? theme.activeIconBg
                            : 'bg-slate-800/90 text-slate-400 border-slate-700/60 group-hover:bg-slate-800 group-hover:text-slate-200'
                        }`}>
                          <Icon className={`w-4 h-4 transition-colors ${isModuleActive ? theme.activeIconText : 'text-slate-400 group-hover:text-slate-200'}`} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate transition-colors ${isModuleActive ? theme.activeText : 'text-slate-200 group-hover:text-white'}`}>
                            {language === 'hi' ? mod.nameHi : mod.nameEn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        {mod.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isModuleActive 
                              ? theme.badgeBg 
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}>
                            {mod.badge}
                          </span>
                        )}

                        {hasSubTabs ? (
                          <button
                            type="button"
                            onClick={(e) => toggleModuleExpansion(mod.id, e)}
                            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Toggle sub-modules"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" strokeWidth={2} />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" strokeWidth={2} />
                            )}
                          </button>
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 transition-colors ${isModuleActive ? theme.activeIconText : 'text-slate-500'}`} strokeWidth={2} />
                        )}
                      </div>
                    </div>

                    {/* SubTabs Accordion Dropdown with Dynamic SubIcon & Active Subtle Tints */}
                    {hasSubTabs && isExpanded && (
                      <div className="pl-4 pr-1 py-1 space-y-0.5 border-l-2 border-slate-800/80 ml-3.5 my-1">
                        {mod.subTabs.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeTab === sub.id;

                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectTab(sub.id);
                                onClose();
                              }}
                              className={`w-full min-h-[36px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer group/sub ${
                                isSubActive
                                  ? `${theme.activeBg} font-bold border-l-2 ${theme.activeBorder} pl-2 shadow-2xs`
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                              }`}
                              id={`nav-subtab-${sub.id}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                                  isSubActive ? theme.activeIconText : 'text-slate-400 group-hover/sub:text-slate-200'
                                }`}>
                                  <SubIcon className="w-3.5 h-3.5" strokeWidth={1.8} />
                                </div>
                                <span className="truncate">
                                  {language === 'hi' ? sub.labelHi : sub.labelEn}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {sub.badge && (
                                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${theme.badgeBg}`}>
                                    {sub.badge}
                                  </span>
                                )}
                                {isSubActive && (
                                  <span className={`w-1.5 h-1.5 rounded-full ${theme.indicatorColor} shrink-0`} />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & Logout */}
        <div className="p-3.5 bg-[#080B14] border-t border-slate-800/80 space-y-2 shrink-0">
          <div className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" strokeWidth={2} />
              <span>ERP System Online</span>
            </span>
            <span className="font-mono text-slate-400">v2.6 Enterprise</span>
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
            className="w-full min-h-[40px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
            id="btn-admin-logout"
          >
            <LogOut className="w-4 h-4 shrink-0" strokeWidth={2} />
            <span>{language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
