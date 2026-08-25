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

  // IIT Delhi Architecture: 6 Main Navigation Mega-Menus
  const navPillars = [
    {
      id: 'about-pillar',
      labelEn: 'About Us',
      labelHi: 'संस्थान परिचय',
      badge: 'UDISE: 09290205902',
      items: [
        { 
          id: 'about', 
          labelEn: 'School Profile & History', 
          labelHi: 'विद्यालय परिचय एवं इतिहास', 
          icon: Building2, 
          descEn: 'Official government establishment, UDISE code & leadership', 
          descHi: 'शासकीय पहचान, UDISE कोड व स्थापना विवरण' 
        },
        { 
          id: 'faculty', 
          labelEn: 'Faculty & Staff Directory', 
          labelHi: 'शिक्षक एवं कार्मिक पंजिका', 
          icon: Users, 
          descEn: 'Certified teaching staff, qualifications & headmaster', 
          descHi: 'सत्यापित शिक्षक, योग्यता व पदस्थापन विवरण' 
        },
        { 
          id: 'statistics', 
          labelEn: 'Institutional Statistics & PTR', 
          labelHi: 'सांख्यिकी व छात्र-शिक्षक अनुपात', 
          icon: BarChart3, 
          descEn: 'Enrollment figures, gender ratio & PTR metrics', 
          descHi: 'कक्षावार नामांकन, लिंगानुपात व PTR आंकड़े' 
        },
        { 
          id: 'faq', 
          labelEn: 'Rules & Code of Conduct (FAQ)', 
          labelHi: 'नियमावली एवं सामान्य प्रश्न (FAQ)', 
          icon: HelpCircle, 
          descEn: 'School regulations, guidelines & common questions', 
          descHi: 'विद्यालयी नियम, आचार संहिता व मार्गदर्शन' 
        },
        { 
          id: 'login-admin', 
          labelEn: 'Headmaster / Admin ERP Login', 
          labelHi: 'प्रधानाध्यापक / व्यवस्थापक लॉगिन', 
          icon: ShieldCheck, 
          descEn: 'Administrative dashboard, student roster & admissions management', 
          descHi: 'प्रशासनिक डैशबोर्ड, छात्र पंजिका व नवीन प्रवेश प्रबंधन' 
        }
      ]
    },
    {
      id: 'academics-pillar',
      labelEn: 'Academics',
      labelHi: 'शिक्षा एवं संकाय',
      badge: 'NCERT / SCERT',
      items: [
        { 
          id: 'classes', 
          labelEn: 'Curriculum & Subjects (Classes 1–8)', 
          labelHi: 'कक्षा 1 से 8 पाठ्यक्रम व विषय', 
          icon: BookOpen, 
          descEn: 'Primary & Upper Primary syllabus, learning outcomes', 
          descHi: 'प्राथमिक व उच्च प्राथमिक विषय एवं अधिगम प्रतिफल' 
        },
        { 
          id: 'documents', 
          labelEn: 'Academic Calendar & Timetable', 
          labelHi: 'शैक्षणिक कैलेंडर व समय सारणी', 
          icon: Calendar, 
          descEn: 'Govt. holiday list, examinations & annual schedule', 
          descHi: 'शासकीय अवकाश सूची, परीक्षा कैलेंडर व प्रपत्र' 
        },
        { 
          id: 'login-teacher', 
          labelEn: 'Faculty & Staff Portal Login', 
          labelHi: 'शिक्षक एवं स्टॉफ पोर्टल लॉगिन', 
          icon: Users, 
          descEn: 'Attendance marking, mid-day meal logging & marks entry', 
          descHi: 'दैनिक छात्र उपस्थिति, एमडीएम लॉग व परीक्षा अंक प्रविष्टि' 
        }
      ]
    },
    {
      id: 'admissions-pillar',
      labelEn: 'Admissions',
      labelHi: 'प्रवेश (100% Free)',
      badge: 'RTE 2009',
      items: [
        { 
          id: 'admission', 
          labelEn: 'Free Admission Process (RTE 2009)', 
          labelHi: 'नि:शुल्क प्रवेश प्रक्रिया (RTE 2009)', 
          icon: GraduationCap, 
          descEn: 'Zero fee policy, eligibility criteria & application', 
          descHi: '100% नि:शुल्क प्रवेश, आवश्यक प्रपत्र व ऑनलाइन आवेदन' 
        },
        { 
          id: 'faq', 
          labelEn: 'Admission Guidelines & FAQs', 
          labelHi: 'प्रवेश दिशानिर्देश व प्रश्नोत्तरी', 
          icon: HelpCircle, 
          descEn: 'Required documents, age eligibility & criteria', 
          descHi: 'आयु सीमा, आवश्यक दस्तावेज व प्रवेश प्रक्रिया' 
        }
      ]
    },
    {
      id: 'student-pillar',
      labelEn: 'Student Corner',
      labelHi: 'विद्यार्थी कॉर्नर',
      badge: 'Welfare & ERP',
      items: [
        { 
          id: 'login-student', 
          labelEn: 'Student & Parent Portal Login', 
          labelHi: 'छात्र एवं अभिभावक पोर्टल लॉगिन', 
          icon: GraduationCap, 
          descEn: 'View attendance, progress report, DBT status & notices', 
          descHi: 'दैनिक उपस्थिति, प्रगति पत्र, डीबीटी स्थिति व विद्यालयी सूचनाएं' 
        },
        { 
          id: 'schemes', 
          labelEn: 'PM-POSHAN (MDM) & DBT ₹1200', 
          labelHi: 'मध्याह्न भोजन (MDM) व DBT ₹1200', 
          icon: Gift, 
          descEn: 'Nutritious daily meals, uniform & bag grant, free books', 
          descHi: 'दैनिक पौष्टिक भोजन, यूनिफॉर्म/बैग DBT, नि:शुल्क पाठ्यपुस्तक' 
        },
        { 
          id: 'gallery', 
          labelEn: 'Sports & Cultural Activities', 
          labelHi: 'खेलकूद एवं सह-पाठ्यचर्या', 
          icon: ImageIcon, 
          descEn: 'Bal Sabha, sports meet, yoga & cultural achievements', 
          descHi: 'बाल सभा, खेल प्रतियोगिताएं, योग व उत्सव' 
        }
      ]
    },
    {
      id: 'campus-pillar',
      labelEn: 'Campus & Facilities',
      labelHi: 'सुविधाएं एवं परिसर',
      badge: 'Kayakalp',
      items: [
        { 
          id: 'facilities', 
          labelEn: 'Campus Infrastructure & Water', 
          labelHi: 'भौतिक सुविधाएं व नल से जल', 
          icon: Droplets, 
          descEn: 'Tap water, smart classes, solar power & sports ground', 
          descHi: 'जल जीवन मिशन, स्मार्ट क्लास, सोलर व खेल मैदान' 
        },
        { 
          id: 'gallery', 
          labelEn: 'Photo & Video Campus Tour', 
          labelHi: 'चित्र एवं वीडियो परिसर भ्रमण', 
          icon: ImageIcon, 
          descEn: 'High resolution photos and video clips of campus', 
          descHi: 'परिसर, कक्षाओं व गतिविधियों का विहंगम दृश्य' 
        }
      ]
    },
    {
      id: 'notices-pillar',
      labelEn: 'Notices & Links',
      labelHi: 'सूचनाएं व पोर्टल',
      badge: `${notices.filter(n => n.status === 'active').length} Live`,
      items: [
        { 
          id: 'notices', 
          labelEn: 'Official Notice Board & Orders', 
          labelHi: 'शासकीय सूचना पट्ट व शासनादेश', 
          icon: Bell, 
          descEn: 'Latest departmental circulars & school announcements', 
          descHi: 'नवीनतम शासकीय शासनादेश व विद्यालयी सूचनाएं' 
        },
        { 
          id: 'sources', 
          labelEn: 'UP Education Portals & UDISE+', 
          labelHi: 'आधिकारिक शिक्षा पोर्टल व UDISE+', 
          icon: Globe, 
          descEn: 'Direct links to UDISE+, Prerna, Manav Sampada & Diksha', 
          descHi: 'UDISE+, बेसिक शिक्षा, मिशन प्रेरणा, दीक्षा पोर्टल' 
        },
        { 
          id: 'contact', 
          labelEn: 'Contact Directory & Map', 
          labelHi: 'संपर्क निर्देशिका व मैप', 
          icon: Phone, 
          descEn: 'School location, timings & emergency helplines', 
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
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600" />

        {/* 2. MAIN INSTITUTIONAL MASTHEAD / BRANDING (IIT DELHI FORMAT - FULLY RESPONSIVE AUTO-HEIGHT) */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-16 sm:min-h-20 py-2.5 sm:py-3.5 gap-2 sm:gap-4 h-auto">
            
            {/* Left: School Crest + Official Bilingual Titles */}
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
              
              {/* Back button if navigating sub-pages */}
              {selectedPage !== 'home' && (
                <button
                  onClick={() => {
                    if (onGoBack) onGoBack();
                    else handleNavClick('home');
                  }}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-gov-amber-100 hover:text-gov-navy-950 text-slate-800 text-[11px] sm:text-xs font-black border border-slate-300 hover:border-gov-amber-400 transition-all shadow-2xs cursor-pointer group shrink-0"
                  title={language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Back to previous page'}
                  id="btn-public-back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gov-amber-700 group-hover:-translate-x-1 transition-transform" />
                  <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
                </button>
              )}

              <button 
                onClick={() => handleNavClick('home')}
                className="flex items-center gap-2.5 sm:gap-4 text-left focus:outline-hidden group min-w-0 flex-1 cursor-pointer"
              >
                {/* Government School Emblem */}
                <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-gov-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md group-hover:scale-105 transition-transform shrink-0">
                  <div className="w-full h-full bg-gov-navy-950 rounded-[14px] flex items-center justify-center text-gov-amber-400">
                    <School className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gov-amber-400" />
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[9px] sm:text-[10px] md:text-[11px] font-black tracking-wider text-gov-amber-700 uppercase flex items-center gap-1 sm:gap-1.5 truncate">
                    <span>{language === 'hi' ? 'बेसिक शिक्षा परिषद, उत्तर प्रदेश' : 'Basic Education Dept, UP'}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline text-emerald-700 font-bold">RTE 2009 Free</span>
                  </div>
                  <div className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-gov-navy-950 tracking-tight leading-tight group-hover:text-gov-amber-600 transition-colors line-clamp-1 sm:line-clamp-none">
                    {language === 'hi' ? settings.schoolNameHi : settings.schoolName}
                  </div>
                  <div className="text-[10px] sm:text-xs text-slate-600 font-medium flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                    <span>{language === 'hi' ? 'विकास खंड: शमसाबाद' : 'Block: Shamsabad'}</span>
                    <span>•</span>
                    <span>{language === 'hi' ? 'जनपद: फर्रुखाबाद' : 'District: Farrukhabad'}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline font-mono font-bold text-gov-navy-900">UDISE: {settings.schoolCode}</span>
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
                <Search className="w-3.5 h-3.5 text-gov-amber-600" />
                <span className="text-xs hidden lg:inline">{language === 'hi' ? 'खोजें...' : 'Search...'}</span>
                <kbd className="hidden lg:inline-block px-1.5 py-0.2 bg-white border border-slate-300 rounded text-[9px] text-slate-500 font-mono">⌘K</kbd>
              </button>

              {/* Free Admission CTA Button */}
              <button
                onClick={() => handleNavClick('admission')}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md shadow-emerald-600/20 shrink-0 whitespace-nowrap"
                title="RTE 2009 Free Admissions"
                id="btn-nav-admissions"
              >
                <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
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

        {/* 3. PRIMARY NAVIGATION BAR (IIT DELHI MEGA MENU HIERARCHY) */}
        <div className="hidden xl:block bg-gov-navy-900 border-t border-gov-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center justify-between">
              
              <div className="flex items-center gap-1">
                {/* Home Tab */}
                <button
                  onClick={() => handleNavClick('home')}
                  className={`px-4 py-2.5 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedPage === 'home'
                      ? 'bg-gov-amber-500 text-gov-navy-950 shadow-inner'
                      : 'text-white hover:bg-gov-navy-800 hover:text-gov-amber-400'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'मुख्य पृष्ठ' : 'Home'}</span>
                </button>

                {/* 6 Institutional Mega Dropdowns */}
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
                        className={`px-3.5 py-2.5 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isGroupActive
                            ? 'bg-gov-amber-500 text-gov-navy-950 font-black'
                            : isOpen 
                              ? 'bg-gov-navy-800 text-gov-amber-400' 
                              : 'text-slate-100 hover:bg-gov-navy-800 hover:text-gov-amber-400'
                        }`}
                      >
                        <span>{language === 'hi' ? pillar.labelHi : pillar.labelEn}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gov-amber-400' : 'text-slate-300'}`} />
                      </button>

                      {/* Mega Dropdown Panel Window */}
                      {isOpen && (
                        <div className="absolute top-full left-0 mt-0 w-84 sm:w-96 bg-white rounded-b-2xl shadow-2xl border border-slate-200 p-3 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-150 z-50">
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
                                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-3 cursor-pointer group/item ${
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
              </div>

              {/* Right Side Info: Live UDISE & Portal Direct Button */}
              <div className="flex items-center gap-3 py-1 text-xs">
                <button
                  onClick={() => handleNavClick('sources')}
                  className="text-slate-300 hover:text-gov-amber-400 text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-gov-amber-400" />
                  <span>UP Education Portals</span>
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

            {/* Quick Home button */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleNavClick('home');
              }}
              className={`w-full min-h-[44px] p-3 rounded-xl text-xs font-bold text-left flex items-center justify-between touch-manipulation select-none active:scale-[0.98] transition-all ${
                selectedPage === 'home' ? 'bg-gov-navy-900 text-gov-amber-400 font-black' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
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
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
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
