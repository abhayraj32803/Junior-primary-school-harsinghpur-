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
  ChevronDown,
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
  const [expandedHubs, setExpandedHubs] = useState<Record<string, boolean>>({
    academics: true,
    operations: false,
    faculty: false,
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

  // The 6 Consolidated Master Modules (Hubs)
  const hubs: HubDefinition[] = useMemo(() => [
    {
      id: 'dashboard',
      nameEn: 'Executive Dashboard',
      nameHi: 'कार्यकारी डैशबोर्ड',
      descEn: 'Overview, KPIs & quick actions',
      descHi: 'समग्र सांख्यिकी एवं अवलोकन',
      icon: Home,
      subTabs: []
    },
    {
      id: 'academics',
      nameEn: 'Students & Academics',
      nameHi: 'छात्र एवं शैक्षणिक',
      descEn: 'Students, classes, subjects & TC vault',
      descHi: 'नामांकन, कक्षाएं, विषय व समय-सारिणी',
      icon: GraduationCap,
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
      descEn: 'Directory, approvals & allocation',
      descHi: 'शिक्षक पंजिका व कार्य आवंटन',
      icon: Users,
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
      subTabs: [
        { id: 'homepage-mgmt', labelEn: 'Homepage & Banners', labelHi: 'मुख्य पृष्ठ प्रबंधन', icon: Sparkles },
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
      subTabs: [
        { id: 'settings', labelEn: 'School ERP Settings', labelHi: 'विद्यालय सिस्टम सेटिंग्स', icon: Settings },
        { id: 'users', labelEn: 'User Logins & Access', labelHi: 'उपयोगकर्ता व सुरक्षा', icon: ShieldCheck },
        { id: 'reports', labelEn: 'MIS Analytics & Reports', labelHi: 'प्रशासनिक विश्लेषण व रिपोर्ट', icon: TrendingUp },
        { id: 'audit', labelEn: 'Security Audit Logs', labelHi: 'सुरक्षा ऑडिट लॉग', icon: History }
      ]
    }
  ], [pendingStudentRequestsCount, pendingTeacherRequestsCount, activeNoticesCount, teachers.length]);

  // Determine active Hub from activeTab and auto-expand that hub
  const currentHubId = useMemo(() => {
    if (activeTab === 'dashboard') return 'dashboard';
    
    if (['academics', 'faculty', 'operations', 'cms', 'governance'].includes(activeTab)) {
      return activeTab;
    }

    for (const hub of hubs) {
      if (hub.subTabs.some(st => st.id === activeTab)) {
        return hub.id;
      }
    }

    return 'dashboard';
  }, [activeTab, hubs]);

  useEffect(() => {
    if (currentHubId && currentHubId !== 'dashboard') {
      setExpandedHubs(prev => ({ ...prev, [currentHubId]: true }));
    }
  }, [currentHubId]);

  const toggleHubExpansion = (hubId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedHubs(prev => ({ ...prev, [hubId]: !prev[hubId] }));
  };

  // Search Results for instant deep jump
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: { hubId: string; tabId: string; title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }[] = [];

    hubs.forEach(hub => {
      if (hub.nameEn.toLowerCase().includes(q) || hub.nameHi.toLowerCase().includes(q) || hub.id.toLowerCase().includes(q)) {
        results.push({
          hubId: hub.id,
          tabId: hub.id,
          title: language === 'hi' ? hub.nameHi : hub.nameEn,
          subtitle: language === 'hi' ? hub.descHi : hub.descEn,
          icon: hub.icon
        });
      }

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
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-[#0F172A]/70 backdrop-blur-[4px] z-40 lg:hidden transition-opacity duration-200 ease-out ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Container */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 sm:w-80 max-w-[85vw] bg-[#0F172A] text-slate-100 border-r border-slate-800 flex flex-col justify-between shadow-2xl lg:shadow-none shrink-0
          transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Top Header & Search Bar */}
        <div className="p-4 bg-[#0B1120] border-b border-slate-800/80 shrink-0">
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
                  className="ring-2 ring-indigo-500/40 group-hover:ring-indigo-400 transition-all rounded-xl"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0F172A]" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {userProfile?.name || 'Headmaster Directorate'}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  <span>Admin ERP Center</span>
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0 border border-slate-700/60"
              aria-label="Close sidebar"
              id="btn-admin-sidebar-close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Quick Search */}
          <div className="mt-3 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'hi' ? 'मॉड्यूल खोजें (उपस्थिति, अंक)...' : 'Search module (Attendance, Marks)...'}
              className="w-full pl-9 pr-8 min-h-[38px] py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] text-slate-400 hover:text-white flex items-center justify-center rounded-lg cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Content Area */}
        <div className="p-3 space-y-1.5 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
          {/* Instant Search Results */}
          {searchQuery ? (
            <div className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
                    className="w-full min-h-[44px] flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white active:scale-[0.98] text-slate-200 text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-slate-700/60 group-hover:bg-indigo-700 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-indigo-300 group-hover:text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate group-hover:text-white">{res.title}</div>
                        <div className="text-[10px] text-slate-400 group-hover:text-indigo-100 truncate">{res.subtitle}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0" />
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
            /* Primary Hub Cards with Sub-Accordion Support */
            <div className="space-y-1.5">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {language === 'hi' ? 'मुख्य प्रशासनिक मॉड्यूल' : 'Administrative Modules'}
              </div>

              {hubs.map((hub) => {
                const Icon = hub.icon;
                const isHubActive = currentHubId === hub.id;
                const isExpanded = expandedHubs[hub.id] || false;
                const hasSubTabs = hub.subTabs.length > 0;

                return (
                  <div key={hub.id} className="space-y-1">
                    <div
                      className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer group relative touch-manipulation ${
                        isHubActive
                          ? 'bg-indigo-600/90 text-white shadow-xs font-semibold'
                          : 'bg-slate-800/40 hover:bg-slate-800 text-slate-300 border border-transparent hover:border-slate-700/60'
                      }`}
                      onClick={() => {
                        onSelectTab(hub.id);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isHubActive
                            ? 'bg-indigo-700 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-indigo-300'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={`text-xs font-bold truncate ${isHubActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                            {language === 'hi' ? hub.nameHi : hub.nameEn}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        {hub.badge && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isHubActive ? 'bg-white text-indigo-700' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {hub.badge}
                          </span>
                        )}

                        {hasSubTabs ? (
                          <button
                            type="button"
                            onClick={(e) => toggleHubExpansion(hub.id, e)}
                            className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                            aria-label="Toggle sub-modules"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : (
                          <ChevronRight className={`w-3.5 h-3.5 ${isHubActive ? 'text-white' : 'text-slate-500'}`} />
                        )}
                      </div>
                    </div>

                    {/* SubTabs Accordion Dropdown */}
                    {hasSubTabs && isExpanded && (
                      <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-700/60 ml-4">
                        {hub.subTabs.map((sub) => {
                          const SubIcon = sub.icon;
                          const isSubActive = activeTab === sub.id;

                          return (
                            <button
                              key={sub.id}
                              onClick={() => {
                                onSelectTab(sub.id);
                                onClose();
                              }}
                              className={`w-full min-h-[34px] flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-all cursor-pointer ${
                                isSubActive
                                  ? 'bg-indigo-500 text-white font-bold shadow-2xs'
                                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <SubIcon className="w-3 h-3 shrink-0 opacity-80" />
                                <span className="truncate">
                                  {language === 'hi' ? sub.labelHi : sub.labelEn}
                                </span>
                              </div>
                              {isSubActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                              )}
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
        <div className="p-3.5 bg-[#0B1120] border-t border-slate-800/80 space-y-2 shrink-0">
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ERP Online</span>
            </span>
            <span className="font-mono text-slate-500">v2.6 Enterprise</span>
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
            className="w-full min-h-[40px] flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 active:bg-rose-500/30 text-rose-300 hover:text-rose-200 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
            id="btn-admin-logout"
          >
            <LogOut className="w-4 h-4" />
            <span>{language === 'hi' ? 'लॉगआउट करें' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
