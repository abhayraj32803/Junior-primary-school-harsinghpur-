import React from 'react';
import {
  Building2,
  BookOpen,
  Laptop,
  Trophy,
  Droplets,
  Utensils,
  Monitor,
  Wifi,
  Sparkles,
  GraduationCap,
  Users,
  ShieldCheck,
  Lightbulb,
  Activity,
  Heart,
  Award,
  Music,
  Palette,
  FileText,
  TreePine,
  Microscope,
  Sun,
  School,
  Flame,
  Bookmark
} from 'lucide-react';
import { HomepageFacilityItem } from '../types';

export interface FacilityIconOption {
  id: string;
  label: string;
  labelHi: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FACILITY_ICON_OPTIONS: FacilityIconOption[] = [
  { id: 'Building2', label: 'School Building / Classrooms', labelHi: 'विद्यालय भवन / कक्षा-कक्ष', icon: Building2 },
  { id: 'BookOpen', label: 'Library / Books / Study', labelHi: 'पुस्तकालय / पुस्तकें / वाचनालय', icon: BookOpen },
  { id: 'Laptop', label: 'Computer Lab / ICT / Digital', labelHi: 'कंप्यूटर लैब / आईसीटी / डिजिटल', icon: Laptop },
  { id: 'Trophy', label: 'Playground / Sports / Games', labelHi: 'खेल का मैदान / खेलकूद सामग्री', icon: Trophy },
  { id: 'Droplets', label: 'Drinking Water / RO / Sanitation', labelHi: 'शुद्ध पेयजल / नल-जल व्यवस्था', icon: Droplets },
  { id: 'Utensils', label: 'Mid-Day Meal / Kitchen / Nutrition', labelHi: 'मध्याह्न भोजन (MDM) / पोषण', icon: Utensils },
  { id: 'Monitor', label: 'Smart Classroom / Digital Screen', labelHi: 'स्मार्ट टीवी / डिजिटल स्क्रीन', icon: Monitor },
  { id: 'Wifi', label: 'Internet / Diksha / Digital Portal', labelHi: 'इंटरनेट / दीक्षा पोर्टल कनेक्टिविटी', icon: Wifi },
  { id: 'Lightbulb', label: 'Science / Experiments / Innovation', labelHi: 'विज्ञान प्रयोग / नवाचार', icon: Lightbulb },
  { id: 'Sparkles', label: 'Special Activity / BaLA Art', labelHi: 'विशेष गतिविधियां / बाला पेंटिंग', icon: Sparkles },
  { id: 'GraduationCap', label: 'Academics / FLN Literacy', labelHi: 'शैक्षणिक प्रगति / बुनियादी शिक्षा', icon: GraduationCap },
  { id: 'Users', label: 'Bal Sansad / Teachers / Assembly', labelHi: 'बाल संसद / सामूहिक प्रार्थना', icon: Users },
  { id: 'ShieldCheck', label: 'Safety & Security / First Aid', labelHi: 'सुरक्षा / प्राथमिक चिकित्सा', icon: ShieldCheck },
  { id: 'Activity', label: 'Daily Yoga / Physical Health', labelHi: 'दैनिक योग / शारीरिक स्वास्थ्य', icon: Activity },
  { id: 'Heart', label: 'Child Welfare / Special Care', labelHi: 'बाल कल्याण / विशेष देखभाल', icon: Heart },
  { id: 'Award', label: 'Awards & Honors / Achievement', labelHi: 'पुरस्कार व सम्मान / उपलब्धि', icon: Award },
  { id: 'Palette', label: 'Art / Painting / Wall Art', labelHi: 'कला / चित्रकला / वॉल पेंटिंग', icon: Palette },
  { id: 'Music', label: 'Music & Cultural Activities', labelHi: 'संगीत / सांस्कृतिक गतिविधियां', icon: Music },
  { id: 'Microscope', label: 'Science Laboratory / Biology', labelHi: 'विज्ञान प्रयोगशाला / अन्वेषण', icon: Microscope },
  { id: 'TreePine', label: 'Green Campus / Herbal Garden', labelHi: 'हरित परिसर / पोषण वाटिका', icon: TreePine },
  { id: 'FileText', label: 'Study Material / Records', labelHi: 'अध्ययन सामग्री / अभिलेख', icon: FileText },
  { id: 'Sun', label: 'Solar Power / Bright Future', labelHi: 'सौर ऊर्जा / उज्ज्वल भविष्य', icon: Sun }
];

export const FACILITY_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  BookOpen,
  Laptop,
  Trophy,
  Droplets,
  Utensils,
  Monitor,
  Wifi,
  Lightbulb,
  Sparkles,
  GraduationCap,
  Users,
  ShieldCheck,
  Activity,
  Heart,
  Award,
  Palette,
  Music,
  Microscope,
  TreePine,
  FileText,
  Sun,
  School,
  Flame,
  Bookmark
};

