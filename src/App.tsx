import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { ForcePasswordChangeModal } from './components/common/ForcePasswordChangeModal';
import { ResetPasswordActionModal } from './components/common/ResetPasswordActionModal';
import { UserProfileDropdown } from './components/common/UserProfileDropdown';
import { UserAvatar } from './components/common/UserAvatar';

// Public Pages
import { PublicNavbar } from './components/public/PublicNavbar';
import { PublicFooter } from './components/public/PublicFooter';
import { HomePage } from './components/public/HomePage';
import { AboutPage } from './components/public/AboutPage';
import { FacultyPage } from './components/public/FacultyPage';
import { ClassesCurriculumPage } from './components/public/ClassesCurriculumPage';
import { StatisticsPage } from './components/public/StatisticsPage';
import { FacilitiesPage } from './components/public/FacilitiesPage';
import { GovernmentSchemesPage } from './components/public/GovernmentSchemesPage';
import { AdmissionPage } from './components/public/AdmissionPage';
import { PublicDocumentsPage } from './components/public/PublicDocumentsPage';
import { OfficialSourcesPage } from './components/public/OfficialSourcesPage';
import { FAQPage } from './components/public/FAQPage';
import { GalleryPage } from './components/public/GalleryPage';
import { PublicNoticesPage } from './components/public/PublicNoticesPage';
import { ContactPage } from './components/public/ContactPage';
import { ActivitiesPage } from './components/public/ActivitiesPage';
import { StudentsPage } from './components/public/StudentsPage';
import { LoginPage } from './components/public/LoginPage';
import { RegisterPage } from './components/public/RegisterPage';

// Admin Components & Consolidated Hubs
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAcademicsHub } from './components/admin/hubs/AdminAcademicsHub';
import { AdminFacultyHub } from './components/admin/hubs/AdminFacultyHub';
import { AdminOperationsHub } from './components/admin/hubs/AdminOperationsHub';
import { AdminWebsiteHub } from './components/admin/hubs/AdminWebsiteHub';
import { AdminGovernanceHub } from './components/admin/hubs/AdminGovernanceHub';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { TeacherSidebar } from './components/teacher/TeacherSidebar';
import { StudentSidebar } from './components/student/StudentSidebar';
import { recordPrivatePageView } from './utils/visitorAnalytics';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { TeacherStudents } from './components/teacher/TeacherStudents';
import { TeacherAttendance } from './components/teacher/TeacherAttendance';
import { TeacherMarks } from './components/teacher/TeacherMarks';
import { TeacherHomework } from './components/teacher/TeacherHomework';
import { TeacherTimetable } from './components/teacher/TeacherTimetable';
import { TeacherProfile } from './components/teacher/TeacherProfile';
import { TeacherGalleryUpload } from './components/teacher/TeacherGalleryUpload';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentAttendance } from './components/student/StudentAttendance';
import { StudentMarks } from './components/student/StudentMarks';
import { StudentHomework } from './components/student/StudentHomework';
import { StudentTimetable } from './components/student/StudentTimetable';
import { StudentProfile } from './components/student/StudentProfile';
import { StudentDocuments } from './components/student/StudentDocuments';

