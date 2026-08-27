import React, { useState, useEffect, useMemo } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { useAuth } from '../../../context/AuthContext';
import { 
  Users, 
  UserCheck, 
  ShieldCheck
} from 'lucide-react';
import { AdminTeachers } from '../AdminTeachers';
import { AdminTeacherAssignments } from '../AdminTeacherAssignments';
import { AdminProfile } from '../AdminProfile';
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';
import { HubViewSkeleton } from '../../common/SkeletonLoading';

export type FacultySubTab = 'teachers' | 'assignments' | 'profile';

interface AdminFacultyHubProps {
  initialSubTab?: FacultySubTab;
  onNavigateTab?: (tabId: string) => void;
  isLoading?: boolean;
}

export const AdminFacultyHub: React.FC<AdminFacultyHubProps> = ({
  initialSubTab = 'teachers',
  onNavigateTab,
  isLoading = false
}) => {
  const { language, teachers, loading } = useSchool();
  const { registrationRequests } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<FacultySubTab>(initialSubTab);

  const pendingTeacherRequestsCount = useMemo(() => {
    return registrationRequests.filter(r => r.requestedRole === 'teacher' && r.status === 'PENDING').length;
  }, [registrationRequests]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  if (loading || isLoading) {
    return <HubViewSkeleton subTabCount={3} type="table" />;
  }

  const subTabs: TabItem<FacultySubTab>[] = [
    {
      id: 'teachers',
      label: language === 'hi' ? 'शिक्षक पंजिका व अनुमोदन' : 'Faculty Directory & Approvals',
      icon: Users,
      badge: pendingTeacherRequestsCount > 0 ? `${pendingTeacherRequestsCount} Pending` : `${teachers.length}`
    },
    {
      id: 'assignments',
      label: language === 'hi' ? 'शिक्षक कार्य आवंटन' : 'Subject & Class Allocation',
      icon: UserCheck
    },
    {
      id: 'profile',
      label: language === 'hi' ? 'प्रधानाध्यापिका आधिकारिक रिकॉर्ड' : 'Headmaster Directorate Record',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hub Page Header */}
      <AdminPageHeader
        badge={language === 'hi' ? 'शिक्षक हब' : 'Faculty Hub'}
        badgeVariant="emerald"
        title={language === 'hi' ? 'शिक्षक एवं कार्मिक प्रबंधन' : 'Faculty & Staff Management'}
        description={language === 'hi' ? 'शिक्षक पंजिका, ऑनलाइन पंजीकरण अनुमोदन, विषय-कक्षा आवंटन एवं हेडमास्टर सेवा रिकॉर्ड।' : 'Manage teacher service records, review online registrations, allocate subjects/classes and edit Directorate profile.'}
      >
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold shadow-xs">
            {teachers.length} {language === 'hi' ? 'कुल शिक्षक/स्टाफ' : 'Faculty Members'}
          </span>
        </div>
      </AdminPageHeader>

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <AdminTabNav<FacultySubTab>
          tabs={subTabs}
          activeTab={activeSubTab}
          onChangeTab={setActiveSubTab}
        />
      </div>

      {/* Sub Tab Content */}
      <div className="pt-1">
        {activeSubTab === 'teachers' && <AdminTeachers />}
        {activeSubTab === 'assignments' && <AdminTeacherAssignments />}
        {activeSubTab === 'profile' && <AdminProfile />}
      </div>
    </div>
  );
};
