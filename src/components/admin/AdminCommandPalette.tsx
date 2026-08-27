import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  X,
  GraduationCap,
  Users,
  CalendarCheck2,
  Award,
  BookOpen,
  FileText,
  Clock,
  Layers,
  Settings,
  Bell,
  Radio,
  Video,
  Image as ImageIcon,
  Building2,
  Wrench,
  Gift,
  Phone,
  ShieldCheck,
  TrendingUp,
  History,
  Sparkles,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tabId: string) => void;
  onNavigatePublic?: (page: string) => void;
}

interface CommandItem {
  id: string;
  category: 'quick_actions' | 'modules' | 'students' | 'teachers' | 'notices';
  title: string;
  subtitle?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const AdminCommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onNavigatePublic
}) => {
  const { students, teachers, notices, classes, language } = useSchool();
  const { registrationRequests } = useAuth();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Focus input when opened & reset query
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown listeners (Escape to close, Up/Down for selection, Enter to execute)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Build searchable items
  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // 1. Quick Actions
    list.push(
      {
        id: 'action-attendance',
        category: 'quick_actions',
        title: language === 'hi' ? 'दैनिक उपस्थिति दर्ज करें' : 'Mark Daily Attendance',
        subtitle: language === 'hi' ? 'कक्षावार छात्र उपस्थिति' : 'Quick register student attendance',
        icon: CalendarCheck2,
        action: () => {
          onNavigateTab('attendance');
          onClose();
        }
      },
      {
        id: 'action-add-student',
        category: 'quick_actions',
        title: language === 'hi' ? 'नया छात्र नामांकन (Admissions)' : 'Student Directory & Admissions',
        subtitle: language === 'hi' ? 'छात्र विवरण व पंजिका' : 'Enroll or manage student profiles',
        icon: PlusCircle,
        action: () => {
          onNavigateTab('students');
          onClose();
        }
      },
      {
        id: 'action-exam-marks',
        category: 'quick_actions',
        title: language === 'hi' ? 'परीक्षा अंक एवं परिणाम (Marks Entry)' : 'Record Exam Marks & Progress',
        subtitle: language === 'hi' ? 'अर्धवार्षिक / वार्षिक परीक्षा' : 'Term & annual exam grading',
        icon: Award,
        action: () => {
          onNavigateTab('examinations');
          onClose();
        }
      },
      {
        id: 'action-tc-vault',
        category: 'quick_actions',
        title: language === 'hi' ? 'स्थानांतरण प्रमाण पत्र (TC Vault)' : 'TC Vault & Certificates',
        subtitle: language === 'hi' ? 'प्रमाणपत्र जनरेट व डाउनलोड' : 'Generate character and transfer certificates',
        icon: FileText,
        action: () => {
          onNavigateTab('documents');
          onClose();
        }
      },
      {
        id: 'action-post-notice',
        category: 'quick_actions',
        title: language === 'hi' ? 'नया नोटिस / परिपत्र जारी करें' : 'Publish School Circular / Notice',
        subtitle: language === 'hi' ? 'डिजिटल सूचना पट्ट' : 'Post circulars to public and student portals',
        icon: Bell,
        action: () => {
          onNavigateTab('notices');
          onClose();
        }
      },
      {
        id: 'action-faculty-approvals',
        category: 'quick_actions',
        title: language === 'hi' ? 'शिक्षक अनुमोदन (Faculty Approvals)' : 'Faculty Registry & Approvals',
        subtitle: language === 'hi' ? 'नए शिक्षक पंजीकरण स्वीकृत करें' : 'Verify pending teacher onboarding',
        badge: `${registrationRequests.filter(r => r.requestedRole === 'teacher' && r.status === 'PENDING').length} Pending`,
        icon: Users,
        action: () => {
          onNavigateTab('teachers');
          onClose();
        }
      }
    );

    // 2. All 24 Core Modules
    const modules = [
      { id: 'dashboard', nameEn: 'Executive Dashboard', nameHi: 'कार्यकारी डैशबोर्ड', icon: Building2 },
      { id: 'students', nameEn: 'Student Directory & Admissions', nameHi: 'छात्र नामांकन व पंजिका', icon: GraduationCap },
      { id: 'classes', nameEn: 'Classes & Sections', nameHi: 'कक्षाएं एवं वर्ग', icon: Layers },
      { id: 'subjects', nameEn: 'Curriculum & Subjects', nameHi: 'विषय एवं पाठ्यक्रम', icon: BookOpen },
      { id: 'timetable', nameEn: 'Master Timetable', nameHi: 'मास्टर समय-सारिणी', icon: Clock },
      { id: 'documents', nameEn: 'Certificates & TC Vault', nameHi: 'प्रमाणपत्र व टीसी लॉकर', icon: FileText },
      { id: 'teachers', nameEn: 'Faculty Directory & Approvals', nameHi: 'शिक्षक पंजिका व अनुमोदन', icon: Users },
      { id: 'assignments', nameEn: 'Class & Subject Allocation', nameHi: 'शिक्षक कार्य आवंटन', icon: Users },
      { id: 'profile', nameEn: 'Headmaster Record & Directorate', nameHi: 'प्रधानाध्यापिका आधिकारिक रिकॉर्ड', icon: ShieldCheck },
      { id: 'attendance', nameEn: 'Daily Attendance System', nameHi: 'दैनिक उपस्थिति पंजिका', icon: CalendarCheck2 },
      { id: 'examinations', nameEn: 'Exams & Marks Grading', nameHi: 'परीक्षा एवं प्रगति पत्र', icon: Award },
      { id: 'homework', nameEn: 'Homework & Broadcasts', nameHi: 'गृहकार्य एवं कार्य', icon: BookOpen },
      { id: 'notices', nameEn: 'Circulars & Notice Board', nameHi: 'शासनादेश एवं सूचना पट्ट', icon: Bell },
      { id: 'notice-ticker', nameEn: 'Live Notice Ticker', nameHi: 'लाइव सूचना टिकर व अलर्ट', icon: Radio },
      { id: 'homepage-mgmt', nameEn: 'Homepage & Banners CMS', nameHi: 'मुख्य पृष्ठ प्रबंधन', icon: Sparkles },
      { id: 'educational-videos', nameEn: 'Educational Videos (Classes 1-8)', nameHi: 'कक्षा 1-8 प्रेरक वीडियो', icon: Video },
      { id: 'media-library', nameEn: 'Photo & Video Gallery', nameHi: 'चित्र व वीडियो गैलरी', icon: ImageIcon },
      { id: 'school-profile', nameEn: 'School Profile & UDISE', nameHi: 'विद्यालय विवरण व UDISE', icon: Building2 },
      { id: 'facilities-mgmt', nameEn: 'Campus Facilities & Infrastructure', nameHi: 'भौतिक सुविधाएं', icon: Wrench },
      { id: 'schemes-mgmt', nameEn: 'Govt Schemes & MDM', nameHi: 'योजनाएं व मिड-डे मील', icon: Gift },
      { id: 'admission-mgmt', nameEn: 'Admission Policies & Criteria', nameHi: 'प्रवेश नियम व नीतियां', icon: GraduationCap },
      { id: 'contact-mgmt', nameEn: 'Contact, Timings & Location', nameHi: 'संपर्क, समय व मैप', icon: Phone },
      { id: 'settings', nameEn: 'School ERP Settings', nameHi: 'विद्यालय सिस्टम सेटिंग्स', icon: Settings },
      { id: 'users', nameEn: 'User Logins & Security', nameHi: 'उपयोगकर्ता व सुरक्षा', icon: ShieldCheck },
      { id: 'reports', nameEn: 'MIS Analytics & Reports', nameHi: 'प्रशासनिक विश्लेषण व रिपोर्ट', icon: TrendingUp },
      { id: 'audit', nameEn: 'Security Audit Logs', nameHi: 'सुरक्षा ऑडिट लॉग', icon: History }
    ];

    modules.forEach(m => {
      list.push({
        id: `module-${m.id}`,
        category: 'modules',
        title: language === 'hi' ? m.nameHi : m.nameEn,
        subtitle: language === 'hi' ? m.nameEn : m.nameHi,
        icon: m.icon,
        action: () => {
          onNavigateTab(m.id);
          onClose();
        }
      });
    });

    // 3. Students
    students.slice(0, 50).forEach(s => {
      list.push({
        id: `student-${s.id}`,
        category: 'students',
        title: s.name,
        subtitle: `Class ${s.classNumber || 5}-${s.sectionName || 'A'} • Roll #${s.rollNumber || s.rollNo || '-'} • Adm: ${s.admissionNumber || s.id.slice(0, 6)}`,
        badge: s.status === 'active' ? 'Active' : 'Inactive',
        icon: GraduationCap,
        action: () => {
          onNavigateTab('students');
          onClose();
        }
      });
    });

    // 4. Teachers
    teachers.forEach(t => {
      list.push({
        id: `teacher-${t.id}`,
        category: 'teachers',
        title: t.name,
        subtitle: `${t.designation || 'Teacher'} • ${t.subjectSpecialization || 'General'} • ${t.phone || t.email || ''}`,
        badge: t.status === 'active' ? 'Verified' : 'Pending',
        icon: Users,
        action: () => {
          onNavigateTab('teachers');
          onClose();
        }
      });
    });

    // 5. Notices
    notices.slice(0, 15).forEach(n => {
      list.push({
        id: `notice-${n.id}`,
        category: 'notices',
        title: n.title,
        subtitle: `${n.category || 'General'} • ${n.date || 'Notice'}`,
        badge: n.priority === 'urgent' ? 'Urgent' : 'Notice',
        icon: Bell,
        action: () => {
          onNavigateTab('notices');
          onClose();
        }
      });
    });

    return list;
  }, [students, teachers, notices, registrationRequests, language, onNavigateTab, onClose]);

  // Filter items based on query
  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // When empty, show quick actions + first few modules
      return items.filter(it => it.category === 'quick_actions' || it.category === 'modules').slice(0, 12);
    }

    return items.filter(it => 
      it.title.toLowerCase().includes(q) ||
      (it.subtitle && it.subtitle.toLowerCase().includes(q))
    ).slice(0, 20);
  }, [items, query]);

  // Handle keyboard navigation
  const handleKeyDownInput = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
      }
    }
  };

  // Auto scroll list item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 md:p-12 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-[#0F172A]/75 backdrop-blur-sm transition-opacity duration-150 ease-out" 
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all mt-4 sm:mt-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder={language === 'hi' ? 'खोजें: छात्र, शिक्षक, उपस्थिति, अंक, परिपत्र, सेटिंग्स...' : 'Type a command, student name, roll no, teacher, or module...'}
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 font-medium focus:outline-hidden"
          />

          {query ? (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-slate-200/80 rounded border border-slate-300">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto p-2 space-y-1 custom-scrollbar divide-y divide-slate-100/50"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">
                {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No matching items found'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {language === 'hi' ? 'कृपया अन्य कीवर्ड या नाम से खोजें' : 'Try searching for student names, roll numbers, or ERP tabs'}
              </p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={item.id}
                  data-index={index}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className={`text-[11px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold shadow-2xs">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold shadow-2xs">↓</kbd>
              <span>Navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[10px] font-bold shadow-2xs">↵</kbd>
              <span>Select</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-[10px] font-bold">
              Ctrl + K
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