// Icons
import { 
  Building2, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  Home,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

const SchoolAppInner: React.FC = () => {
  const { userProfile, isAuthenticated, logout } = useAuth();
  const { settings, language } = useSchool();

  // Public navigation state with history tracking and session persistence
  const [publicPageHistory, setPublicPageHistory] = useState<string[]>([]);
  const [publicPage, setPublicPage] = useState<string>(() => {
    try {
      const saved = sessionStorage.getItem('sms_current_view_page');
      if (saved) return saved;
    } catch {
      // ignore storage errors
    }
    return 'home';
  });

  // Whenever user becomes unauthenticated (logout by student, teacher, or admin),
  // automatically redirect cleanly to login or home
  useEffect(() => {
    if (!isAuthenticated && publicPage === 'portal') {
      setPublicPage('login');
      try {
        sessionStorage.setItem('sms_current_view_page', 'login');
      } catch {}
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
    setPublicPage('home');
    setPublicPageHistory([]);
    setActiveAdminTab('dashboard');
    setActiveTeacherTab('dashboard');
    setActiveStudentTab('dashboard');
    setTabHistory([]);
    setIsSidebarOpen(false);
    try {
      sessionStorage.setItem('sms_current_view_page', 'home');
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigatePage = (page: string) => {
    // If not authenticated and navigating to portal, take directly to login
    const resolvedPage = (!isAuthenticated && page === 'portal') ? 'login' : page;
    try {
      sessionStorage.setItem('sms_current_view_page', resolvedPage);
      if (resolvedPage !== 'portal' && !resolvedPage.startsWith('login') && resolvedPage !== 'register') {
        recordPrivatePageView(resolvedPage);
      }
    } catch {
      // ignore storage errors
    }
    if (publicPage !== resolvedPage) {
      setPublicPageHistory(prev => [...prev.slice(-25), publicPage]);
    }
    setPublicPage(resolvedPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBackPublicPage = () => {
    if (publicPageHistory.length > 0) {
      const nextHistory = [...publicPageHistory];
      const prevPage = nextHistory.pop()!;
      setPublicPageHistory(nextHistory);
      setPublicPage(prevPage);
      try {
        sessionStorage.setItem('sms_current_view_page', prevPage);
      } catch {}
    } else {
      setPublicPage('home');
      try {
        sessionStorage.setItem('sms_current_view_page', 'home');
      } catch {}
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authenticated Dashboard active tab with history tracking
  const [tabHistory, setTabHistory] = useState<string[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<string>('dashboard');
  const [activeTeacherTab, setActiveTeacherTab] = useState<string>('dashboard');
  const [activeStudentTab, setActiveStudentTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Authenticated Portal Layout
  const role = userProfile?.role || 'admin';

  const currentActiveTab = 
    role === 'admin' ? activeAdminTab :
    role === 'teacher' ? activeTeacherTab : activeStudentTab;

  const handleTabChange = (tabId: string) => {
    const current = role === 'admin' ? activeAdminTab : role === 'teacher' ? activeTeacherTab : activeStudentTab;
    if (current !== tabId) {
      setTabHistory(prev => [...prev.slice(-25), current]);
    }
    if (role === 'admin') setActiveAdminTab(tabId);
    else if (role === 'teacher') setActiveTeacherTab(tabId);
    else setActiveStudentTab(tabId);
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBackTab = () => {
    if (tabHistory.length > 0) {
      const nextHistory = [...tabHistory];
      const prevTab = nextHistory.pop()!;
      setTabHistory(nextHistory);
      if (role === 'admin') setActiveAdminTab(prevTab);
      else if (role === 'teacher') setActiveTeacherTab(prevTab);
      else setActiveStudentTab(prevTab);
    } else {
      // Default fallback to dashboard if not on dashboard
      if (role === 'admin' && activeAdminTab !== 'dashboard') setActiveAdminTab('dashboard');
      else if (role === 'teacher' && activeTeacherTab !== 'dashboard') setActiveTeacherTab('dashboard');
      else if (role === 'student' && activeStudentTab !== 'dashboard') setActiveStudentTab('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user is not authenticated or viewing the public website
  if (!isAuthenticated || publicPage !== 'portal') {
    const activePublicView = (!isAuthenticated && publicPage === 'portal') ? 'login' : publicPage;

    // Dedicated Full-Screen Login Portal (100% viewport coverage on mobile, zero outer white margins, seamless touch scaling)
    if (activePublicView === 'login' || activePublicView.startsWith('login-')) {
      const initialRole = 
        activePublicView === 'login-teacher' ? 'teacher' :
        activePublicView === 'login-admin' ? 'admin' : 'student';

      return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 flex flex-col justify-center selection:bg-amber-500 selection:text-slate-950">
          <LoginPage 
            initialRole={initialRole}
            onSuccess={() => handleNavigatePage('portal')} 
            onLoginSuccess={() => handleNavigatePage('portal')} 
            onNavigateHome={() => handleNavigatePage('home')} 
            onNavigateRegister={() => handleNavigatePage('register')}
          />
          {/* Global Security & Password Action Modals */}
          <ResetPasswordActionModal 
            onSuccessLogin={(email, newPass) => {
              handleNavigatePage('login');
            }} 
          />
          <ForcePasswordChangeModal />
        </div>
      );
    }

    // Dedicated Full-Screen Registration Portal
    if (activePublicView === 'register') {
      return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-950 flex flex-col justify-center selection:bg-amber-500 selection:text-slate-950">
          <RegisterPage 
            onSuccess={() => handleNavigatePage('portal')}
            onNavigateLogin={() => handleNavigatePage('login')}
            onNavigateHome={() => handleNavigatePage('home')}
          />
          {/* Global Security & Password Action Modals */}
          <ResetPasswordActionModal 
            onSuccessLogin={(email, newPass) => {
              handleNavigatePage('login');
            }} 
          />
          <ForcePasswordChangeModal />
        </div>
      );
    }

    return (
      <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
        <PublicNavbar
          activePage={activePublicView}
          onNavigate={handleNavigatePage}
          onOpenPortal={() => handleNavigatePage('login')}
          onGoBack={handleGoBackPublicPage}
          canGoBack={publicPageHistory.length > 0 || activePublicView !== 'home'}
        />

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {activePublicView === 'home' && (
            <HomePage 
              onNavigate={handleNavigatePage} 
              onOpenPortal={() => handleNavigatePage('login')}
            />
          )}
          {activePublicView === 'about' && <AboutPage />}
          {activePublicView === 'faculty' && <FacultyPage onNavigate={handleNavigatePage} />}
          {(activePublicView === 'classes' || activePublicView === 'academics') && <ClassesCurriculumPage />}
          {activePublicView === 'statistics' && <StatisticsPage />}
          {activePublicView === 'facilities' && <FacilitiesPage />}
          {activePublicView === 'students' && <StudentsPage onNavigate={handleNavigatePage} />}
          {activePublicView === 'activities' && <ActivitiesPage onNavigate={handleNavigatePage} />}
          {activePublicView === 'schemes' && <GovernmentSchemesPage />}
          {activePublicView === 'admission' && <AdmissionPage />}
          {activePublicView === 'documents' && <PublicDocumentsPage />}
          {activePublicView === 'sources' && <OfficialSourcesPage />}
          {activePublicView === 'faq' && <FAQPage />}
          {activePublicView === 'gallery' && <GalleryPage onNavigate={handleNavigatePage} />}
          {activePublicView === 'notices' && <PublicNoticesPage />}
          {activePublicView === 'contact' && <ContactPage />}
        </main>

        <PublicFooter onNavigate={handleNavigatePage} />

        {/* Global Security & Password Action Modals */}
        <ResetPasswordActionModal 
          onSuccessLogin={(email, newPass) => {
            handleNavigatePage('login');
          }} 
        />
        <ForcePasswordChangeModal />
      </div>
    );
  }

  // Human-readable titles for breadcrumbs
  const getTabTitle = () => {
    if (role === 'admin') {
      const titles: Record<string, { pillar: string; titleEn: string; titleHi: string }> = {
        'dashboard': { pillar: 'Institutional Overview', titleEn: 'Executive Dashboard', titleHi: 'कार्यकारी डैशबोर्ड' },
        'academics': { pillar: 'Academic Directorate', titleEn: 'Students & Academics Hub', titleHi: 'छात्र एवं शैक्षणिक प्रबंधन' },
        'faculty': { pillar: 'Academic Directorate', titleEn: 'Faculty & Staff Hub', titleHi: 'शिक्षक एवं कार्मिक प्रबंधन' },
        'operations': { pillar: 'Daily Operations', titleEn: 'Daily Operations Hub', titleHi: 'दैनिक संचालन एवं मूल्यांकन' },
        'cms': { pillar: 'Public Portal', titleEn: 'Website & Media CMS', titleHi: 'वेबसाइट एवं जनसंचार पोर्टल' },
        'governance': { pillar: 'Governance & Security', titleEn: 'Governance, MIS & Security', titleHi: 'प्रशासन, सेटिंग्स एवं सुरक्षा' },
        'profile': { pillar: 'Faculty & Staff', titleEn: 'Headmaster Directorate', titleHi: 'प्रधानाध्यापिका प्रोफाइल' },
        'school-profile': { pillar: 'Website & Media CMS', titleEn: 'School Profile & UDISE', titleHi: 'विद्यालय विवरण व UDISE' },
        'homepage-mgmt': { pillar: 'Website & Media CMS', titleEn: 'Homepage Layout & CMS', titleHi: 'मुख्य पृष्ठ प्रबंधन' },
        'educational-videos': { pillar: 'Website & Media CMS', titleEn: 'Educational Motivation Videos', titleHi: 'कक्षा 1-8 प्रेरक वीडियो' },
        'media-library': { pillar: 'Website & Media CMS', titleEn: 'Photo & Video Archive', titleHi: 'चित्र एवं वीडियो गैलरी' },
        'facilities-mgmt': { pillar: 'Website & Media CMS', titleEn: 'Campus & Facilities', titleHi: 'भौतिक सुविधाएं' },
        'schemes-mgmt': { pillar: 'Website & Media CMS', titleEn: 'Govt Schemes & MDM', titleHi: 'योजनाएं व मिड-डे मील' },
        'admission-mgmt': { pillar: 'Website & Media CMS', titleEn: 'Admission Governance', titleHi: 'प्रवेश नियम व नीतियां' },
        'contact-mgmt': { pillar: 'Website & Media CMS', titleEn: 'Contact & Timings', titleHi: 'संपर्क एवं समय' },
        'students': { pillar: 'Students & Academics', titleEn: 'Student Directory & Admissions', titleHi: 'छात्र नामांकन व पंजिका' },
        'teachers': { pillar: 'Faculty & Staff', titleEn: 'Faculty & Staff Directory', titleHi: 'शिक्षक एवं कार्मिक' },
        'classes': { pillar: 'Students & Academics', titleEn: 'Classes & Sections', titleHi: 'कक्षाएं एवं वर्ग' },
        'subjects': { pillar: 'Students & Academics', titleEn: 'Curriculum & Subjects', titleHi: 'विषय एवं पाठ्यक्रम' },
        'assignments': { pillar: 'Faculty & Staff', titleEn: 'Faculty Class Allocation', titleHi: 'शिक्षक कार्य आवंटन' },
        'timetable': { pillar: 'Students & Academics', titleEn: 'Master Academic Timetable', titleHi: 'मास्टर समय-सारिणी' },
        'attendance': { pillar: 'Daily Operations', titleEn: 'Daily Attendance Register', titleHi: 'दैनिक उपस्थिति पंजिका' },
        'examinations': { pillar: 'Daily Operations', titleEn: 'Exams & Marks Gradebook', titleHi: 'परीक्षा एवं प्रगति पत्र' },
        'homework': { pillar: 'Daily Operations', titleEn: 'Homework & Broadcasts', titleHi: 'गृहकार्य एवं कार्य' },
        'notices': { pillar: 'Daily Operations', titleEn: 'Circulars & Official Notices', titleHi: 'शासनादेश एवं सूचना पट्ट' },
        'notice-ticker': { pillar: 'Operations & CMS', titleEn: 'Notice Ticker & Flash Alerts', titleHi: 'लाइव सूचना टिकर व अलर्ट' },
        'documents': { pillar: 'Students & Academics', titleEn: 'Student Certificates & TC Vault', titleHi: 'प्रमाणपत्र व टीसी लॉकर' },
        'reports': { pillar: 'Governance & Security', titleEn: 'Governance Analytics & MIS', titleHi: 'प्रशासनिक विश्लेषण व रिपोर्ट' },
        'users': { pillar: 'Governance & Security', titleEn: 'User Logins & Permissions', titleHi: 'उपयोगकर्ता एवं अनुमतियां' },
        'audit': { pillar: 'Governance & Security', titleEn: 'Security Audit Trail Logs', titleHi: 'सुरक्षा ऑडिट लॉग' },
        'settings': { pillar: 'Governance & Security', titleEn: 'Institutional System Settings', titleHi: 'विद्यालय सिस्टम सेटिंग्स' },
      };
      return titles[activeAdminTab] || { pillar: 'Administration', titleEn: 'Executive Portal', titleHi: 'प्रशासनिक पोर्टल' };
    } else if (role === 'teacher') {
      const titles: Record<string, { pillar: string; titleEn: string; titleHi: string }> = {
        'dashboard': { pillar: 'Faculty Desk', titleEn: 'Faculty Dashboard', titleHi: 'शिक्षक डैशबोर्ड' },
        'profile': { pillar: 'Faculty Profile', titleEn: 'My Faculty Profile', titleHi: 'शिक्षक प्रोफाइल' },
        'gallery-upload': { pillar: 'Media Archive', titleEn: 'Media & Video Upload', titleHi: 'फोटो व वीडियो अपलोड' },
        'students': { pillar: 'Classroom', titleEn: 'My Students Directory', titleHi: 'कक्षा के छात्र' },
        'attendance': { pillar: 'Classroom', titleEn: 'Mark Class Attendance', titleHi: 'छात्र उपस्थिति' },
        'marks': { pillar: 'Evaluation', titleEn: 'Enter Exam Marks', titleHi: 'परीक्षा प्राप्तांक' },
        'homework': { pillar: 'Classroom', titleEn: 'Homework Manager', titleHi: 'गृहकार्य प्रबंधन' },
        'timetable': { pillar: 'Schedule', titleEn: 'Teaching Timetable', titleHi: 'शिक्षण समय-सारिणी' },
      };
      return titles[activeTeacherTab] || { pillar: 'Faculty', titleEn: 'Faculty Portal', titleHi: 'शिक्षक पोर्टल' };
    } else {
      const titles: Record<string, { pillar: string; titleEn: string; titleHi: string }> = {
        'dashboard': { pillar: 'Student Desk', titleEn: 'Student Dashboard', titleHi: 'छात्र डैशबोर्ड' },
        'profile': { pillar: 'Student ID', titleEn: 'Official Profile & ID Card', titleHi: 'छात्र पहचान पत्र' },
        'attendance': { pillar: 'Academics', titleEn: 'Attendance History', titleHi: 'मेरी उपस्थिति' },
        'marks': { pillar: 'Academics', titleEn: 'Results & Report Card', titleHi: 'परीक्षा परिणाम व प्रगति पत्र' },
        'homework': { pillar: 'Academics', titleEn: 'Daily Homework Tasks', titleHi: 'दैनिक गृहकार्य' },
        'timetable': { pillar: 'Schedule', titleEn: 'Class Schedule', titleHi: 'कक्षा समय-सारिणी' },
      };
      return titles[activeStudentTab] || { pillar: 'Student', titleEn: 'Student Portal', titleHi: 'छात्र पोर्टल' };
    }
  };

  const activeTabInfo = getTabTitle();

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Portal Top Bar - Premier University ERP Masthead */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left Side: School Branding, Drawer Toggle & Live Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors shrink-0"
            aria-label="Toggle Navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Portal Quick Back Button (Takes user back to previously visited tab/screen) */}
          {(tabHistory.length > 0 || currentActiveTab !== 'dashboard') && (
            <button
              onClick={handleGoBackTab}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-black transition-all shadow-sm cursor-pointer shrink-0 group"
              title={language === 'hi' ? 'पिछले पृष्ठ पर वापस जाएं' : 'Back to previous screen'}
              id="btn-portal-header-back"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:text-slate-950 group-hover:-translate-x-0.5 transition-all" />
              <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
            </button>
          )}

          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shrink-0 border border-amber-300/30">
              <Building2 className="w-5 h-5 text-slate-950" />
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-xs sm:text-sm text-white truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                  {settings.schoolName}
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {role === 'admin' ? 'Headmaster Directorate' : role === 'teacher' ? 'Faculty Directorate' : 'Student Portal'}
                </span>
              </div>
              
              {/* Dynamic University Breadcrumb */}
              <div className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1.5 mt-0.5">
                <span className="text-amber-400 font-bold">{activeTabInfo.pillar}</span>
                <span>›</span>
                <span className="text-slate-200 font-semibold truncate">
                  {language === 'hi' ? activeTabInfo.titleHi : activeTabInfo.titleEn}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive User Profile Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <UserProfileDropdown
            onNavigateProfile={() => handleTabChange('profile')}
            onNavigatePublic={() => handleNavigatePage('home')}
            onLogout={handleLogout}
          />
        </div>
      </header>

      {/* Portal Main Body (Organized Sidebar + Content Canvas) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modular Categorized Sidebar Navigation */}
        {role === 'admin' && (
          <AdminSidebar
            activeTab={activeAdminTab}
            onSelectTab={handleTabChange}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {role === 'teacher' && (
          <TeacherSidebar
            activeTab={activeTeacherTab}
            onSelectTab={handleTabChange}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {role === 'student' && (
          <StudentSidebar
            activeTab={activeStudentTab}
            onSelectTab={handleTabChange}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onLogout={handleLogout}
          />
        )}

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {/* Force Password Change Modal if mustChangePassword flag is true */}
            <ForcePasswordChangeModal />

            {/* In-Canvas Institutional Breadcrumb & Back Strip */}
            {currentActiveTab !== 'dashboard' && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <button
                    onClick={handleGoBackTab}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-black transition-all shadow-xs cursor-pointer group shrink-0"
                    id="btn-canvas-back-to-prev"
                  >
                    <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:text-slate-950 group-hover:-translate-x-1 transition-transform" />
                    <span>{language === 'hi' ? 'वापस जाएं (Back)' : 'Back to Previous'}</span>
                  </button>

                  <div className="h-5 w-px bg-slate-200 hidden sm:block" />

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate">
                    <button 
                      onClick={() => handleTabChange('dashboard')}
                      className="hover:text-amber-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>{language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}</span>
                    </button>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-400 hidden sm:inline">{activeTabInfo.pillar}</span>
                    <span className="text-slate-400 hidden sm:inline">›</span>
                    <span className="font-extrabold text-slate-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                      {language === 'hi' ? activeTabInfo.titleHi : activeTabInfo.titleEn}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleTabChange('dashboard')}
                  className="text-[11px] font-bold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer ml-auto"
                >
                  <Home className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'hi' ? 'मुख्य डैशबोर्ड' : 'Executive Dashboard'}</span>
                </button>
              </div>
            )}

            {/* ADMIN ROUTING - 6 CONSOLIDATED STREAMLINED HUBS */}
            {role === 'admin' && (
              <>
                {activeAdminTab === 'dashboard' && <AdminDashboard onNavigateTab={handleTabChange} />}

                {/* 1. Students & Academics Hub */}
                {(['academics', 'students', 'classes', 'subjects', 'timetable', 'documents'].includes(activeAdminTab)) && (
                  <AdminAcademicsHub
                    initialSubTab={
                      activeAdminTab === 'classes' ? 'classes' :
                      activeAdminTab === 'subjects' ? 'subjects' :
                      activeAdminTab === 'timetable' ? 'timetable' :
                      activeAdminTab === 'documents' ? 'documents' : 'students'
                    }
                    onNavigateTab={handleTabChange}
                  />
                )}

                {/* 2. Faculty & Staff Hub */}
                {(['faculty', 'teachers', 'assignments', 'profile', 'head-teacher'].includes(activeAdminTab)) && (
                  <AdminFacultyHub
                    initialSubTab={
                      activeAdminTab === 'assignments' ? 'assignments' :
                      activeAdminTab === 'profile' || activeAdminTab === 'head-teacher' ? 'profile' : 'teachers'
                    }
                    onNavigateTab={handleTabChange}
                  />
                )}

                {/* 3. Daily Operations Hub */}
                {(['operations', 'attendance', 'examinations', 'homework', 'notices'].includes(activeAdminTab)) && (
                  <AdminOperationsHub
                    initialSubTab={
                      activeAdminTab === 'examinations' ? 'examinations' :
                      activeAdminTab === 'homework' ? 'homework' :
                      activeAdminTab === 'notices' ? 'notices' : 'attendance'
                    }
                    onNavigateTab={handleTabChange}
                  />
                )}

                {/* 4. Website & Media CMS Hub */}
                {(['cms', 'homepage-mgmt', 'notice-ticker', 'educational-videos', 'media-library', 'school-profile', 'facilities-mgmt', 'schemes-mgmt', 'admission-mgmt', 'contact-mgmt'].includes(activeAdminTab)) && (
                  <AdminWebsiteHub
                    initialSubTab={
                      activeAdminTab === 'notice-ticker' ? 'notice-ticker' :
                      activeAdminTab === 'educational-videos' ? 'educational-videos' :
                      activeAdminTab === 'media-library' ? 'media-library' :
                      activeAdminTab === 'school-profile' ? 'school-profile' :
                      activeAdminTab === 'facilities-mgmt' ? 'facilities-mgmt' :
                      activeAdminTab === 'schemes-mgmt' ? 'schemes-mgmt' :
                      activeAdminTab === 'admission-mgmt' ? 'admission-mgmt' :
                      activeAdminTab === 'contact-mgmt' ? 'contact-mgmt' : 'homepage-mgmt'
                    }
                    onNavigateTab={handleTabChange}
                  />
                )}

                {/* 5. Governance, MIS & Security Hub */}
                {(['governance', 'settings', 'users', 'reports', 'audit'].includes(activeAdminTab)) && (
                  <AdminGovernanceHub
                    initialSubTab={
                      activeAdminTab === 'users' ? 'users' :
                      activeAdminTab === 'reports' ? 'reports' :
                      activeAdminTab === 'audit' ? 'audit' : 'settings'
                    }
                    onNavigateTab={handleTabChange}
                  />
                )}
              </>
            )}

            {/* TEACHER ROUTING */}
            {role === 'teacher' && (
              <>
                {activeTeacherTab === 'dashboard' && <TeacherDashboard onNavigateTab={handleTabChange} />}
                {activeTeacherTab === 'profile' && <TeacherProfile />}
                {activeTeacherTab === 'gallery-upload' && <TeacherGalleryUpload />}
                {activeTeacherTab === 'students' && <TeacherStudents />}
                {activeTeacherTab === 'attendance' && <TeacherAttendance />}
                {activeTeacherTab === 'marks' && <TeacherMarks />}
                {activeTeacherTab === 'homework' && <TeacherHomework />}
                {activeTeacherTab === 'timetable' && <TeacherTimetable />}
              </>
            )}

            {/* STUDENT ROUTING */}
            {role === 'student' && (
              <>
                {activeStudentTab === 'dashboard' && <StudentDashboard onNavigateTab={handleTabChange} />}
                {activeStudentTab === 'profile' && <StudentProfile onNavigateTab={handleTabChange} />}
                {activeStudentTab === 'documents' && <StudentDocuments />}
                {activeStudentTab === 'attendance' && <StudentAttendance />}
                {activeStudentTab === 'marks' && <StudentMarks />}
                {activeStudentTab === 'homework' && <StudentHomework />}
                {activeStudentTab === 'timetable' && <StudentTimetable />}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Global Security & Password Action Modals */}
      <ResetPasswordActionModal 
        onSuccessLogin={(email, newPass) => {
          handleNavigatePage('login');
        }} 
      />
      <ForcePasswordChangeModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SchoolProvider>
        <SchoolAppInner />
      </SchoolProvider>
    </AuthProvider>
  );
}

export default App;
