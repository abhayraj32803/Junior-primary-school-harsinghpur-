import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Clock, 
  FileText,
  Sparkles,
  ArrowLeft,
  Award,
  RefreshCw
} from 'lucide-react';
import { AdminStudents } from '../AdminStudents';
import { AdminClassesSections } from '../AdminClassesSections';
import { AdminSubjects } from '../AdminSubjects';
import { AdminTimetable } from '../AdminTimetable';
import { AdminDocuments } from '../AdminDocuments';
import { AdminBulkPromotion } from '../AdminBulkPromotion';

export type AcademicsSubTab = 'students' | 'promotion' | 'classes' | 'subjects' | 'timetable' | 'documents';

interface AdminAcademicsHubProps {
  initialSubTab?: AcademicsSubTab;
  onNavigateTab?: (tabId: string) => void;
}

export const AdminAcademicsHub: React.FC<AdminAcademicsHubProps> = ({
  initialSubTab = 'students',
  onNavigateTab
}) => {
  const { language, students, classes, subjects } = useSchool();
  const { registrationRequests } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AcademicsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const pendingStudentRequestsCount = registrationRequests.filter(
    r => r.requestedRole === 'student' && r.status === 'PENDING'
  ).length;

  const subTabs = [
    {
      id: 'students' as AcademicsSubTab,
      labelEn: 'Student Directory & Admissions',
      labelHi: 'छात्र नामांकन व पंजिका',
      icon: GraduationCap,
      badge: pendingStudentRequestsCount > 0 ? `${students.length} (${pendingStudentRequestsCount} New)` : `${students.length}`
    },
    {
      id: 'promotion' as AcademicsSubTab,
      labelEn: 'Bulk Promotion & Rollover',
      labelHi: 'बल्क पदोन्नति व सत्र परिवर्तन',
      icon: Award,
      badge: 'New'
    },
    {
      id: 'classes' as AcademicsSubTab,
      labelEn: 'Classes & Sections',
      labelHi: 'कक्षाएं एवं वर्ग',
      icon: Layers,
      badge: `${classes.length} Classes`
    },
    {
      id: 'subjects' as AcademicsSubTab,
      labelEn: 'Curriculum & Subjects',
      labelHi: 'विषय एवं पाठ्यक्रम',
      icon: BookOpen,
      badge: `${subjects.length}`
    },
    {
      id: 'timetable' as AcademicsSubTab,
      labelEn: 'Master Timetable',
      labelHi: 'मास्टर समय-सारिणी',
      icon: Clock
    },
    {
      id: 'documents' as AcademicsSubTab,
      labelEn: 'Certificates & TC Vault',
      labelHi: 'प्रमाणपत्र व टीसी लॉकर',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hub Master Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 shadow-xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {language === 'hi' ? 'एकेडमिक हब' : 'Academic Hub'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'कक्षा 1 से 8 तक संपूर्ण प्रबंधन' : 'Class 1 to 8 Lifecycle'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'hi' ? 'छात्र एवं शैक्षणिक प्रबंधन' : 'Students & Academics Management'}
              </h2>
            </div>
          </div>

          {/* Hub Summary Chips */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold">
              {students.length} {language === 'hi' ? 'कुल छात्र' : 'Students'}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold">
              {classes.length} {language === 'hi' ? 'कक्षाएं' : 'Classes'}
            </span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-3 overflow-x-auto custom-scrollbar">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
                {tab.badge && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-module Container */}
      <div className="animate-in fade-in duration-150">
        {activeSubTab === 'students' && <AdminStudents />}
        {activeSubTab === 'promotion' && <AdminBulkPromotion />}
        {activeSubTab === 'classes' && <AdminClassesSections />}
        {activeSubTab === 'subjects' && <AdminSubjects />}
        {activeSubTab === 'timetable' && <AdminTimetable />}
        {activeSubTab === 'documents' && <AdminDocuments />}
      </div>
    </div>
  );
};
