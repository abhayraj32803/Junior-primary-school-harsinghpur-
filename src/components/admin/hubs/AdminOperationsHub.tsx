import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  CalendarCheck2, 
  Award, 
  BookOpenCheck, 
  Bell,
  Radio
} from 'lucide-react';
import { AdminAttendance } from '../AdminAttendance';
import { AdminExaminations } from '../AdminExaminations';
import { AdminHomework } from '../AdminHomework';
import { AdminNotices } from '../AdminNotices';
import { AdminNoticeTicker } from '../AdminNoticeTicker';
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';
import { HubViewSkeleton } from '../../common/SkeletonLoading';

export type OperationsSubTab = 'attendance' | 'examinations' | 'homework' | 'notices' | 'notice-ticker';

interface AdminOperationsHubProps {
  initialSubTab?: OperationsSubTab;
  onNavigateTab?: (tabId: string) => void;
  isLoading?: boolean;
}

export const AdminOperationsHub: React.FC<AdminOperationsHubProps> = ({
  initialSubTab = 'attendance',
  onNavigateTab,
  isLoading = false
}) => {
  const { language, notices, homeworkList, examinations, loading } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  if (loading || isLoading) {
    return <HubViewSkeleton subTabCount={5} type="table" />;
  }

  const activeNoticesCount = notices.filter(n => n.status === 'active').length;

  const subTabs: TabItem<OperationsSubTab>[] = [
    {
      id: 'attendance',
      label: language === 'hi' ? 'दैनिक उपस्थिति पंजिका' : 'Daily Attendance Register',
      icon: CalendarCheck2
    },
    {
      id: 'examinations',
      label: language === 'hi' ? 'परीक्षा एवं प्रगति पत्र' : 'Exams & Gradebook',
      icon: Award,
      badge: examinations.length > 0 ? `${examinations.length}` : undefined
    },
    {
      id: 'homework',
      label: language === 'hi' ? 'गृहकार्य एवं कार्य' : 'Homework & Broadcasts',
      icon: BookOpenCheck,
      badge: homeworkList.length > 0 ? `${homeworkList.length}` : undefined
    },
    {
      id: 'notices',
      label: language === 'hi' ? 'शासनादेश एवं सूचना पट्ट' : 'Circulars & Notices',
      icon: Bell,
      badge: activeNoticesCount > 0 ? `${activeNoticesCount} Active` : undefined
    },
    {
      id: 'notice-ticker',
      label: language === 'hi' ? 'लाइव सूचना टिकर व अलर्ट' : 'Live Notice Ticker',
      icon: Radio,
      badge: 'Live'
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hub Page Header */}
      <AdminPageHeader
        badge={language === 'hi' ? 'संचालन हब' : 'Operations Hub'}
        badgeVariant="indigo"
        title={language === 'hi' ? 'दैनिक संचालन एवं मूल्यांकन' : 'Daily Operations & Evaluation'}
        description={language === 'hi' ? 'दैनिक छात्र उपस्थिति, अर्धवार्षिक/वार्षिक परीक्षा प्राप्तांक, दैनिक गृहकार्य एवं शासकीय परिपत्र प्रबंधन।' : 'Record daily student attendance, compile examination marks & gradecards, distribute homework and broadcast notices.'}
      />

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <AdminTabNav<OperationsSubTab>
          tabs={subTabs}
          activeTab={activeSubTab}
          onChangeTab={setActiveSubTab}
        />
      </div>

      {/* Sub Tab Content */}
      <div className="pt-1">
        {activeSubTab === 'attendance' && <AdminAttendance />}
        {activeSubTab === 'examinations' && <AdminExaminations />}
        {activeSubTab === 'homework' && <AdminHomework />}
        {activeSubTab === 'notices' && <AdminNotices />}
        {activeSubTab === 'notice-ticker' && <AdminNoticeTicker />}
      </div>
    </div>
  );
};
