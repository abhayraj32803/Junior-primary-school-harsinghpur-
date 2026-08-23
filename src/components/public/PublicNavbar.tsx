import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { 
  School, 
  LogIn, 
  LogOut,
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Bell, 
  Phone,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Building2,
  Gift,
  Image as ImageIcon,
  Languages,
  FileText,
  BarChart3,
  HelpCircle,
  Globe,
  Droplets,
  Calendar,
  Search,
  CheckCircle2,
  Clock,
  PhoneCall,
  Flame,
  Award,
  ArrowLeft
} from 'lucide-react';

interface PublicNavbarProps {
  currentPage?: string;
  activePage?: string;
  onNavigate: (page: string) => void;
  onOpenPortal?: () => void;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({ 
  currentPage, 
  activePage, 
  onNavigate, 
  onOpenPortal,
  onGoBack,
  canGoBack = false
}) => {
  const { role, isAuthenticated, userProfile, logout } = useAuth();
  const { settings, language, setLanguage, notices } = useSchool();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll detection without layout shifting (no height changes, no flickering)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const selectedPage = activePage || currentPage || 'home';
  const handleOpenPortal = onOpenPortal || (() => onNavigate('portal'));

  // Live Current Date
  const currentDateFormatted = new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  // 5 Prestige Institutional Pillars (Clean, Organized, Professional)
  const navPillars = [
    {
      id: 'about-pillar',
      labelEn: 'About Institute',
      labelHi: 'संस्थान परिचय',
      badge: 'UDISE Verified',
      items: [
        { 
          id: 'about', 
          labelEn: 'School Profile & UDISE Record', 
          labelHi: 'विद्यालय परिचय व UDISE अभिलेख', 
          icon: Building2, 
          descEn: 'Official government identity, UDISE code & establishment', 
          descHi: 'शासकीय पहचान, UDISE कोड व स्थापना विवरण' 
        },
        { 
          id: 'faculty', 
          labelEn: 'Faculty & Staff Directory', 
          labelHi: 'शिक्षक एवं कार्मिक पंजिका', 
          icon: Users, 
          descEn: 'Certified teachers, qualifications & headmaster details', 
          descHi: 'सत्यापित शिक्षक, योग्यता व पदस्थापन विवरण' 
        },
        { 
          id: 'statistics', 
          labelEn: 'Institutional Statistics & PTR', 
          labelHi: 'सांख्यिकी व छात्र-शिक्षक अनुपात', 
          icon: BarChart3, 
          descEn: 'Enrollment breakdown, gender ratio & PTR metrics', 
          descHi: 'कक्षावार नामांकन, लिंगानुपात व PTR आंकड़े' 
        }
      ]
    },
    {
      id: 'academics-pillar',
      labelEn: 'Academics & Admission',
      labelHi: 'शिक्षा व प्रवेश',
      badge: 'RTE 100% Free',
      items: [
        { 
          id: 'classes', 
          labelEn: 'Classes 1–8 Curriculum & Subjects', 
          labelHi: 'कक्षा 1 से 8 पाठ्यक्रम व विषय', 
          icon: BookOpen, 
          descEn: 'NCERT/SCERT syllabus, learning outcomes & textbooks', 
          descHi: 'प्राथमिक व उच्च प्राथमिक विषय एवं अधिगम प्रतिफल' 
        },
        { 
          id: 'admission', 
          labelEn: 'Free Admission Process (RTE 2009)', 
          labelHi: 'नि:शुल्क प्रवेश प्रक्रिया (RTE 2009)', 
          icon: GraduationCap, 
          descEn: 'Zero fee policy, required documents & online request', 
          descHi: '100% नि:शुल्क प्रवेश, आवश्यक प्रपत्र व ऑनलाइन आवेदन' 
        },
        { 
          id: 'documents', 
          labelEn: 'Academic Calendar & Public Forms', 
          labelHi: 'शैक्षणिक कैलेंडर व प्रपत्र', 
          icon: FileText, 
          descEn: 'Govt. holiday list, admission forms & notifications', 
          descHi: 'शासकीय अवकाश सूची, प्रवेश फॉर्म व विभागीय प्रपत्र' 
        },
        { 
          id: 'faq', 
          labelEn: 'FAQs & Parental Guidelines', 
          labelHi: 'सामान्य प्रश्नोत्तरी (FAQ)', 
          icon: HelpCircle, 
          descEn: 'Clear answers to common questions about schooling', 
          descHi: 'अभिभावकों एवं विद्यार्थियों के लिए सामान्य मार्गदर्शन' 
        }
      ]
    },
    {
      id: 'welfare-pillar',
      labelEn: 'Welfare & Campus',
      labelHi: 'योजनाएं व परिसर',
      badge: 'PM-POSHAN & DBT',
      items: [
        { 
          id: 'schemes', 
          labelEn: 'Government Schemes & DBT ₹1200', 
          labelHi: 'सरकारी योजनाएं व DBT ₹1200', 
          icon: Gift, 
          descEn: 'PM POSHAN (MDM), uniform & bag DBT, free textbooks', 
          descHi: 'मध्याह्न भोजन, यूनिफॉर्म/बैग DBT, नि:शुल्क पाठ्यपुस्तक' 
        },
        { 
          id: 'facilities', 
          labelEn: 'Campus Infrastructure & Water', 
          labelHi: 'भौतिक सुविधाएं व नल से जल', 
          icon: Droplets, 
          descEn: 'Tap water, smart classes, solar power & sports ground', 
          descHi: 'जल जीवन मिशन, स्मार्ट क्लास, किचेन शेड व खेल मैदान' 
        }
      ]
    },
    {
      id: 'media-pillar',
      labelEn: 'Media & Notices',
      labelHi: 'दीर्घा व सूचनाएं',
      badge: `${notices.filter(n => n.status === 'active').length} Live Circulars`,
      items: [
        { 
          id: 'notices', 
          labelEn: 'Official Notice Board', 
          labelHi: 'शासकीय सूचना पट्ट', 
          icon: Bell, 
          descEn: 'Latest departmental circulars & school announcements', 
          descHi: 'नवीनतम शासकीय शासनादेश व विद्यालयी सूचनाएं' 
        },
        { 
          id: 'gallery', 
          labelEn: 'Photo & Video Archive', 
          labelHi: 'चित्र एवं वीडियो दीर्घा', 
          icon: ImageIcon, 
          descEn: 'School events, FLN learning, cultural & sports archive', 
          descHi: 'वार्षिक उत्सव, खेलकूद, निपुण भारत गतिविधियां' 
        }
      ]
    },
    {
      id: 'portals-pillar',
      labelEn: 'Portals & Helplines',
      labelHi: 'पोर्टल व संपर्क',
      badge: 'Govt. Portals',
      items: [
        { 
          id: 'sources', 
          labelEn: 'Official UP Education Portals', 
          labelHi: 'आधिकारिक शासकीय शिक्षा पोर्टल', 
          icon: Globe, 
          descEn: 'Direct links to UDISE+, Prerna & Manav Sampada', 
          descHi: 'UDISE+, बेसिक शिक्षा, मिशन प्रेरणा, दीक्षा पोर्टल' 
        },
        { 
          id: 'contact', 
          labelEn: 'Contact Directory & Location Map', 
          labelHi: 'संपर्क निर्देशिका व मैप', 
          icon: Phone, 
          descEn: 'Institutional address, office hours & helpline numbers', 
          descHi: 'विद्यालय पता, कार्यालय समय व आपातकालीन हेल्पलाइन' 
        }
      ]
    }
  ];

  const handleNavClick = (pageId: string) => {
    onNavigate(pageId);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleMouseEnter = (pillarId: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(pillarId);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Keyboard shortcut listener for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(p) => {
          handleNavClick(p);
          setIsSearchOpen(false);
        }}
      />

      <header className={`sticky top-0 z-40 bg-white border-b border-slate-200 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : 'shadow-sm'
      }`}>
        
        {/* National Tricolor Government Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* Top Official Institutional Strip - Top University Style (Stable, Zero-Jitter) */}
        <div className="bg-gov-navy-950 text-slate-200 text-xs px-3 sm:px-6 py-1.5 border-b border-gov-navy-800">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            
            {/* Left: Department, Date & UDISE Badge */}
            <div className="flex items-center gap-2 sm:gap-4 text-[11px] truncate">
              <span className="flex items-center gap-1.5 font-extrabold text-gov-amber-400 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा विभाग' : 'Department of Basic Education, Govt. of UP'}</span>
              </span>
              <span className="hidden md:inline text-gov-navy-400">•</span>
              <span className="hidden md:inline text-slate-400 font-medium">
                {currentDateFormatted}
              </span>
              <span className="hidden sm:inline text-gov-navy-400">•</span>
              <span className="hidden sm:inline font-mono text-slate-300">
                UDISE: <strong className="text-gov-amber-300 bg-gov-navy-900 px-1.5 py-0.5 rounded border border-gov-navy-800">{settings.schoolCode}</strong>
              </span>
            </div>

            {/* Right: Helplines, Search & Bilingual Switcher */}
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] shrink-0">
              {/* Quick Search Shortcut Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-gov-navy-900 hover:bg-gov-navy-800 text-slate-300 hover:text-white border border-gov-navy-700/80 transition-colors cursor-pointer"
                title="Search anything (Ctrl+K)"
              >
                <Search className="w-3 h-3 text-gov-amber-400" />
                <span className="text-[10px] font-bold">{language === 'hi' ? 'खोजें' : 'Search'}</span>
                <kbd className="hidden lg:inline-block px-1 py-0.2 bg-gov-navy-950 border border-gov-navy-700 rounded text-[9px] text-slate-400 font-mono">⌘K</kbd>
              </button>

              {/* Language Switcher */}
              <div className="flex items-center bg-gov-navy-900 border border-gov-navy-700/80 rounded-lg p-0.5 shadow-inner">
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'hi' 
                      ? 'bg-gov-amber-500 text-gov-navy-950 shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="हिंदी में देखें"
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                    language === 'en' 
                      ? 'bg-gov-amber-500 text-gov-navy-950 shadow-xs' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="View in English"
                >
                  English
                </button>
              </div>

              {/* Govt Verified Pill */}
              <div className="hidden xl:flex items-center gap-1 text-emerald-300 font-bold bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-700/60 text-[10px]">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>{language === 'hi' ? 'शासकीय मान्यता प्राप्त' : 'Govt. Accredited'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main University Style Branding & Masthead */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo & Prestigious School Masthead with Back button */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              {selectedPage !== 'home' && (
                <button
                  onClick={() => {
                    if (onGoBack) onGoBack();
                    else handleNavClick('home');
                  }}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-navy-950 text-slate-800 text-xs font-black border border-slate-300 hover:border-gov-amber-400 transition-all shadow-2xs cursor-pointer group shrink-0"
                  title={language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Back to previous page'}
                  id="btn-public-back"
                >
                  <ArrowLeft className="w-4 h-4 text-gov-amber-700 group-hover:-translate-x-1 transition-transform" />
                  <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              )}

              <button 
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-3.5 text-left focus:outline-hidden group shrink-0 cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-gradient-to-br from-gov-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <div className="w-full h-full bg-gov-navy-950 rounded-[14px] flex items-center justify-center text-gov-amber-400">
                    <School className="w-6 h-6 sm:w-7 sm:h-7 text-gov-amber-400" />
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black tracking-widest text-gov-amber-700 uppercase flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'परिषदीय कंपोजिट विद्यालय' : 'Government Composite JHS'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-emerald-700 font-bold">RTE 100% Free</span>
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-black text-gov-navy-950 tracking-tight leading-tight group-hover:text-gov-amber-600 transition-colors">
                    {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-1.5">
                    <span>{language === 'hi' ? 'विकास खंड: शमसाबाद' : 'Block: Shamsabad'}</span>
                    <span>•</span>
                    <span>{language === 'hi' ? 'जनपद: फर्रुखाबाद (उ.प्र.)' : 'District: Farrukhabad (UP)'}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Desktop Clean Grouped Navigation Dropdowns (5 Institutional Pillars) */}
            <nav className="hidden xl:flex items-center gap-1">
              
              {/* Home Tab */}
              <button
                onClick={() => handleNavClick('home')}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedPage === 'home'
                    ? 'bg-gov-amber-500/15 text-gov-navy-950 border border-gov-amber-500/30 shadow-xs'
                    : 'text-slate-700 hover:text-gov-navy-900 hover:bg-slate-100'
                }`}
              >
                {language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}
              </button>

              {/* 5 Grouped Mega-Dropdowns */}
              {navPillars.map((pillar) => {
                const isGroupActive = pillar.items.some(item => item.id === selectedPage);
                const isOpen = activeDropdown === pillar.id;

                return (
                  <div 
                    key={pillar.id} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(pillar.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      onClick={() => setActiveDropdown(isOpen ? null : pillar.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isGroupActive
                          ? 'bg-gov-navy-900 text-gov-amber-400 border border-gov-navy-950 font-extrabold shadow-xs'
                          : isOpen 
                            ? 'bg-slate-100 text-gov-navy-900' 
                            : 'text-slate-700 hover:text-gov-navy-900 hover:bg-slate-100'
                      }`}
                    >
                      <span>{language === 'hi' ? pillar.labelHi : pillar.labelEn}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gov-amber-500' : 'text-slate-400'}`} />
                    </button>

                    {/* Mega Dropdown Panel Window */}
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1.5 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                        {/* Header Pillar Tag */}
                        <div className="px-3 py-1.5 bg-slate-50 rounded-xl flex items-center justify-between text-[11px] font-bold text-slate-600 border border-slate-100 mb-1">
                          <span className="text-gov-amber-700 uppercase font-black tracking-wider">
                            {language === 'hi' ? pillar.labelHi : pillar.labelEn}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gov-amber-100 text-gov-amber-900 font-black">
                            {pillar.badge}
                          </span>
                        </div>

                        {pillar.items.map((item) => {
                          const Icon = item.icon;
                          const isItemActive = selectedPage === item.id;
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleNavClick(item.id)}
                              className={`w-full text-left p-2.5 rounded-2xl transition-all flex items-start gap-3 cursor-pointer group/item ${
                                isItemActive
                                  ? 'bg-gov-amber-50 border border-gov-amber-200 text-gov-navy-950'
                                  : 'hover:bg-slate-50 text-slate-700 hover:text-gov-navy-900 border border-transparent'
                              }`}
                            >
                              <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                                isItemActive 
                                  ? 'bg-gov-navy-900 text-gov-amber-400 font-bold shadow-xs' 
                                  : 'bg-slate-100 text-gov-navy-700 group-hover/item:bg-gov-amber-100 group-hover/item:text-gov-amber-800'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold leading-tight group-hover/item:text-gov-navy-900 transition-colors flex items-center gap-1.5">
                                  <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                                </div>
                                <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {language === 'hi' ? item.descHi : item.descEn}
                                </div>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover/item:text-gov-amber-500 group-hover/item:translate-x-0.5 transition-all mt-1 shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            {/* Right Side Action Center: Admissions + ERP Login */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Free Admission CTA Button */}
              <button
                onClick={() => handleNavClick('admission')}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer shadow-2xs"
                title="RTE 2009 Free Admissions"
                id="btn-nav-admissions"
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'hi' ? 'नि:शुल्क प्रवेश' : 'Admissions'}</span>
              </button>

              {/* Prominent Portal Login / Dashboard Button */}
              <button
                onClick={() => handleNavClick(role ? 'portal' : 'login')}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-gov-amber-500 to-amber-500 hover:from-gov-amber-400 hover:to-amber-400 text-gov-navy-950 shadow-md shadow-gov-amber-500/20 border border-gov-amber-400 transition-all cursor-pointer transform hover:-translate-y-0.5"
                id="btn-nav-portal-login"
                title={role ? 'Open Dashboard' : 'School Portal Login'}
              >
                {role ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 text-gov-navy-950" />
                    <span>{language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-gov-navy-950" />
                    <span>{language === 'hi' ? 'पोर्टल लॉगिन' : 'Portal Login'}</span>
                  </>
                )}
              </button>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
                id="btn-nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-8 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto">
            
            {/* Quick Back Button in Mobile Drawer if on subpage */}
            {selectedPage !== 'home' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGoBack) onGoBack();
                  else handleNavClick('home');
                }}
                className="w-full p-2.5 rounded-xl bg-gov-amber-50 hover:bg-gov-amber-100 text-gov-navy-950 text-xs font-black flex items-center justify-center gap-2 border border-gov-amber-200 transition-all shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-gov-amber-700" />
                <span>{language === 'hi' ? '← पिछले पृष्ठ पर वापस जाएं' : '← Back to Previous Screen'}</span>
              </button>
            )}

            {/* Search Bar in Mobile Drawer */}
            <div 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>{language === 'hi' ? 'सर्च करें (खोजें)...' : 'Search website...'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white rounded border border-slate-200 font-bold">Search</span>
            </div>

            {/* Portal Login Card */}
            <button
              onClick={() => handleNavClick(role ? 'portal' : 'login')}
              className="w-full p-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 text-gov-navy-950 text-left flex items-center justify-between shadow-md transition-all group cursor-pointer"
              id="btn-drawer-school-login"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gov-navy-950 text-gov-amber-400 flex items-center justify-center font-black shadow-sm shrink-0">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-gov-navy-950 leading-tight">
                    {role ? (language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Go to Dashboard') : (language === 'hi' ? 'विद्यालय पोर्टल लॉगिन' : 'School Portal Login')}
                  </div>
                  <div className="text-[11px] text-gov-navy-800 font-semibold mt-0.5">
                    {language === 'hi' 
                      ? 'प्रधानाध्यापिका • शिक्षक • छात्र' 
                      : 'Headmaster • Teachers • Students'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gov-navy-950 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Quick Home button */}
            <button
              onClick={() => handleNavClick('home')}
              className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between ${
                selectedPage === 'home' ? 'bg-gov-navy-900 text-gov-amber-400 font-black' : 'bg-slate-100 text-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gov-amber-500" />
                <span>{language === 'hi' ? 'मुख्य पृष्ठ (Home)' : 'Home Page'}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Grouped Mobile Navigation Pillars */}
            {navPillars.map((pillar) => (
              <div key={pillar.id} className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between px-2 mb-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-gov-amber-700">
                    {language === 'hi' ? pillar.labelHi : pillar.labelEn}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold">
                    {pillar.badge}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {pillar.items.map((item) => {
                    const Icon = item.icon;
                    const isItemActive = selectedPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          isItemActive
                            ? 'bg-gov-navy-900 text-gov-amber-400 font-extrabold shadow-xs'
                            : 'text-slate-700 hover:bg-white bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-gov-amber-400' : 'text-gov-navy-800'}`} />
                          <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Mobile Footer Language Switcher */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {language === 'hi' ? 'भाषा चयन:' : 'Language:'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLanguage('hi')}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold ${
                    language === 'hi' ? 'bg-gov-amber-500 text-gov-navy-950 font-extrabold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold ${
                    language === 'en' ? 'bg-gov-amber-500 text-gov-navy-950 font-extrabold' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

          </div>
        )}
      </header>
    </>
  );
};
