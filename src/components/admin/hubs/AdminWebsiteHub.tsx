import React, { useState, useEffect } from 'react';
import { useSchool } from '../../../context/SchoolContext';
import { 
  Sparkles, 
  Video, 
  Image as ImageIcon, 
  Building2, 
  Wrench, 
  Gift, 
  GraduationCap, 
  Phone,
  Radio
} from 'lucide-react';
import { AdminHomepage } from '../AdminHomepage';
import { AdminNoticeTicker } from '../AdminNoticeTicker';
import { AdminEducationalVideos } from '../AdminEducationalVideos';
import { AdminMediaLibrary } from '../AdminMediaLibrary';
import { AdminSchoolProfile } from '../AdminSchoolProfile';
import { AdminFacilities } from '../AdminFacilities';
import { AdminSchemes } from '../AdminSchemes';
import { AdminAdmission } from '../AdminAdmission';
import { AdminContact } from '../AdminContact';

export type WebsiteSubTab = 
  | 'homepage-mgmt' 
  | 'notice-ticker'
  | 'educational-videos' 
  | 'media-library' 
  | 'school-profile' 
  | 'facilities-mgmt' 
  | 'schemes-mgmt' 
  | 'admission-mgmt' 
  | 'contact-mgmt';

interface AdminWebsiteHubProps {
  initialSubTab?: WebsiteSubTab;
  onNavigateTab?: (tabId: string) => void;
}

export const AdminWebsiteHub: React.FC<AdminWebsiteHubProps> = ({
  initialSubTab = 'homepage-mgmt',
  onNavigateTab
}) => {
  const { language } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<WebsiteSubTab>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const subTabs = [
    {
      id: 'homepage-mgmt' as WebsiteSubTab,
      labelEn: 'Homepage & Banners',
      labelHi: 'मुख्य पृष्ठ प्रबंधन',
      icon: Sparkles
    },
    {
      id: 'notice-ticker' as WebsiteSubTab,
      labelEn: 'Notice Ticker & Flash Alerts',
      labelHi: 'लाइव सूचना टिकर',
      icon: Radio,
      badge: 'Live'
    },
    {
      id: 'educational-videos' as WebsiteSubTab,
      labelEn: 'Educational Videos',
      labelHi: 'कक्षा 1-8 प्रेरक वीडियो',
      icon: Video,
      badge: 'Class 1-8'
    },
    {
      id: 'media-library' as WebsiteSubTab,
      labelEn: 'Photo & Video Gallery',
      labelHi: 'चित्र व वीडियो गैलरी',
      icon: ImageIcon
    },
    {
      id: 'school-profile' as WebsiteSubTab,
      labelEn: 'School Profile & UDISE',
      labelHi: 'विद्यालय विवरण व UDISE',
      icon: Building2
    },
    {
      id: 'facilities-mgmt' as WebsiteSubTab,
      labelEn: 'Campus & Facilities',
      labelHi: 'भौतिक सुविधाएं',
      icon: Wrench
    },
    {
      id: 'schemes-mgmt' as WebsiteSubTab,
      labelEn: 'Govt Schemes & MDM',
      labelHi: 'योजनाएं व मिड-डे मील',
      icon: Gift
    },
    {
      id: 'admission-mgmt' as WebsiteSubTab,
      labelEn: 'Admission Policy',
      labelHi: 'प्रवेश नियम व नीतियां',
      icon: GraduationCap
    },
    {
      id: 'contact-mgmt' as WebsiteSubTab,
      labelEn: 'Contact, Timings & Map',
      labelHi: 'संपर्क, समय व मैप',
      icon: Phone
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hub Master Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  {language === 'hi' ? 'वेबसाइट सीएमएस' : 'Website CMS Hub'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-500 font-semibold">
                  {language === 'hi' ? 'जनसंचार, गैलरी, सुविधाएं एवं शासकीय योजनाएं' : 'Public Portal & Media Archives'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {language === 'hi' ? 'वेबसाइट एवं जनसंचार पोर्टल' : 'Public Website & Media CMS'}
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
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
        {activeSubTab === 'homepage-mgmt' && <AdminHomepage />}
        {activeSubTab === 'notice-ticker' && <AdminNoticeTicker />}
        {activeSubTab === 'educational-videos' && <AdminEducationalVideos />}
        {activeSubTab === 'media-library' && <AdminMediaLibrary />}
        {activeSubTab === 'school-profile' && <AdminSchoolProfile />}
        {activeSubTab === 'facilities-mgmt' && <AdminFacilities />}
        {activeSubTab === 'schemes-mgmt' && <AdminSchemes />}
        {activeSubTab === 'admission-mgmt' && <AdminAdmission />}
        {activeSubTab === 'contact-mgmt' && <AdminContact />}
      </div>
    </div>
  );
};