export const getFacilityIconComponent = (iconId?: string): React.ComponentType<{ className?: string }> => {
  if (!iconId) return Building2;
  return FACILITY_ICON_MAP[iconId] || Building2;
};

export const DEFAULT_HOMEPAGE_FACILITIES: HomepageFacilityItem[] = [
  {
    id: 'smart-class',
    nameHi: 'स्मार्ट क्लासरूम (Smart Classroom)',
    nameEn: 'Smart Classroom',
    descHi: 'आधुनिक दृश्य-श्रव्य शिक्षा, प्रोजेक्टर, स्मार्ट टीवी व बाला (BaLA) पेंटिंग युक्त हवादार कमरे।',
    descEn: 'Audio-visual learning tools, smart screen, and BaLA instructional wall arts.',
    icon: 'Building2'
  },
  {
    id: 'library',
    nameHi: 'पुस्तकालय (Library)',
    nameEn: 'Library & Reading Corner',
    descHi: 'कहानियों, बाल साहित्य, ज्ञान-विज्ञान व महापुरुषों की प्रेरणादायक पुस्तकों का समृद्ध संकलन।',
    descEn: 'Rich collection of children storybooks, science journals, and reading corners.',
    icon: 'BookOpen'
  },
  {
    id: 'computer-lab',
    nameHi: 'कंप्यूटर लैब (Computer Lab)',
    nameEn: 'Computer & ICT Lab',
    descHi: 'दीक्षा ऐप व मूलभूत डिजिटल साक्षरता हेतु कंप्यूटर व डिजिटल शिक्षण व्यवस्था।',
    descEn: 'Digital learning tools, Diksha portal access, and fundamental ICT learning.',
    icon: 'Laptop'
  },
  {
    id: 'playground',
    nameHi: 'खेल का मैदान (Playground)',
    nameEn: 'Playground & Sports Kit',
    descHi: 'सुरक्षित खेल परिसर, फुटबॉल, वॉलीबॉल, बैडमिंटन, कैरम, शतरंज व दैनिक योगाभ्यास।',
    descEn: 'Spacious campus ground with complete sports kits and daily morning yoga.',
    icon: 'Trophy'
  },
  {
    id: 'drinking-water',
    nameHi: 'शुद्ध पेयजल (Drinking Water)',
    nameEn: 'Clean Drinking Water',
    descHi: 'जल जीवन मिशन द्वारा संतृप्त समर्सिबल पंप व मल्टीपल स्वच्छ नल व्यवस्था।',
    descEn: 'Continuous potable water supply through submersible pump and clean handwash units.',
    icon: 'Droplets'
  },
  {
    id: 'mid-day-meal',
    nameHi: 'मध्याह्न भोजन (Mid-Day Meal)',
    nameEn: 'PM-POSHAN Mid-Day Meal',
    descHi: 'साफ-सुथरे किचन शेड में मेन्यू अनुसार प्रतिदिन ताजा, गर्म व पौष्टिक भोजन व मौसमी फल।',
    descEn: 'Hygienic hot-cooked nutritious meals, seasonal fruits, and warm milk as per state menu.',
    icon: 'Utensils'
  }
];
