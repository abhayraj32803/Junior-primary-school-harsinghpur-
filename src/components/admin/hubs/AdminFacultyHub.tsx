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

export type FacultySubTab = 'teachers' | 'assignments' | 'profile';

interface AdminFacultyHubProps {
  initialSubTab?: FacultySubTab;
  onNavigateTab?: (tabId: string) => void;
}

export const AdminFacultyHub: React.FC<AdminFacultyHubProps> = ({
  initialSubTab = 'teachers',
  onNavigateTab
}) => {
  const { language, teachers } = useSchool();
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

  const subTabs = [
    {
      id: 'teachers' as FacultySubTab,
      labelEn: 'Faculty Directory & Approvals',
      labelHi: 'शिक्षक पंजिका व ऑनलाइन अनुमोदन',
      icon: Users,
      badge: pendingTeacherRequestsCount > 0 ? `${pendingTeacherRequestsCount} Pending` : `${teachers.length}`
    },
    {
      id: 'assignments' as FacultySubTab,
      labelEn: 'Subject & Class Allocation',
      labelHi: 'शिक्षक कार्य आवंटन',
      icon: UserCheck
    },
    {
      id: 'profile' as FacultySubTab,
      labelEn: 'Headmaster Directorate Record',
      labelHi: 'प्रधानाध्यापिका आधिकारिक रिकॉर्ड',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hub Master Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 shadow-xs">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {language === 'hi' ? 'शिक्षक हब' : 'Faculty Hub'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'मानव संपदा एवं कार्यभार प्रबंधन' : 'Faculty & Staff Directory'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'hi' ? 'शिक्षक एवं कार्मिक प्रबंधन' : 'Faculty & Staff Management'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold">
              {teachers.length} {language === 'hi' ? 'कुल शिक्षक/स्टाफ' : 'Faculty Members'}
            </span>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 pt-3 overflow-x-auto custom-scrollbar pb-1">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 touch-manipulation active:scale-[0.98] ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 active:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
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
        {activeSubTab === 'teachers' && <AdminTeachers />}
        {activeSubTab === 'assignments' && <AdminTeacherAssignments />}
        {activeSubTab === 'profile' && <AdminProfile onNavigateTab={onNavigateTab} />}
      </div>
    </div>
  );
};
