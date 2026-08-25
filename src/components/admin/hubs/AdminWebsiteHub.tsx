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
  Zap
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
  const { language, settings, updateSchoolSettingsWithAudit, userProfile } = useSchool();
  const [activeSubTab, setActiveSubTab] = useState<WebsiteSubTab>(initialSubTab);
  const [isApplyingTheme, setIsApplyingTheme] = useState(false);
  const [themeSuccessMessage, setThemeSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

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
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
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

          {/* Quick Active Theme Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900 text-white shadow-xs border border-slate-800">
              <Palette className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {language === 'hi' ? 'सक्रिय थीम' : 'Active Theme'}
                </div>
                <div className="text-xs font-black text-amber-300">
                  {currentTheme === 'government_professional' && (language === 'hi' ? 'शासकीय प्रोफेशनल (Govt Pro)' : 'Government Professional')}
                  {currentTheme === 'tricolor_vibrant' && (language === 'hi' ? 'तिरंगा गौरव (Tricolor)' : 'Tricolor Vibrant')}
                  {currentTheme === 'royal_navy' && (language === 'hi' ? 'रॉयल नेवी टेक (Royal Navy)' : 'Royal Navy Tech')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ONE-CLICK THEME APPLY HERO BANNER (Government Professional Standard) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-gov-navy-950 to-slate-950 text-white border border-slate-800 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 via-orange-500/5 to-transparent pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  {language === 'hi' ? 'मानक शासकीय रंग योजना' : 'Official Government Palette'}
                </span>
                <span className="text-xs text-slate-400 font-mono">• 1-Click Apply</span>
              </div>
              
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                {language === 'hi' ? 'गवर्नमेंट प्रोफेशनल थीम (Government Professional)' : 'Government Professional Theme'}
              </h3>
              
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {language === 'hi'
                  ? 'अशोक नेवी ब्लू हेडर (#00004d), सूक्ष्म केसरिया/अंबर बटन एक्सेंट (#FF9933) एवं स्वच्छ श्वेत बैकग्राउंड (#FFFFFF) की एकीकृत थीम वेबसाइट पर एक क्लिक में लागू करें।'
                  : 'Apply a cohesive palette across the website: Ashoka Navy Blue for headers, subtle Saffron accents for action buttons, and clean White backgrounds.'}
              </p>

              {/* Color Swatches */}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00004d] border border-white/30" />
                  <span>Navy Blue (#00004d)</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] border border-white/30" />
                  <span>Saffron Accent (#FF9933)</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#138808] border border-white/30" />
                  <span>Green Badge (#138808)</span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-slate-200">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-300" />
                  <span>Clean White (#FFFFFF)</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => handleApplyThemePalette('government_professional')}
                disabled={isApplyingTheme}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                id="btn-apply-gov-theme"
              >
                <Zap className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>
                  {isApplyingTheme 
                    ? (language === 'hi' ? 'लागू हो रहा है...' : 'Applying Theme...') 
                    : (language === 'hi' ? 'शासकीय थीम 1-क्लिक में लागू करें' : 'Apply Government Professional Theme')}
                </span>
              </button>
            </div>
          </div>

          {/* Success Toast */}
          {themeSuccessMessage && (
            <div className="mt-3.5 p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{themeSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto custom-scrollbar">
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
