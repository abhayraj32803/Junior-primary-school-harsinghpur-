import { 
  Activity, 
  School, 
  Bell, 
  Building2, 
  Sparkles, 
  Video, 
  Gift, 
  MapPin, 
  LucideIcon 
} from 'lucide-react';

export interface HomepageSectionDefinition {
  id: string;
  nameHi: string;
  nameEn: string;
  descHi: string;
  descEn: string;
  badgeHi: string;
  badgeEn: string;
  icon: LucideIcon;
  iconBg: string;
  defaultVisible: boolean;
}

export const HOMEPAGE_SECTIONS_REGISTRY: Record<string, HomepageSectionDefinition> = {
  heroStats: {
    id: 'heroStats',
    nameHi: 'विद्यालय मुख्य सांख्यिकी (Hero Metrics Strip)',
    nameEn: 'School Metrics Strip (4 Stat Cards)',
    descHi: 'UDISE कोड, नामांकित विद्यार्थी, कक्षा 1-8 व शिक्षक सांख्यिकी कार्ड्स',
    descEn: 'UDISE Code, Enrolled Students, Classes 1-8, and Certified Teachers Cards',
    badgeHi: '4 सांख्यिकी कार्ड्स',
    badgeEn: '4 Metric Cards',
    icon: Activity,
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-amber-500/25',
    defaultVisible: true,
  },
  principalMessage: {
    id: 'principalMessage',
    nameHi: 'विद्यालय परिचय (About Our School)',
    nameEn: 'About Our School Overview',
    descHi: 'बेसिक शिक्षा परिषद मान्यता, विद्यालय पृष्ठभूमि एवं विस्तृत परिचय',
    descEn: 'Basic Education Department UP accreditation, history & comprehensive overview',
    badgeHi: 'विद्यालय परिचय',
    badgeEn: 'Overview Block',
    icon: School,
    iconBg: 'bg-gradient-to-br from-slate-900 to-slate-800 text-amber-400 shadow-slate-900/25',
    defaultVisible: true,
  },
  noticeTicker: {
    id: 'noticeTicker',
    nameHi: 'महत्वपूर्ण सूचनाएं (Important Notices)',
    nameEn: 'Important Circulars & Notices',
    descHi: 'नवीनतम 4 शासकीय परिपत्र, प्रवेश, परीक्षा एवं शैक्षणिक सूचनाएं',
    descEn: 'Latest 4 official circulars, admissions, examination schedules & notices',
    badgeHi: '4 नवीनतम सूचनाएं',
    badgeEn: '4 Notice Cards',
    icon: Bell,
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/25',
    defaultVisible: true,
  },
  facilitiesPreview: {
    id: 'facilitiesPreview',
    nameHi: 'विद्यालय की सुविधाएं (6 सुविधा कार्ड्स)',
    nameEn: 'School Facilities (6 Interactive Cards)',
    descHi: 'पेयजल, खेल का मैदान, स्मार्ट क्लास, कंप्यूटर लैब, मध्याह्न भोजन आदि',
    descEn: 'Clean drinking water, playground, smart classes, computer lab & mid-day meal',
    badgeHi: '6 सुविधा कार्ड्स',
    badgeEn: '6 Facility Cards',
    icon: Building2,
    iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
    defaultVisible: true,
  },
  educationalVideos: {
    id: 'educationalVideos',
    nameHi: 'कक्षा 1-8 शैक्षिक एवं प्रेरक वीडियो (Educational Videos)',
    nameEn: 'Curriculum & Motivational Videos',
    descHi: 'निपुण भारत, गणित-विज्ञान प्रयोग, FLN व कलाम विचार प्रेरणादायक वीडियो ग्रिड',
    descEn: 'NIPUN Bharat, science experiments, FLN & inspiring educational video streams',
    badgeHi: 'कक्षा 1-8 वीडियो',
    badgeEn: 'Curriculum Videos',
    icon: Video,
    iconBg: 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-red-500/25',
    defaultVisible: true,
  },
  galleryPreview: {
    id: 'galleryPreview',
    nameHi: 'छात्र गतिविधियां एवं फोटो गैलरी (Activities & Gallery)',
    nameEn: 'Student Activities & Photo Gallery',
    descHi: 'सांस्कृतिक कार्यक्रम, खेलकूद, विज्ञान प्रदर्शनी एवं विद्यालय परिसर की 4 प्रमुख फोटो',
    descEn: 'Cultural events, sports, science fair & 4 featured campus photo highlights',
    badgeHi: 'गतिविधियां व गैलरी',
    badgeEn: 'Gallery & Events',
    icon: Sparkles,
    iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-purple-500/25',
    defaultVisible: true,
  },
  schemesPreview: {
    id: 'schemesPreview',
    nameHi: 'सरकारी योजनाएं व डीबीटी (Govt Schemes & DBT)',
    nameEn: 'Government Schemes & DBT Benefits',
    descHi: 'डीबीटी छात्रवृत्ति, मध्याह्न भोजन योजना (PM POSHAN), निःशुल्क पाठ्यपुस्तकें व यूनिफॉर्म',
    descEn: 'Direct Benefit Transfer, PM POSHAN mid-day meals, free uniforms & textbooks',
    badgeHi: 'डीबीटी योजनाएं',
    badgeEn: 'Govt Schemes',
    icon: Gift,
    iconBg: 'bg-gradient-to-br from-teal-600 to-cyan-600 text-white shadow-teal-500/25',
    defaultVisible: true,
  },
  officialLinks: {
    id: 'officialLinks',
    nameHi: 'संपर्क, समय-सारणी व शासकीय पोर्टल लिंक्स (Contact & Links)',
    nameEn: 'Contact, School Timings & Official Links',
    descHi: 'विद्यालय पता, फोन, ईमेल, गूगल मैप, ग्रीष्म/शीत समय-सारणी एवं प्रेरणा/दीक्षा लिंक्स',
    descEn: 'Official address, phone, email, live Google map, timings & state education portals',
    badgeHi: 'संपर्क व लिंक्स',
    badgeEn: 'Contact & Map',
    icon: MapPin,
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
    defaultVisible: true,
  },
};

