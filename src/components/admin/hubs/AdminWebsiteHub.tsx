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
  Radio,
  Palette,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Clock
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
import { AdminTimingsCalendar } from '../AdminTimingsCalendar';
import { AdminPageHeader } from '../ui/AdminPageHeader';
import { AdminTabNav, TabItem } from '../ui/AdminTabNav';
import { HubViewSkeleton } from '../../common/SkeletonLoading';

export type WebsiteSubTab = 
  | 'homepage-mgmt' 
  | 'notice-ticker'
  | 'timings-calendar-mgmt'
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
  isLoading?: boolean;
}

export const AdminWebsiteHub: React.FC<AdminWebsiteHubProps> = ({
  initialSubTab = 'homepage-mgmt',
  onNavigateTab,
  isLoading = false
}) => {
  const { language, settings, updateSchoolSettingsWithAudit, userProfile, loading } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<WebsiteSubTab>(initialSubTab);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [themeSuccessMessage, setThemeSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  if (loading || isLoading) {
    return <HubViewSkeleton subTabCount={8} type="cards" />;
  }

  const handleApplyThemePalette = async (paletteType: 'government_professional' | 'tricolor_vibrant' | 'royal_navy' = 'government_professional') => {
    setIsApplyingTheme(true);
    try {
      if (paletteType === 'government_professional') {
        await updateSchoolSettingsWithAudit(
          {
            themePalette: 'government_professional',
            heroBannerTextColor: 'light',
            heroBannerOverlayOpacity: 65,
            heroBannerLayout: 'panoramic_header',
            heroBannerCtaEnabled: true,
            heroBannerCtaTextHi: 'नि:शुल्क प्रवेश 2026-27',
            heroBannerCtaTextEn: 'Free Admission 2026-27',
            heroBannerCtaLink: 'admission',
            heroBannerCtaIcon: 'GraduationCap',
            heroBannerSecondaryCtaEnabled: true,
            heroBannerSecondaryCtaTextHi: 'डीबीटी व योजनाएं',
            heroBannerSecondaryCtaTextEn: 'Govt Schemes & DBT',
            heroBannerSecondaryCtaLink: 'schemes',
            heroBannerSecondaryCtaIcon: 'Gift',
            noticeTicker: {
              ...(settings.noticeTicker || {
                enabled: true,
                speed: 'medium',
                pauseOnHover: true,
                mode: 'combined',
                headerLabelEn: 'Flash Updates',
                headerLabelHi: 'नवीनतम सूचना व अलर्ट',
                customAlerts: []
              }),
              enabled: true,
              themeStyle: 'navy_classic'
            }
          },
          {
            field: 'Portal Theme & Branding Palette',
            previousValue: settings.themePalette || 'Default Palette',
            newValue: 'Government Professional (Ashoka Navy Blue Headers, Saffron Accents, Clean White Background)',
            source: 'Admin Website Hub (One-Click Theme Apply)',
            status: 'VERIFIED_CURRENT',
            notes: `Applied cohesive Government Professional Theme palette by ${userProfile?.name || 'Administrator'} (Navy Blue #00004d / #000080, Saffron #FF9933 accents, and crisp White background).`
          }
        );
        setThemeSuccessMessage(
          language === 'hi'
            ? '✓ शासकीय प्रोफेशनल थीम सफलतापूर्वक लागू हो गई है! (नेवी ब्लू हेडर, केसरिया बटन एक्सेंट व स्वच्छ श्वेत बैकग्राउंड)'
            : '✓ Government Professional Theme applied successfully! (Navy Blue headers, Saffron button accents & clean White background)'
        );
      } else if (paletteType === 'tricolor_vibrant') {
        await updateSchoolSettingsWithAudit(
          {
            themePalette: 'tricolor_vibrant',
            heroBannerTextColor: 'light',
            heroBannerOverlayOpacity: 60,
            noticeTicker: {
              ...(settings.noticeTicker || {
                enabled: true,
                speed: 'medium',
                pauseOnHover: true,
                mode: 'combined',
                headerLabelEn: 'Flash Updates',
                headerLabelHi: 'नवीनतम सूचना व अलर्ट',
                customAlerts: []
              }),
              enabled: true,
              themeStyle: 'amber_gold'
            }
          },
          {
            field: 'Portal Theme Palette',
            previousValue: settings.themePalette || 'Standard',
            newValue: 'Tricolor Vibrant Theme',
            source: 'Admin Website Hub',
            status: 'VERIFIED_CURRENT',
            notes: `Applied Tricolor Vibrant theme by ${userProfile?.name || 'Admin'}`
          }
        );
        setThemeSuccessMessage(
          language === 'hi'
            ? '✓ तिरंगा गौरव थीम सफलतापूर्वक लागू हो गई है!'
            : '✓ Tricolor Vibrant Theme applied successfully!'
        );
      } else {
        await updateSchoolSettingsWithAudit(
          {
            themePalette: 'royal_navy',
            heroBannerTextColor: 'light',
            heroBannerOverlayOpacity: 65,
            noticeTicker: {
              ...(settings.noticeTicker || {
                enabled: true,
                speed: 'medium',
                pauseOnHover: true,
                mode: 'combined',
                headerLabelEn: 'Flash Updates',
                headerLabelHi: 'नवीनतम सूचना व अलर्ट',
                customAlerts: []
              }),
              enabled: true,
              themeStyle: 'emerald_green'
            }
          },
          {
            field: 'Portal Theme Palette',
            previousValue: settings.themePalette || 'Standard',
            newValue: 'Royal Navy Tech Theme',
            source: 'Admin Website Hub',
            status: 'VERIFIED_CURRENT',
            notes: `Applied Royal Navy theme by ${userProfile?.name || 'Admin'}`
          }
        );
        setThemeSuccessMessage(
          language === 'hi'
            ? '✓ रॉयल नेवी डिजिटल थीम लागू हो गई है!'
            : '✓ Royal Navy Tech Theme applied successfully!'
        );
      }

      setTimeout(() => {
        setThemeSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Failed to apply theme:', err);
    } finally {
      setIsApplyingTheme(false);
    }
  };

  const currentTheme = settings.themePalette || 'government_professional';

  const subTabs: TabItem<WebsiteSubTab>[] = [
    {
      id: 'homepage-mgmt',
      label: language === 'hi' ? 'मुख्य पृष्ठ प्रबंधन' : 'Homepage & Banners',
      icon: Sparkles
    },
    {
      id: 'notice-ticker',
      label: language === 'hi' ? 'लाइव सूचना टिकर' : 'Notice Ticker & Alerts',
      icon: Radio,
      badge: 'Live'
    },
    {
      id: 'timings-calendar-mgmt',
      label: language === 'hi' ? 'विद्यालय समय व कैलेंडर' : 'Timings & Academic Calendar',
      icon: Clock,
      badge: 'Public'
    },
    {
      id: 'educational-videos',
      label: language === 'hi' ? 'कक्षा 1-8 प्रेरक वीडियो' : 'Educational Videos',
      icon: Video,
      badge: 'Class 1-8'
    },
    {
      id: 'media-library',
      label: language === 'hi' ? 'चित्र व वीडियो गैलरी' : 'Photo & Video Gallery',
      icon: ImageIcon
    },
    {
      id: 'school-profile',
      label: language === 'hi' ? 'विद्यालय विवरण व UDISE' : 'School Profile & UDISE',
      icon: Building2
    },
    {
      id: 'facilities-mgmt',
      label: language === 'hi' ? 'भौतिक सुविधाएं' : 'Campus & Facilities',
      icon: Wrench
    },
    {
      id: 'schemes-mgmt',
      label: language === 'hi' ? 'योजनाएं व मिड-डे मील' : 'Govt Schemes & MDM',
      icon: Gift
    },
    {
      id: 'admission-mgmt',
      label: language === 'hi' ? 'प्रवेश नियम व नीतियां' : 'Admission Policy',
      icon: GraduationCap
    },
    {
      id: 'contact-mgmt',
      label: language === 'hi' ? 'संपर्क, समय व मैप' : 'Contact & Timings',
      icon: Phone
    }
  ];

  return (
    <div className="space-y-5">
      {/* Hub Page Header */}
      <AdminPageHeader
        badge={language === 'hi' ? 'वेबसाइट सीएमएस' : 'Website CMS'}
        badgeVariant="blue"
        title={language === 'hi' ? 'वेबसाइट एवं जनसंचार पोर्टल' : 'Public Website & Media CMS'}
        description={language === 'hi' ? 'मुख्य पृष्ठ, बैनर, प्रेरक वीडियो, फोटो गैलरी, सुविधाएं एवं शासकीय योजनाएं।' : 'Manage public portal content, hero banners, educational videos, media gallery and government schemes.'}
      >
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold shadow-xs flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme: {currentTheme === 'government_professional' ? 'Government Professional' : currentTheme === 'tricolor_vibrant' ? 'Tricolor Vibrant' : 'Royal Navy'}</span>
          </span>
        </div>
      </AdminPageHeader>

      {/* ONE-CLICK THEME APPLY HERO BANNER (Clean Enterprise Design) */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0F172A] text-white border border-slate-800 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                {language === 'hi' ? 'मानक शासकीय रंग योजना' : 'Official Government Palette'}
              </span>
              <span className="text-xs text-slate-400 font-mono">• 1-Click Apply</span>
            </div>
            
            <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
              {language === 'hi' ? 'गवर्नमेंट प्रोफेशनल थीम (Government Professional)' : 'Government Professional Theme'}
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {language === 'hi'
                ? 'अशोक नेवी ब्लू हेडर (#00004d), सूक्ष्म केसरिया/अंबर बटन एक्सेंट (#FF9933) एवं स्वच्छ श्वेत बैकग्राउंड (#FFFFFF) की एकीकृत थीम वेबसाइट पर एक क्लिक में लागू करें।'
                : 'Apply a cohesive palette across the website: Ashoka Navy Blue for headers, subtle Saffron accents for action buttons, and clean White backgrounds.'}
            </p>

            {/* Color Swatches */}
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00004d] border border-white/30" />
                <span>Navy Blue (#00004d)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] border border-white/30" />
                <span>Saffron Accent (#FF9933)</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-[#138808] border border-white/30" />
                <span>Green Badge (#138808)</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleApplyThemePalette('government_professional')}
              disabled={isApplyingTheme}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              id="btn-apply-gov-theme"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>
                {isApplyingTheme 
                  ? (language === 'hi' ? 'लागू हो रहा है...' : 'Applying Theme...') 
                  : (language === 'hi' ? 'शासकीय थीम लागू करें' : 'Apply Government Theme')}
              </span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {themeSuccessMessage && (
          <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{themeSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Sub Navigation Tabs */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs">
        <AdminTabNav<WebsiteSubTab>
          tabs={subTabs}
          activeTab={activeSubTab}
          onChangeTab={setActiveSubTab}
        />
      </div>

      {/* Active Sub-module Container */}
      <div className="pt-1">
        {activeSubTab === 'homepage-mgmt' && <AdminHomepage />}
        {activeSubTab === 'notice-ticker' && <AdminNoticeTicker />}
        {activeSubTab === 'timings-calendar-mgmt' && <AdminTimingsCalendar />}
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
