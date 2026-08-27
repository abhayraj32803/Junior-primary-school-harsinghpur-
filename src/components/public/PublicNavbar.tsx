import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSchool } from '../../context/SchoolContext';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { QuickFinderModal } from './QuickFinderModal';
import { 
  School, 
  Home,
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
  const [isFinderOpen, setIsFinderOpen] = useState(false);
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

  // 9 Requested Primary Menu Items with section color identity
  const primaryMenuItems = [
    { id: 'home', labelEn: 'Home', labelHi: 'Home', icon: Home, color: 'indigo' },
    { id: 'about', labelEn: 'About Us', labelHi: 'About Us', icon: School, color: 'slate' },
    { id: 'classes', alias: 'academics', labelEn: 'Academics', labelHi: 'Academics', icon: BookOpen, color: 'blue' },
    { id: 'faculty', labelEn: 'Teachers', labelHi: 'Teachers', icon: Users, color: 'violet' },
    { id: 'facilities', labelEn: 'Facilities', labelHi: 'Facilities', icon: Building2, color: 'teal' },
    { id: 'activities', labelEn: 'Activities', labelHi: 'Activities', icon: Sparkles, color: 'orange' },
    { id: 'notices', labelEn: 'Notices', labelHi: 'Notices', icon: Bell, color: 'emerald' },
    { id: 'gallery', labelEn: 'Gallery', labelHi: 'Gallery', icon: ImageIcon, color: 'amber' },
    { id: 'contact', labelEn: 'Contact', labelHi: 'Contact', icon: Phone, color: 'rose' }
  ];

  // Mobile Drawer Navigation Configuration with section color mapping & subtle active indicator
  const drawerNavItems = [
    { 
      id: 'home', 
      labelEn: 'Home', 
      labelHi: 'मुख्य पृष्ठ', 
      icon: Home,
      iconColor: 'text-indigo-600',
      activeBg: 'bg-indigo-50/90',
      activeBorder: 'border-l-[3.5px] border-indigo-600',
      activeText: 'text-indigo-950 font-bold',
      activeArrow: 'text-indigo-600',
    },
    { 
      id: 'about', 
      labelEn: 'About Us', 
      labelHi: 'हमारे बारे में', 
      icon: School,
      iconColor: 'text-slate-700',
      activeBg: 'bg-slate-100',
      activeBorder: 'border-l-[3.5px] border-slate-700',
      activeText: 'text-slate-900 font-bold',
      activeArrow: 'text-slate-700',
    },
    { 
      id: 'classes', 
      alias: 'academics',
      labelEn: 'Academics', 
      labelHi: 'शिक्षा व पाठ्यक्रम', 
      icon: BookOpen,
      iconColor: 'text-blue-600',
      activeBg: 'bg-blue-50/90',
      activeBorder: 'border-l-[3.5px] border-blue-600',
      activeText: 'text-blue-950 font-bold',
      activeArrow: 'text-blue-600',
    },
    { 
      id: 'faculty', 
      labelEn: 'Teachers', 
      labelHi: 'शिक्षक वृंद', 
      icon: Users,
      iconColor: 'text-violet-600',
      activeBg: 'bg-violet-50/90',
      activeBorder: 'border-l-[3.5px] border-violet-600',
      activeText: 'text-violet-950 font-bold',
      activeArrow: 'text-violet-600',
    },
    { 
      id: 'facilities', 
      labelEn: 'Facilities', 
      labelHi: 'विद्यालय सुविधाएं', 
      icon: Building2,
      iconColor: 'text-teal-600',
      activeBg: 'bg-teal-50/90',
      activeBorder: 'border-l-[3.5px] border-teal-600',
      activeText: 'text-teal-950 font-bold',
      activeArrow: 'text-teal-600',
    },
    { 
      id: 'activities', 
      labelEn: 'Activities', 
      labelHi: 'गतिविधियां व खेल', 
      icon: Sparkles,
      iconColor: 'text-orange-600',
      activeBg: 'bg-orange-50/90',
      activeBorder: 'border-l-[3.5px] border-orange-500',
      activeText: 'text-orange-950 font-bold',
      activeArrow: 'text-orange-600',
    },
    { 
      id: 'notices', 
      labelEn: 'Notices', 
      labelHi: 'सूचनाएं व आदेश', 
      icon: Bell,
      iconColor: 'text-emerald-600',
      activeBg: 'bg-emerald-50/90',
      activeBorder: 'border-l-[3.5px] border-emerald-600',
      activeText: 'text-emerald-950 font-bold',
      activeArrow: 'text-emerald-600',
    },
    { 
      id: 'gallery', 
      labelEn: 'Gallery', 
      labelHi: 'चित्र वीथिका (फोटो)', 
      icon: ImageIcon,
      iconColor: 'text-amber-600',
      activeBg: 'bg-amber-50/90',
      activeBorder: 'border-l-[3.5px] border-amber-500',
      activeText: 'text-amber-950 font-bold',
      activeArrow: 'text-amber-600',
    },
    { 
      id: 'contact', 
      labelEn: 'Contact', 
      labelHi: 'संपर्क सूत्र', 
      icon: Phone,
      iconColor: 'text-rose-600',
      activeBg: 'bg-rose-50/90',
      activeBorder: 'border-l-[3.5px] border-rose-500',
      activeText: 'text-rose-950 font-bold',
      activeArrow: 'text-rose-600',
    },
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

      {/* Quick Finder / Easy Guide Modal for Students & Parents */}
      <QuickFinderModal
        isOpen={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        onNavigate={(p) => {
          handleNavClick(p);
          setIsFinderOpen(false);
        }}
        onOpenPortal={() => {
          handleOpenPortal();
          setIsFinderOpen(false);
        }}
      />

      <header className={`sticky top-0 z-40 bg-white border-b border-slate-200 transition-all duration-300 ${
        isScrolled ? 'shadow-md' : 'shadow-xs'
      }`}>
        
        {/* 1. TOP INSTITUTIONAL UTILITY & ACCESSIBILITY BAR (IIT DELHI PATTERN) */}
        <div className="bg-gov-navy-950 text-slate-200 text-[11px] font-medium border-b border-gov-navy-900 w-full overflow-hidden">
          <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between min-h-9 sm:min-h-10 py-1 gap-2">
              
              {/* Left: Skip to Main Content & Quick Audience Portals */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <a 
                  href="#main-content" 
                  className="sr-only focus:not-sr-only focus:px-3 focus:py-2 focus:bg-gov-amber-500 focus:text-gov-navy-950 focus:rounded-lg font-bold z-50 text-xs"
                >
                  {language === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to main content'}
                </a>

                {/* Audience Quick Links (Visible on desktop/large screens) */}
                <div className="hidden xl:flex items-center gap-3 text-slate-300 font-semibold shrink-0">
                  <button 
                    onClick={() => handleNavClick('login-student')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-gov-navy-900 touch-manipulation"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-gov-amber-400" />
                    <span>{language === 'hi' ? 'विद्यार्थी (Student Login)' : 'Students Login'}</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('faculty')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-gov-navy-900 touch-manipulation"
                  >
                    {language === 'hi' ? 'शिक्षक एवं स्टाफ' : 'Faculty & Staff'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('login-teacher')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-gov-navy-900 touch-manipulation"
                  >
                    <Users className="w-3.5 h-3.5 text-blue-400" />
                    <span>{language === 'hi' ? 'शिक्षक लॉगिन' : 'Teacher Login'}</span>
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('schemes')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer py-1 px-1.5 rounded-lg hover:bg-gov-navy-900 touch-manipulation"
                  >
                    {language === 'hi' ? 'अभिभावक व योजनाएं' : 'Parents & Schemes'}
                  </button>
                  <span className="text-slate-600">|</span>
                  <button 
                    onClick={() => handleNavClick('sources')}
                    className="hover:text-gov-amber-400 transition-colors cursor-pointer flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-gov-navy-900 touch-manipulation"
                  >
                    <span>RTE / UDISE</span>
                    <span className="px-1.5 py-0.5 bg-gov-navy-800 text-gov-amber-400 rounded text-[10px] font-mono">09290205902</span>
                  </button>
                </div>

                {/* Mobile / Tablet Short Audience Badge */}
                <div className="flex xl:hidden items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                  <span className="text-gov-amber-400 font-black">UDISE:</span>
                  <span className="bg-gov-navy-900 px-1.5 py-0.5 rounded border border-gov-navy-800 font-bold">{settings.schoolCode}</span>
                </div>
              </div>

              {/* Right: Accessibility Controls (Font Resize A-, A, A+, High Contrast, Language, ERP Login) */}
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs shrink-0">
                
                {/* Font Sizer (A- / A / A+) - visible on tablets & desktop */}
                <div className="hidden md:flex items-center gap-1 bg-gov-navy-900 p-0.5 rounded-lg border border-gov-navy-800 text-[11px]">
                  <button
                    onClick={() => handleFontSizeChange('normal')}
                    className={`min-w-[28px] min-h-[28px] px-1.5 rounded font-bold cursor-pointer transition-colors flex items-center justify-center touch-manipulation ${
                      fontSizeScale === 'normal' ? 'bg-gov-amber-500 text-gov-navy-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Default Font Size"
                  >
                    A
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('large')}
                    className={`min-w-[28px] min-h-[28px] px-1.5 rounded font-bold cursor-pointer transition-colors flex items-center justify-center touch-manipulation ${
                      fontSizeScale === 'large' ? 'bg-gov-amber-500 text-gov-navy-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Large Font Size"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => handleFontSizeChange('larger')}
                    className={`min-w-[28px] min-h-[28px] px-1.5 rounded font-bold cursor-pointer transition-colors flex items-center justify-center touch-manipulation ${
                      fontSizeScale === 'larger' ? 'bg-gov-amber-500 text-gov-navy-950 font-black' : 'text-slate-400 hover:text-white'
                    }`}
                    title="Extra Large Font Size"
                  >
                    A++
                  </button>
                </div>

                {/* High Contrast / Screen Mode Toggle - visible on desktop */}
                <button
                  onClick={toggleHighContrast}
                  className="hidden lg:flex items-center gap-1.5 min-h-[30px] px-2 bg-gov-navy-900 hover:bg-gov-navy-800 text-slate-300 hover:text-white rounded-lg border border-gov-navy-800 text-[11px] cursor-pointer transition-colors touch-manipulation"
                  title="High Contrast Toggle"
                >
                  <Eye className="w-3.5 h-3.5 text-gov-amber-400" />
                  <span>{highContrast ? 'Standard' : 'Contrast'}</span>
                </button>

                {/* Language Switcher with Touch-Friendly Targets */}
                <div className="flex items-center bg-gov-navy-900 rounded-lg p-0.5 border border-gov-navy-800">
                  <button
                    onClick={() => setLanguage('hi')}
                    className={`min-h-[32px] px-2.5 sm:px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                      language === 'hi' 
                        ? 'bg-gov-amber-500 text-gov-navy-950 font-black shadow-xs' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="हिंदी भाषा"
                  >
                    हिन्दी
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer touch-manipulation flex items-center justify-center ${
                      language === 'en' 
                        ? 'bg-gov-amber-500 text-gov-navy-950 font-black' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                    title="English"
                  >
                    EN
                  </button>
                </div>

                {/* ERP / Portal Login Shortcut in Top Bar */}
                <button
                  onClick={() => handleNavClick('portal')}
                  className="flex items-center gap-1.5 min-h-[32px] px-2.5 sm:px-3 py-1 rounded-lg bg-gov-amber-500 hover:bg-gov-amber-400 active:bg-gov-amber-300 text-gov-navy-950 font-black text-[11px] cursor-pointer transition-all shadow-xs shrink-0 touch-manipulation"
                  id="btn-top-portal-login"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{role ? (language === 'hi' ? 'डैशबोर्ड' : 'Dashboard') : (language === 'hi' ? 'लॉगिन' : 'Login')}</span>
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* National Tricolor Government Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600 shadow-xs" />

        {/* 2. MAIN INSTITUTIONAL MASTHEAD / BRANDING (RESPONSIVE WRAPPER & TOUCH TARGETS) */}
        <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 sm:min-h-20 py-2 sm:py-3.5 gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
            
            {/* Left: School Crest + Official Bilingual Titles */}
            <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 flex-1">
              
              {/* Back button if navigating sub-pages */}
              {selectedPage !== 'home' && (
                <button
                  onClick={() => {
                    if (onGoBack) onGoBack();
                    else handleNavClick('home');
                  }}
                  className="flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-navy-950 text-slate-800 text-xs font-black border border-slate-300 hover:border-gov-amber-400 transition-all shadow-2xs cursor-pointer group shrink-0 touch-manipulation active:scale-95"
                  title={language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Back to previous page'}
                  id="btn-public-back"
                >
                  <ArrowLeft className="w-4 h-4 text-gov-amber-700 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="hidden xs:inline ml-1">{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              )}

              <button 
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2 sm:gap-3.5 text-left focus:outline-hidden group min-w-0 flex-1 cursor-pointer touch-manipulation py-1"
              >
                {/* Government School Emblem with Glowing Golden Ring */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0 ring-1 sm:ring-2 ring-amber-400/40">
                  <div className="w-full h-full bg-gov-navy-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center text-gov-amber-400">
                    <School className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gov-amber-400" />
                  </div>
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                  <div className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-wide text-amber-800 uppercase flex items-center gap-1 truncate leading-tight">
                    <span>{language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Basic Education Dept, UP'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-emerald-700 font-black">RTE 2009 Free</span>
                  </div>
                  <div className="text-xs sm:text-base md:text-xl lg:text-2xl font-black text-gov-navy-950 leading-snug sm:leading-tight group-hover:text-amber-700 transition-colors line-clamp-1 sm:line-clamp-none my-0.5">
                    {language === 'hi' ? (settings.schoolNameHi || settings.schoolName) : settings.schoolName}
                  </div>
                  <div className="text-[9.5px] sm:text-xs text-slate-600 font-semibold flex items-center gap-1 sm:gap-2 leading-tight flex-wrap">
                    <span className="truncate">{language === 'hi' ? 'विकास खंड: शमसाबाद' : 'Block: Shamsabad'}</span>
                    <span>•</span>
                    <span className="truncate">{language === 'hi' ? 'जनपद: फर्रुखाबाद' : 'District: Farrukhabad'}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline font-mono font-bold text-slate-900 bg-amber-100/80 px-1.5 py-0.2 rounded border border-amber-300">UDISE: {settings.schoolCode}</span>
                  </div>
                </div>
              </button>
            </div>

            {/* Right: Easy Guide + Quick Search + Free Admission CTA + Hamburger with >=44px Touch Targets */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Easy Student & Parent Guide (कहाँ क्या मिलेगा?) */}
              <button
                onClick={() => setIsFinderOpen(true)}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md shadow-amber-500/20 hover:shadow-amber-500/40 transition-all cursor-pointer shrink-0 border border-amber-300 transform active:scale-95 touch-manipulation"
                title={language === 'hi' ? 'कक्षा 1 से 8 विद्यार्थी व अभिभावक आसान गाइड' : 'Class 1-8 Easy Navigation Guide'}
                id="btn-nav-guide"
              >
                <HelpCircle className="w-4 h-4 text-slate-950 shrink-0" />
                <span>{language === 'hi' ? 'कहाँ क्या मिलेगा?' : 'Easy Guide'}</span>
              </button>

              {/* Universal Search (IIT Delhi Search Icon / Ctrl+K) */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer text-xs font-bold shrink-0 touch-manipulation"
                title="Search website (Ctrl+K)"
                id="btn-nav-search"
              >
                <Search className="w-4 h-4 text-amber-600" />
                <span className="text-xs hidden lg:inline">{language === 'hi' ? 'खोजें...' : 'Search...'}</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[9px] text-slate-500 font-mono">⌘K</kbd>
              </button>

              {/* Free Admission CTA Button - Min 44px Touch Target */}
              <button
                onClick={() => handleNavClick('admission')}
                className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 sm:px-4 py-2 rounded-xl text-[11px] sm:text-xs font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:bg-emerald-700 text-white transition-all cursor-pointer shadow-md shadow-emerald-600/30 hover:shadow-lg hover:shadow-emerald-600/40 shrink-0 whitespace-nowrap touch-manipulation active:scale-95"
                title="RTE 2009 Free Admissions"
                id="btn-nav-admissions"
              >
                <GraduationCap className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>{language === 'hi' ? 'नि:शुल्क प्रवेश' : 'Admissions'}</span>
              </button>

              {/* Mobile / Tablet Hamburger Menu Toggle with >= 44px Touch Area */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden flex items-center justify-center min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-800 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 transition-all cursor-pointer shrink-0 touch-manipulation active:scale-95"
                aria-label="Toggle Navigation Menu"
                id="btn-nav-mobile-toggle"
              >
                {mobileMenuOpen ? <X className="w-6 h-6 text-slate-900" /> : <Menu className="w-6 h-6 text-slate-900" />}
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
          className={`fixed inset-0 bg-slate-950/60 z-50 xl:hidden transition-opacity duration-300 ease-out backdrop-blur-[4px] ${
            mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        />

        {/* Off-canvas Slide-in Drawer */}
        <div
          className={`
            fixed inset-y-0 right-0 z-50 w-[88vw] sm:w-[380px] max-w-[400px] bg-white border-l border-slate-200/90 shadow-2xl flex flex-col justify-between xl:hidden
            transform-gpu will-change-transform overscroll-contain transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation Menu"
        >
          {/* Drawer Header */}
          <div className="p-4 bg-white text-slate-900 flex items-center justify-between border-b border-slate-200/90 shrink-0">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shrink-0 border border-slate-800 shadow-2xs">
                <School className="w-5 h-5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-tight">
                  {settings.schoolName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                  {settings.schoolTagline || (language === 'hi' ? 'उत्तर प्रदेश बेसिक शिक्षा विभाग' : 'Basic Education Dept')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer touch-manipulation shrink-0 border border-slate-200/80 active:scale-95"
              aria-label="Close navigation drawer"
              id="btn-drawer-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="px-4 py-3.5 space-y-3.5 overflow-y-auto overscroll-contain custom-scrollbar flex-1">
            {/* Quick Back Button in Mobile Drawer if on subpage */}
            {selectedPage !== 'home' && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onGoBack) onGoBack();
                  else handleNavClick('home');
                }}
                className="w-full min-h-[44px] p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 active:bg-amber-200 text-slate-900 text-xs font-bold flex items-center justify-center gap-2 border border-amber-200/80 transition-all shadow-2xs cursor-pointer touch-manipulation select-none active:scale-[0.98]"
                id="btn-drawer-back"
              >
                <ArrowLeft className="w-4 h-4 text-amber-700" />
                <span>{language === 'hi' ? '← पिछले पृष्ठ पर वापस जाएं' : '← Back to Previous Screen'}</span>
              </button>
            )}

            {/* Quick 1-Click Role Logins in Drawer when not logged in */}
            {!role && (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-student');
                  }}
                  className="min-h-[58px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer touch-manipulation active:scale-[0.98] transition-all shadow-2xs"
                  id="btn-drawer-quick-student"
                >
                  <GraduationCap className="w-5 h-5 text-amber-600 shrink-0" />
                  <span className="truncate w-full text-center leading-tight">
                    {language === 'hi' ? 'छात्र लॉगिन' : 'Student'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-teacher');
                  }}
                  className="min-h-[58px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer touch-manipulation active:scale-[0.98] transition-all shadow-2xs"
                  id="btn-drawer-quick-teacher"
                >
                  <Users className="w-5 h-5 text-blue-600 shrink-0" />
                  <span className="truncate w-full text-center leading-tight">
                    {language === 'hi' ? 'शिक्षक लॉगिन' : 'Teacher'}
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('login-admin');
                  }}
                  className="min-h-[58px] p-2 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-center flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer touch-manipulation active:scale-[0.98] transition-all shadow-2xs"
                  id="btn-drawer-quick-admin"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="truncate w-full text-center leading-tight">
                    {language === 'hi' ? 'प्रधानाध्यापक' : 'Admin'}
                  </span>
                </button>
              </div>
            )}

            {/* Primary ERP Portal Login Card */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('portal');
              }}
              className="w-full min-h-[58px] px-3.5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white text-left flex items-center justify-between shadow-sm border border-slate-800 transition-all group cursor-pointer touch-manipulation select-none active:scale-[0.98]"
              id="btn-drawer-erp-portal"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center font-bold shadow-2xs shrink-0 border border-slate-700">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white leading-tight truncate">
                    {role 
                      ? (language === 'hi' ? 'डैशबोर्ड में प्रवेश करें' : 'Go to Dashboard') 
                      : (language === 'hi' ? 'पोर्टल लॉगिन (ERP)' : 'Portal Login (ERP)')}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                    {role 
                      ? (userProfile?.name ? `${userProfile.name} • Active` : 'Active Session') 
                      : (language === 'hi' ? 'छात्र, शिक्षक एवं प्रधानाध्यापक' : 'Student, Teacher & Headmaster Portals')}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Search Input / Trigger */}
            <div 
              onClick={() => {
                setMobileMenuOpen(false);
                setIsSearchOpen(true);
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100/90 active:bg-slate-100 border border-slate-200/90 text-slate-600 text-xs flex items-center justify-between cursor-pointer touch-manipulation transition-all select-none"
              id="btn-drawer-search"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate text-slate-500 font-normal">
                  {language === 'hi' ? 'सर्च करें (खोजें)...' : 'Search website...'}
                </span>
              </div>
              <span className="px-2 py-0.5 bg-white text-slate-600 border border-slate-200 rounded-md text-[10px] font-bold shadow-2xs shrink-0">
                {language === 'hi' ? 'खोजें' : 'Search'}
              </span>
            </div>

            {/* Easy Guide Quick Finder for Students & Parents */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsFinderOpen(true);
              }}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100/80 hover:to-orange-100/80 active:from-amber-100 active:to-orange-100 border border-amber-200/80 text-amber-950 text-left flex items-center justify-between transition-all group cursor-pointer touch-manipulation active:scale-[0.98]"
              id="btn-drawer-quick-guide"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center text-xs shadow-2xs shrink-0 font-bold">
                  🧭
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-amber-950 truncate">
                    {language === 'hi' ? 'कहाँ क्या मिलेगा? आसान गाइड' : 'Quick Guide for Parents & Students'}
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-700 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* Main Navigation Section */}
            <div className="space-y-1 pt-0.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">
                {language === 'hi' ? 'मुख्य पृष्ठ अनुभाग' : 'Main Navigation'}
              </div>

              <div className="space-y-1">
                {drawerNavItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = selectedPage === item.id || (item.alias && selectedPage === item.alias);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleNavClick(item.id);
                      }}
                      className={`w-full min-h-[46px] text-left px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all touch-manipulation select-none active:scale-[0.99] cursor-pointer ${
                        isItemActive
                          ? `${item.activeBg} ${item.activeBorder} ${item.activeText} rounded-l-xs shadow-2xs`
                          : 'text-slate-700 hover:bg-slate-50 border-l-[3.5px] border-transparent font-medium'
                      }`}
                      id={`btn-drawer-nav-${item.id}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className={`w-5 h-5 shrink-0 transition-colors ${isItemActive ? item.iconColor : 'text-slate-500'}`} />
                        <span className="truncate">{language === 'hi' ? item.labelHi : item.labelEn}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isItemActive ? item.activeArrow : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Links (Schemes & Official Sources) */}
            <div className="pt-1 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                {language === 'hi' ? 'शासकीय एवं UDISE पोर्टल' : 'Official Portals'}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('schemes');
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98] transition-all ${
                    selectedPage === 'schemes'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  id="btn-drawer-schemes"
                >
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">{language === 'hi' ? 'सरकारी योजनाएँ' : 'Govt Schemes'}</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleNavClick('sources');
                  }}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-bold text-center flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation active:scale-[0.98] transition-all ${
                    selectedPage === 'sources'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white hover:bg-slate-50 active:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                  id="btn-drawer-sources"
                >
                  <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate">{language === 'hi' ? 'शिक्षा पोर्टल (UDISE)' : 'UP Portals'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Language Selector Footer */}
          <div className="p-3.5 pb-[max(1rem,env(safe-area-inset-bottom,16px))] border-t border-slate-200/90 bg-slate-50 shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <Languages className="w-4 h-4 text-slate-500" />
              <span>{language === 'hi' ? 'भाषा (Language):' : 'Language:'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLanguage('hi')}
                className={`min-h-[44px] min-w-[76px] px-3.5 py-2 text-xs rounded-xl font-bold transition-all touch-manipulation cursor-pointer flex items-center justify-center active:scale-95 ${
                  language === 'hi' 
                    ? 'bg-slate-900 text-white font-black shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                id="btn-drawer-lang-hi"
              >
                हिन्दी
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`min-h-[44px] min-w-[76px] px-3.5 py-2 text-xs rounded-xl font-bold transition-all touch-manipulation cursor-pointer flex items-center justify-center active:scale-95 ${
                  language === 'en' 
                    ? 'bg-slate-900 text-white font-black shadow-xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
                id="btn-drawer-lang-en"
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