export const DEFAULT_HOMEPAGE_SECTION_ORDER: string[] = [
  'heroStats',
  'principalMessage',
  'noticeTicker',
  'facilitiesPreview',
  'educationalVideos',
  'galleryPreview',
  'schemesPreview',
  'officialLinks',
];

export const DEFAULT_HOMEPAGE_VISIBILITY: Record<string, boolean> = {
  heroStats: true,
  principalMessage: true,
  noticeTicker: true,
  facilitiesPreview: true,
  educationalVideos: true,
  galleryPreview: true,
  schemesPreview: true,
  officialLinks: true,
};

export function getResolvedSectionOrder(savedOrder?: string[]): string[] {
  if (!savedOrder || !Array.isArray(savedOrder) || savedOrder.length === 0) {
    return [...DEFAULT_HOMEPAGE_SECTION_ORDER];
  }
  
  // Filter valid IDs and append any missing defaults at the end
  const validSaved = savedOrder.filter(id => id in HOMEPAGE_SECTIONS_REGISTRY);
  const missing = DEFAULT_HOMEPAGE_SECTION_ORDER.filter(id => !validSaved.includes(id));
  return [...validSaved, ...missing];
}

export function getResolvedSectionVisibility(savedVisibility?: Record<string, boolean>): Record<string, boolean> {
  const result: Record<string, boolean> = { ...DEFAULT_HOMEPAGE_VISIBILITY };
  if (savedVisibility && typeof savedVisibility === 'object') {
    Object.keys(DEFAULT_HOMEPAGE_VISIBILITY).forEach(key => {
      if (typeof savedVisibility[key] === 'boolean') {
        result[key] = savedVisibility[key];
      }
    });
  }
  return result;
}
