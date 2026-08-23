import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  History 
} from 'lucide-react';
import { AdminSettings } from '../AdminSettings';
import { AdminUsers } from '../AdminUsers';
import { AdminReports } from '../AdminReports';
import { AdminAuditLogs } from '../AdminAuditLogs';

export type GovernanceSubTab = 'settings' | 'users' | 'reports' | 'audit';

interface AdminGovernanceHubProps {
  initialSubTab?: GovernanceSubTab;
  onNavigateTab?: (tabId: string) => void;
}

export const AdminGovernanceHub: React.FC<AdminGovernanceHubProps> = ({
  initialSubTab = 'settings',
  onNavigateTab
}) => {
  const { language, auditLogs } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<GovernanceSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const subTabs = [
    {
      id: 'settings' as GovernanceSubTab,
      labelEn: 'School ERP Settings',
      labelHi: 'विद्यालय सिस्टम सेटिंग्स',
      icon: Settings
    },
    {
      id: 'users' as GovernanceSubTab,
      labelEn: 'User Logins & Access',
      labelHi: 'उपयोगकर्ता व सुरक्षा',
      icon: ShieldCheck
    },
    {
      id: 'reports' as GovernanceSubTab,
      labelEn: 'MIS Analytics & Reports',
      labelHi: 'प्रशासनिक विश्लेषण व रिपोर्ट',
      icon: TrendingUp
    },
    {
      id: 'audit' as GovernanceSubTab,
      labelEn: 'Security Audit Trail',
      labelHi: 'सुरक्षा ऑडिट लॉग',
      icon: History,
      badge: `${auditLogs.length}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hub Master Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0 shadow-xs">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-100">
                  {language === 'hi' ? 'प्रशासन व सेटिंग्स' : 'Governance & Settings'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'सिस्टम कॉन्फ़िगरेशन, उपयोगकर्ता एवं सुरक्षा लॉग' : 'Configuration, Security & Analytics'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'hi' ? 'प्रशासन, सेटिंग्स एवं सुरक्षा' : 'Governance, Settings & Security'}
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
        {activeSubTab === 'settings' && <AdminSettings />}
        {activeSubTab === 'users' && <AdminUsers />}
        {activeSubTab === 'reports' && <AdminReports />}
        {activeSubTab === 'audit' && <AdminAuditLogs />}
      </div>
    </div>
  );
};
