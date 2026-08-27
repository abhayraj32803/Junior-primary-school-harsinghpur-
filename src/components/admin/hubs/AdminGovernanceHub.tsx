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
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';

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

  const subTabs: TabItem<GovernanceSubTab>[] = [
    {
      id: 'settings',
      label: language === 'hi' ? 'विद्यालय सिस्टम सेटिंग्स' : 'School ERP Settings',
      icon: Settings
    },
    {
      id: 'users',
      label: language === 'hi' ? 'उपयोगकर्ता व सुरक्षा' : 'User Logins & Security',
      icon: ShieldCheck
    },
    {
      id: 'reports',
      label: language === 'hi' ? 'प्रशासनिक विश्लेषण व रिपोर्ट' : 'MIS Reports & Analytics',
      icon: TrendingUp
    },
    {
      id: 'audit',
      label: language === 'hi' ? 'सुरक्षा ऑडिट लॉग' : 'Security Audit Trail',
      icon: History,
      badge: auditLogs.length > 0 ? `${auditLogs.length}` : undefined
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hub Page Header */}
      <AdminPageHeader
        badge={language === 'hi' ? 'प्रशासन व सुरक्षा' : 'Governance & Security'}
        badgeVariant="rose"
        title={language === 'hi' ? 'प्रशासन, रिपोर्ट्स व सेटिंग्स' : 'Governance, MIS & System Settings'}
        description={language === 'hi' ? 'विद्यालय संस्थागत सेटिंग्स, शिक्षक/छात्र लॉगिन नियंत्रण, एमआईएस विश्लेषण एवं पूर्ण ऑडिट ट्रेल लॉग।' : 'Configure school metadata, manage user login credentials & access, view MIS analytics and inspect the security audit trail.'}
      />

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <AdminTabNav<GovernanceSubTab>
          tabs={subTabs}
          activeTab={activeSubTab}
          onChangeTab={setActiveSubTab}
        />
      </div>

      {/* Sub Tab Content */}
      <div className="pt-1">
        {activeSubTab === 'settings' && <AdminSettings />}
        {activeSubTab === 'users' && <AdminUsers />}
        {activeSubTab === 'reports' && <AdminReports />}
        {activeSubTab === 'audit' && <AdminAuditLogs />}
      </div>
    </div>
  );
};
