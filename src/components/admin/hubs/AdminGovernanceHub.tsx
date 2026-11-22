import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  Settings, 
  ShieldCheck, 
  TrendingUp, 
  History,
  CreditCard,
  Key,
  Mail
} from 'lucide-react';
import { AdminSettings } from '../AdminSettings';
import { AdminUsers } from '../AdminUsers';
import { AdminReports } from '../AdminReports';
import { AdminAuditLogs } from '../AdminAuditLogs';
import { AdminDonations } from '../AdminDonations';
import { AdminCashfreeSettings } from '../settings/AdminCashfreeSettings';
import { AdminSmtpSettings } from '../settings/AdminSmtpSettings';
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';
import { HubViewSkeleton } from '../../common/SkeletonLoading';

export type GovernanceSubTab = 'settings' | 'cashfree-vault' | 'smtp-settings' | 'donations' | 'users' | 'reports' | 'audit';

interface AdminGovernanceHubProps {
  initialSubTab?: GovernanceSubTab;
  onNavigateTab?: (tabId: string) => void;
  isLoading?: boolean;
}

export const AdminGovernanceHub: React.FC<AdminGovernanceHubProps> = ({
  initialSubTab = 'settings',
  onNavigateTab,
  isLoading = false
}) => {
  const { language, auditLogs, donations, loading } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<GovernanceSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  if (loading || isLoading) {
    return <HubViewSkeleton subTabCount={7} type="table" />;
  }

  const subTabs: TabItem<GovernanceSubTab>[] = [
    {
      id: 'settings',
      label: language === 'hi' ? 'विद्यालय सिस्टम सेटिंग्स' : 'School ERP Settings',
      icon: Settings
    },
    {
      id: 'cashfree-vault',
      label: language === 'hi' ? 'Cashfree पेमेंट वॉल्ट' : 'Cashfree Gateway Vault',
      icon: Key
    },
    {
      id: 'smtp-settings',
      label: language === 'hi' ? 'SMTP ईमेल सर्वर' : 'SMTP Email Server',
      icon: Mail
    },
    {
      id: 'donations',
      label: language === 'hi' ? 'दान व उद्देश्य प्रबंधन' : 'Donations & Causes',
      icon: CreditCard,
      badge: donations.length > 0 ? `${donations.length}` : undefined
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
        title={language === 'hi' ? 'प्रशासन, दान प्रबंधन व सेटिंग्स' : 'Governance, Donations & System Settings'}
        description={language === 'hi' ? 'विद्यालय संस्थागत सेटिंग्स, Cashfree पेमेंट गेटवे, SMTP ईमेल सर्वर, कॉलेज दान उद्देश्य, शिक्षक/छात्र लॉगिन नियंत्रण एवं पूर्ण ऑडिट ट्रेल लॉग।' : 'Configure school metadata, manage Cashfree payment gateway & SMTP email server, control user access, and inspect the security audit trail.'}
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
        {activeSubTab === 'cashfree-vault' && <AdminCashfreeSettings />}
        {activeSubTab === 'smtp-settings' && <AdminSmtpSettings />}
        {activeSubTab === 'donations' && <AdminDonations onNavigateToVault={() => setActiveSubTab('cashfree-vault')} />}
        {activeSubTab === 'users' && <AdminUsers />}
        {activeSubTab === 'reports' && <AdminReports />}
        {activeSubTab === 'audit' && <AdminAuditLogs />}
      </div>
    </div>
  );
};
