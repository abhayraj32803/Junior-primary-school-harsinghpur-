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
  ArrowLeft,
  Sun,
  Moon,
  Eye,
  Type,
  Utensils,
  ExternalLink
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
  const [fontSizeScale, setFontSizeScale] = useState<'normal' | 'large' | 'larger'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smooth scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle font size scaling on root HTML element
  const handleFontSizeChange = (scale: 'normal' | 'large' | 'larger') => {
    setFontSizeScale(scale);
    const root = document.documentElement;
    if (scale === 'normal') {
      root.style.fontSize = '16px';
    } else if (scale === 'large') {
      root.style.fontSize = '17.5px';
    } else if (scale === 'larger') {
      root.style.fontSize = '19px';
    }
  };

  // Handle High Contrast mode toggle
  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (!highContrast) {
      document.documentElement.classList.add('contrast-more');
    } else {
      document.documentElement.classList.remove('contrast-more');
    }
  };

  // Lock body scroll and listen for ESC key when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalStyle;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  const selectedPage = activePage || currentPage || 'home';
  const handleOpenPortal = onOpenPortal || (() => onNavigate('portal'));

  // 9 Requested Header Menu Items
  const primaryMenuItems = [
    { id: 'home', labelEn: 'Home', labelHi: 'Home', icon: Building2 },
    { id: 'about', labelEn: 'About Us', labelHi: 'About Us', icon: School },
    { id: 'classes', labelEn: 'Academics', labelHi: 'Academics', icon: BookOpen },
    { id: 'faculty', labelEn: 'Teachers', labelHi: 'Teachers', icon: Users },
    { id: 'facilities', labelEn: 'Facilities', labelHi: 'Facilities', icon: Droplets },
    { id: 'activities', labelEn: 'Activities', labelHi: 'Activities', icon: Sparkles },
    { id: 'notices', labelEn: 'Notices', labelHi: 'Notices', icon: Bell },
    { id: 'gallery', labelEn: 'Gallery', labelHi: 'Gallery', icon: ImageIcon },
    { id: 'contact', labelEn: 'Contact', labelHi: 'Contact', icon: Phone }
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
        isScrolled ? 'shadow-md' : 'shadow-xs'
      }`}>
        
        {/* 1. TOP INSTITUTIONAL UTILITY & ACCESSIBILITY BAR (IIT DELHI PATTERN) */}
        <div className="bg-gov-navy-950 text-slate-200 text-[11px] font-medium border-b border-gov-navy-900">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-8 sm:min-h-9 py-1 gap-2">
              
              {/* Left: Skip to Main Content & Quick Audience Portals */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:px-2 focus:py-1 focus:bg-gov-amber-500 focus:text-gov-navy-950 focus:rounded font-bold"
                >
                  {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
                </a>

                {/* Audience Quick Links (Visible on desktop/large screens to avoid crowding on tablets) */}
                <div className="hidden xl:flex items-center gap-3 text-slate-300 font-semibold shrink-0">
                  <button 
                    onClick={() => handleNavClick('login-student')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-gov-amber-400" />
                    <span>{language === 'hi' ? 'विद्यार्थी (Student Login)' : 'Students Login'}</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('faculty')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'शिक्षक एवं स्टाफ' : 'Faculty & Staff'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('login-teacher')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'hi' ? 'शिक्षक लॉगिन' : 'Teacher Login'}</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('schemes')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer"
                  >
                    {language === 'hi' ? 'अभिभावक व योजनाएं' : 'Parents & Schemes'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('sources')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>RTE / UDISE</span>
                    <span className="px-1 py-0.2 bg-gov-navy-800 text-gov-amber-400 rounded text-[10px] font-mono">09290205902</span>
                  </button>
                </div>

                {/* Mobile / Tablet Short Audience Badge */}
                <div className="flex xl:hidden items-center gap-1 text-[10px] text-slate-300 font-mono">
                  <span className="text-gov-amber-400 font-bold">UDISE:</span>
                  <span>{settings.schoolCode}</span>
                </div>
              </div>

              {/* Right: Accessibility Controls (Font Resize A-, A, A+, High Contrast, Language, ERP Login) */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
                
                {/* Font Sizer (A- / A / A+) - visible on tablets & desktop */}
                <div className="hidden md:flex items-center gap-1 bg-gov-navy-900 px-1.5 py-0.5 rounded border border-gov-navy-800 text-[10px]">
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`px-1 rounded font-bold cursor-pointer transition-colors ${
                      fontSizeScale === 'normal' ? 'bg-gov-amber-500 text-gov-navy-950' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Default Font Size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`px-1 rounded font-bold cursor-pointer transition-colors ${
                      fontSizeScale === 'large' ? 'bg-gov-amber-500 text-gov-navy-950' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Large Font Size"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('larger')}
                    className={`px-1 rounded font-bold cursor-pointer transition-colors ${
                      fontSizeScale === 'larger' ? 'bg-gov-amber-500 text-gov-navy-950' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Extra Large Font Size"
                  >
                    A++
                  </button>
                </div>

                {/* High Contrast / Screen Mode Toggle - visible on desktop */}
                <button
                  onClick={toggleHighContrast}
                  className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-gov-navy-900 hover:bg-gov-navy-800 text-slate-300 hover:text-white rounded border border-gov-navy-800 text-[10px] cursor-pointer transition-colors"
                  title="High Contrast Toggle"
                >
                  <Eye className="w-3 h-3 text-gov-amber-400" />
                  <span>{highContrast ? 'Standard' : 'Contrast'}</span>
                </button>

                {/* Language Switcher */}
                <div className="flex items-center bg-gov-navy-900 rounded p-0.5 border border-gov-navy-800">
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      language === 'hi' 
                        ? 'bg-gov-amber-500 text-gov-navy-950 font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="हिंदी भाषा"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                      language === 'en' 
                        ? 'bg-gov-amber-500 text-gov-navy-950 font-black' 
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="English"
                  >
                    EN
                  </button>
                </div>

                {/* ERP / Portal Login Shortcut in Top Bar */}
                <button
                  onClick={() => handleNavClick('portal')}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded bg-gov-amber-500 hover:bg-gov-amber-400 text-gov-navy-950 font-black text-[10px] sm:text-[11px] cursor-pointer transition-all shadow-xs shrink-0"
                  id="btn-top-portal-login"
                >
                  <LogIn className="w-3 h-3" />
                  <span>{role ? (language === 'hi' ? 'डैशबोर्ड' : 'Dashboard') : (language === 'hi' ? 'लॉगिन / ERP' : 'Portal Login')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* National Tricolor Government Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-xs" />

        {/* 2. MAIN INSTITUTIONAL MASTHEAD / BRANDING (IIT DELHI FORMAT - FULLY RESPONSIVE AUTO-HEIGHT) */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-14 sm:min-h-20 py-2 sm:py-3.5 gap-1.5 sm:gap-4 h-auto">
            
            {/* Left: School Crest + Official Bilingual Titles */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
              
              {/* Back button if navigating sub-pages */}
              {selectedPage !== 'home' && (
                <button
                  onClick={() => {
                    if (onGoBack) onGoBack();
                    else handleNavClick('home');
                  }}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-navy-950 text-slate-800 text-[10px] sm:text-xs font-black border border-slate-300 hover:border-gov-amber-400 transition-all shadow-2xs cursor-pointer group shrink-0"
                  title={language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Back to previous page'}
                  id="btn-public-back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gov-amber-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden xs:inline">{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              )}

              <button 
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 sm:gap-3.5 text-left focus:outline-hidden group min-w-0 flex-1 cursor-pointer"
              >
                {/* Government School Emblem with Glowing Golden Ring */}
                <div className="w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0 ring-1 sm:ring-2 ring-amber-400/40">
                  <div className="w-full h-full bg-gov-navy-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-gov-amber-400">
                    <School className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gov-amber-400" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                  <div className="text-[8.5px] sm:text-[10px] md:text-[11px] font-black tracking-wide text-amber-800 uppercase flex items-center gap-1 truncate leading-tight">
                    <span>{language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Basic Education Dept, UP'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-emerald-700 font-black">RTE 2009 Free</span>
                  </div>
                  <div className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-gov-navy-950 leading-snug sm:leading-tight group-hover:text-amber-700 transition-colors line-clamp-1 sm:line-clamp-none my-0.5">
                    {language === 'hi' ? (settings.schoolNameHi || settings.schoolName) : settings.schoolName}
                  </div>
                  <div className="text-[9px] sm:text-xs text-slate-600 font-semibold flex items-center gap-1 sm:gap-2 leading-tight flex-wrap">
                    <span className="truncate">{language === 'hi' ? 'विकास खंड: शमसाबाद' : 'Block: Shamsabad'}</span>
                    <span>•</span>
                    <span className="truncate">{language === 'hi' ? 'जनपद: फर्रुखाबाद' : 'District: Farrukhabad'}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline font-mono font-bold text-slate-900 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">UDISE: {settings.schoolCode}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Right: Quick Search + Free Admission CTA + Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Universal Search (IIT Delhi Search Icon / Ctrl+K) */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer text-xs font-bold shrink-0"
                title="Search website (Ctrl+K)"
                id="btn-nav-search"
              >
                <Search className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-xs hidden lg:inline">{language === 'hi' ? 'खोजें...' : 'Search...'}</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-white border border-slate-300 rounded text-[9px] text-slate-500 font-mono">⌘K</kbd>
              </button>

              {/* Free Admission CTA Button - Compact on small mobile, Full on sm+ */}
              <button
                onClick={() => handleNavClick('admission')}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/40 hover:-translate-y-0.5 shrink-0 whitespace-nowrap"
                title="RTE 2009 Free Admissions"
                id="btn-nav-admissions"
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200 shrink-0" />
                <span>{language === 'hi' ? 'नि:शुल्क प्रवेश' : 'Admissions'}</span>
              </button>

              {/* Mobile / Tablet Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
                id="btn-nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* 3. PRIMARY NAVIGATION BAR (OFFICIAL 10 MENU ITEMS) */}
        <div className="hidden xl:block bg-gov-navy-900 border-t border-gov-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between">
              
              {/* 10 Requested Direct Menu Items */}
              <div className="flex items-center gap-1 py-1.5">
                {primaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedPage === item.id || (item.id === 'classes' && selectedPage === 'academics');

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`px-3.5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 rounded-xl ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-gov-navy-950 font-black shadow-md shadow-amber-500/20'
                          : 'text-slate-200 hover:bg-gov-navy-800/80 hover:text-amber-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-gov-navy-950' : 'text-amber-400'}`} />
                      <span>{language === 'hi' ? item.labelHi : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Side Quick Portals & Schemes */}
              <div className="flex items-center gap-2 py-1 text-xs">
                <button
                  onClick={() => handleNavClick('schemes')}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-gov-navy-800 to-gov-navy-850 hover:from-gov-navy-700 hover:to-gov-navy-800 text-amber-300 border border-gov-navy-700 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                >
                  {language === 'hi' ? 'शासकीय योजनाएं' : 'Govt Schemes'}
                </button>
                <button
                  onClick={() => handleNavClick('sources')}
                  className="text-slate-300 hover:text-amber-400 text-[11px] font-semibold flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gov-navy-800 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>{language === 'hi' ? 'शिक्षा पोर्टल' : 'UP Portals'}</span>
                </button>
              </div>

            </nav>
          </div>
        </div>

        {/* 4. MOBILE NAVIGATION DRAWER & BACKDROP OVERLAY */}
        {/* Backdrop Overlay */}
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 bg-slate-950/75 backdrop-blur-xs z-50 xl:hidden transition-opacity duration-300 ease-out ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Off-canvas Slide-in Drawer */}
        <div
          className={`
            fixed inset-y-0 right-0 z-50 w-full sm:w-96 max-w-[88vw] bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between xl:hidden
            transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Drawer Header */}
          <div className="p-4 bg-gov-navy-950 text-white flex items-center justify-between border-b border-gov-navy-800 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gov-amber-500 text-gov-navy-950 flex items-center justify-center font-black text-sm shrink-0">
                <School className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black text-white truncate">{settings.schoolName}</div>
                <div className="text-[10px] text-gov-amber-400 font-bold tracking-wide truncate">
                  {language === 'hi' ? 'नेविगेशन मेनू' : 'Main Navigation'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="min-w-[42px] min-h-[42px] p-2.5 rounded-xl bg-gov-navy-900 hover:bg-gov-navy-800 active:bg-gov-navy-700 active:scale-95 text-slate-300 hover:text-white transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="px-4 py-3 space-y-3.5 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
            {/* Quick Back Button in Mobile Drawer if on subpage */}
            {selectedPage !== 'home' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGoBack) onGoBack();
                  else handleNavClick('home');
                }}
                className="w-full min-h-[44px] p-2.5 rounded-xl bg-gov-amber-50 hover:bg-gov-amber-100 active:bg-gov-amber-200 text-gov-navy-950 text-xs font-black flex items-center justify-center gap-2 border border-gov-amber-200 transition-all shadow-xs cursor-pointer touch-manipulation select-none active:scale-[0.98]"
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
              className="min-h-[44px] p-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 active:bg-slate-200 border border-slate-200 text-slate-600 text-xs flex items-center justify-between cursor-pointer touch-manipulation select-none active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <span>{language === 'hi' ? 'सर्च करें (खोजें)...' : 'Search website...'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 bg-white rounded border border-slate-200 font-bold text-slate-700">Search</span>
            </div>

            {/* Active Dashboard Card if logged in */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('portal');
              }}
              className="w-full min-h-[56px] p-3.5 rounded-2xl bg-gov-amber-500 hover:bg-gov-amber-600 active:bg-gov-amber-600 text-gov-navy-950 text-left flex items-center justify-between shadow-md transition-all group cursor-pointer touch-manipulation select-none active:scale-[0.98]"
              id="btn-drawer-dashboard"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gov-navy-950 text-gov-amber-400 flex items-center justify-center font-black shadow-sm shrink-0">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-black text-gov-navy-950 leading-tight truncate">
                    {role 
                      ? (language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Go to Dashboard') 
                      : (language === 'hi' ? 'पोर्टल लॉगिन (ERP)' : 'School Portal / ERP Login')}
                  </div>
                  <div className="text-[11px] text-gov-navy-900 font-semibold mt-0.5 truncate">
                    {role ? 'Active Session' : 'Student, Teacher & Headmaster Portals'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gov-navy-950 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            {/* Quick 1-Click Role Logins in Drawer when not logged in */}
            {!role && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-student');
                  }}
                  className="min-h-[58px] p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold border border-slate-200 cursor-pointer touch-manipulation select-none active:scale-[0.98] transition-transform"
                >
                  <GraduationCap className="w-4 h-4 text-gov-amber-600" />
                  <span>{language === 'hi' ? 'छात्र लॉगिन' : 'Student'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-teacher');
                  }}
                  className="min-h-[58px] p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold border border-slate-200 cursor-pointer touch-manipulation select-none active:scale-[0.98] transition-transform"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{language === 'hi' ? 'शिक्षक लॉगिन' : 'Teacher'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-admin');
                  }}
                  className="min-h-[58px] p-2.5 rounded-xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold border border-slate-200 cursor-pointer touch-manipulation select-none active:scale-[0.98] transition-transform"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'hi' ? 'प्रधानाध्यापक' : 'Admin'}</span>
                </button>
              </div>
            )}

            {/* 10 Direct Menu Items in Mobile Drawer */}
            <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <div className="px-2 py-1 text-[11px] font-black uppercase tracking-wider text-gov-amber-800">
                {language === 'hi' ? 'मुख्य पृष्ठ अनुभाग' : 'Main Menu Sections'}
              </div>
              <div className="grid grid-cols-1 gap-1">
                {primaryMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = selectedPage === item.id || (item.id === 'classes' && selectedPage === 'academics');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick(item.id);
                      }}
                      className={`w-full min-h-[44px] text-left p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all touch-manipulation select-none active:scale-[0.98] ${
                        isItemActive
                          ? 'bg-gov-navy-900 text-gov-amber-400 font-extrabold shadow-xs'
                          : 'text-slate-700 hover:bg-white bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isItemActive ? 'text-gov-amber-400' : 'text-gov-amber-700'}`} />
                        <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Additional Official Portals & Schemes */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick('schemes');
                }}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center hover:bg-slate-50 transition-colors"
              >
                {language === 'hi' ? 'शासकीय योजनाएं' : 'Govt Schemes'}
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleNavClick('sources');
                }}
                className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 text-center hover:bg-slate-50 transition-colors"
              >
                {language === 'hi' ? 'शिक्षा पोर्टल (UDISE)' : 'UP Portals'}
              </button>
            </div>
          </div>

          {/* Mobile Language Switcher & Accessibility Footer */}
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 shrink-0 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              {language === 'hi' ? 'भाषा (Language):' : 'Language:'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('hi')}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all touch-manipulation cursor-pointer active:scale-95 ${
                  language === 'hi' ? 'bg-gov-amber-500 text-gov-navy-950 font-extrabold shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs rounded-xl font-bold transition-all touch-manipulation cursor-pointer active:scale-95 ${
                  language === 'en' ? 'bg-gov-amber-500 text-gov-navy-950 font-extrabold shadow-xs' : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
