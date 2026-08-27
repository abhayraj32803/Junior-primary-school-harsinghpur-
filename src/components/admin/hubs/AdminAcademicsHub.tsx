import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  GraduationCap, 
  Layers, 
  BookOpen, 
  Clock, 
  FileText,
  Award
} from 'lucide-react';
import { AdminStudents } from '../AdminStudents';
import { AdminClassesSections } from '../AdminClassesSections';
import { AdminSubjects } from '../AdminSubjects';
import { AdminTimetable } from '../AdminTimetable';
import { AdminDocuments } from '../AdminDocuments';
import { AdminBulkPromotion } from '../AdminBulkPromotion';
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';
import { HubViewSkeleton } from '../../common/SkeletonLoading';

export type AcademicsSubTab = 'students' | 'promotion' | 'classes' | 'subjects' | 'timetable' | 'documents';

interface AdminAcademicsHubProps {
  initialSubTab?: AcademicsSubTab;
  onNavigateTab?: (tabId: string) => void;
  isLoading?: boolean;
}

export const AdminAcademicsHub: React.FC<AdminAcademicsHubProps> = ({
  initialSubTab = 'students',
  onNavigateTab,
  isLoading = false
}) => {
  const { language, students, classes, subjects, loading } = useSchool();
  const { registrationRequests } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AcademicsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  if (loading || isLoading) {
    return <HubViewSkeleton subTabCount={6} type="table" />;
  }

  const pendingStudentRequestsCount = registrationRequests.filter(
    r => r.requestedRole === 'student' && r.status === 'PENDING'
  ).length;

  const subTabs: TabItem<AcademicsSubTab>[] = [
    {
      id: 'students',
      label: language === 'hi' ? 'छात्र नामांकन व पंजिका' : 'Student Directory',
      icon: GraduationCap,
      badge: pendingStudentRequestsCount > 0 ? `${students.length} (${pendingStudentRequestsCount} New)` : `${students.length}`
    },
    {
      id: 'promotion',
      label: language === 'hi' ? 'बल्क पदोन्नति व सत्र परिवर्तन' : 'Bulk Promotion & Rollover',
      icon: Award,
      badge: 'New'
    },
    {
      id: 'classes',
      label: language === 'hi' ? 'कक्षाएं एवं वर्ग' : 'Classes & Sections',
      icon: Layers,
      badge: `${classes.length}`
    },
    {
      id: 'subjects',
      label: language === 'hi' ? 'विषय एवं पाठ्यक्रम' : 'Curriculum & Subjects',
      icon: BookOpen,
      badge: `${subjects.length}`
    },
    {
      id: 'timetable',
      label: language === 'hi' ? 'मास्टर समय-सारिणी' : 'Master Timetable',
      icon: Clock
    },
    {
      id: 'documents',
      label: language === 'hi' ? 'प्रमाणपत्र व टीसी लॉकर' : 'Certificates & TC Vault',
      icon: FileText
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hub Page Header */}
      <AdminPageHeader
        badge={language === 'hi' ? 'एकेडमिक हब' : 'Academic Hub'}
        badgeVariant="indigo"
        title={language === 'hi' ? 'छात्र एवं शैक्षणिक प्रबंधन' : 'Students & Academics'}
        description={language === 'hi' ? 'कक्षा 1 से 8 तक छात्र पंजिका, कक्षाएं, विषय, समय-सारिणी एवं टीसी लॉकर।' : 'Manage student enrollment, class allocations, subjects curriculum, master timetable and transfer certificates.'}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
            {students.length} {language === 'hi' ? 'कुल छात्र' : 'Total Students'}
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
            {classes.length} {language === 'hi' ? 'कक्षाएं' : 'Classes'}
          </span>
        </div>
      </AdminPageHeader>

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <AdminTabNav<AcademicsSubTab>
          tabs={subTabs}
          activeTab={activeSubTab}
          onChangeTab={setActiveSubTab}
        />
      </div>

      {/* Sub Tab Content */}
      <div className="pt-1">
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
