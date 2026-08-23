import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  CalendarCheck2, 
  Award, 
  BookOpenCheck, 
  Bell
} from 'lucide-react';
import { AdminAttendance } from '../AdminAttendance';
import { AdminExaminations } from '../AdminExaminations';
import { AdminHomework } from '../AdminHomework';
import { AdminNotices } from '../AdminNotices';

export type OperationsSubTab = 'attendance' | 'examinations' | 'homework' | 'notices';

interface AdminOperationsHubProps {
  initialSubTab?: OperationsSubTab;
  onNavigateTab?: (tabId: string) => void;
}

export const AdminOperationsHub: React.FC<AdminOperationsHubProps> = ({
  initialSubTab = 'attendance',
  onNavigateTab
}) => {
  const { language, attendance, notices, homeworkList, examinations } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const activeNoticesCount = notices.filter(n => n.status === 'active').length;

  const subTabs = [
    {
      id: 'attendance' as OperationsSubTab,
      labelEn: 'Daily Attendance Register',
      labelHi: 'दैनिक उपस्थिति पंजिका',
      icon: CalendarCheck2
    },
    {
      id: 'examinations' as OperationsSubTab,
      labelEn: 'Exams & Marks Gradebook',
      labelHi: 'परीक्षा एवं प्रगति पत्र',
      icon: Award,
      badge: examinations.length > 0 ? `${examinations.length} Exams` : undefined
    },
    {
      id: 'homework' as OperationsSubTab,
      labelEn: 'Homework & Broadcasts',
      labelHi: 'गृहकार्य एवं कार्य',
      icon: BookOpenCheck,
      badge: homeworkList.length > 0 ? `${homeworkList.length}` : undefined
    },
    {
      id: 'notices' as OperationsSubTab,
      labelEn: 'Circulars & Official Notices',
      labelHi: 'शासनादेश एवं सूचना पट्ट',
      icon: Bell,
      badge: activeNoticesCount > 0 ? `${activeNoticesCount} Active` : undefined
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hub Master Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0 shadow-xs">
              <CalendarCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                  {language === 'hi' ? 'दैनिक संचालन हब' : 'Operations Hub'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'दैनिक उपस्थिति, परीक्षा, गृहकार्य एवं सूचनाएं' : 'Daily Logs, Exams & Circulars'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'hi' ? 'दैनिक संचालन एवं मूल्यांकन' : 'Daily Operations & Evaluation'}
              </h2>
            </div>
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
        {activeSubTab === 'attendance' && <AdminAttendance />}
        {activeSubTab === 'examinations' && <AdminExaminations />}
        {activeSubTab === 'homework' && <AdminHomework />}
        {activeSubTab === 'notices' && <AdminNotices />}
      </div>
    </div>
  );
};
