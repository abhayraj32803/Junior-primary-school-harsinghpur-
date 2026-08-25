import React, { useState, useEffect, useRef } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Layers, 
  Image as ImageIcon, 
  Sparkles,
  Upload,
  Crop,
  Sliders,
  RefreshCw,
  Monitor,
  Smartphone,
  Check,
  Building2,
  MapPin,
  ArrowRight,
  Info,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckSquare,
  Square,
  X,
  Search,
  Images,
  Link2,
  Video,
  Film,
  Activity,
  GraduationCap,
  Gift,
  FileText,
  Phone,
  BookOpen,
  HelpCircle,
  Users,
  Globe,
  Bell,
  MousePointerClick,
  ExternalLink
} from 'lucide-react';
import { AdminVisitorCounterWidget } from './AdminVisitorCounterWidget';
import { AdminEducationalVideos } from './AdminEducationalVideos';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { PRESET_HERO_BANNERS, CropResult } from '../../utils/cropUtils';
import { 
  FACILITY_ICON_OPTIONS, 
  DEFAULT_HOMEPAGE_FACILITIES, 
  getFacilityIconComponent 
} from '../../utils/facilityIconUtils';
import { HomepageFacilityItem } from '../../types';

interface SectionVisibility {
  heroStats: boolean;
  principalMessage: boolean;
  noticeTicker: boolean;
  educationalVideos: boolean;
  facilitiesPreview: boolean;
  schemesPreview: boolean;
  galleryPreview: boolean;
  calendarPreview: boolean;
  statisticsPreview: boolean;
  officialLinks: boolean;
}

const DEFAULT_VISIBILITY: SectionVisibility = {
  heroStats: true,
  principalMessage: true,
  noticeTicker: true,
  educationalVideos: true,
  facilitiesPreview: true,
  schemesPreview: true,
  galleryPreview: true,
  calendarPreview: true,
  statisticsPreview: true,
  officialLinks: true
};

const DEFAULT_CAROUSEL_IMAGES = [
  "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=2000&q=80",
  "https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=2000&q=80"
];

// Preset destination pages for Primary and Secondary CTA Buttons
const PRESET_CTA_PAGES = [
  { id: 'admission', labelHi: 'नि:शुल्क प्रवेश (Admission)', labelEn: 'Admission Guidelines', icon: 'GraduationCap', defaultTextHi: 'नि:शुल्क प्रवेश प्रक्रिया', defaultTextEn: 'Free Admission' },
  { id: 'gallery', labelHi: 'फोटो व वीडियो गैलरी (Gallery)', labelEn: 'School Photo Gallery', icon: 'Images', defaultTextHi: 'फोटो व वीडियो गैलरी', defaultTextEn: 'View Gallery' },
  { id: 'facilities', labelHi: 'विद्यालय सुविधाएं (Facilities)', labelEn: 'School Facilities & Labs', icon: 'Building2', defaultTextHi: 'विद्यालय सुविधाएं देखें', defaultTextEn: 'School Facilities' },
  { id: 'schemes', labelHi: 'सरकारी योजनाएं व DBT (Schemes)', labelEn: 'Govt Schemes & DBT', icon: 'Gift', defaultTextHi: 'डीबीटी व सरकारी योजनाएं', defaultTextEn: 'Govt. Schemes & DBT' },
  { id: 'notices', labelHi: 'सूचना पट्ट / परिपत्र (Notices)', labelEn: 'Public Notice Board', icon: 'Bell', defaultTextHi: 'नवीनतम सूचनाएं देखें', defaultTextEn: 'Public Notices' },
  { id: 'documents', labelHi: 'दस्तावेज़ व फॉर्म (Documents)', labelEn: 'Documents & Downloads', icon: 'FileText', defaultTextHi: 'दस्तावेज़ व प्रपत्र डाउनलोड', defaultTextEn: 'Download Forms' },
  { id: 'curriculum', labelHi: 'पाठ्यक्रम व कक्षाएं (Curriculum)', labelEn: 'Classes & Curriculum', icon: 'BookOpen', defaultTextHi: 'पाठ्यक्रम व कक्षाएं', defaultTextEn: 'Curriculum & Classes' },
  { id: 'about', labelHi: 'विद्यालय परिचय (About School)', labelEn: 'About School History', icon: 'Info', defaultTextHi: 'विद्यालय के बारे में', defaultTextEn: 'About Our School' },
  { id: 'contact', labelHi: 'संपर्क व पता (Contact Us)', labelEn: 'Contact School Desk', icon: 'Phone', defaultTextHi: 'संपर्क व पता', defaultTextEn: 'Contact Us' },
  { id: 'login', labelHi: 'पोर्टल लॉगिन (Portal Login)', labelEn: 'Portal Login', icon: 'Sparkles', defaultTextHi: 'छात्र / शिक्षक पोर्टल', defaultTextEn: 'Portal Login' },
];

const CTA_ICON_OPTIONS = [
  { id: 'GraduationCap', label: 'Graduation Cap (Education/Admission)', icon: GraduationCap },
  { id: 'Images', label: 'Gallery / Photos', icon: Images },
  { id: 'Building2', label: 'School Building / Facilities', icon: Building2 },
  { id: 'Gift', label: 'Govt Schemes / DBT / Rewards', icon: Gift },
  { id: 'FileText', label: 'Documents / Forms', icon: FileText },
  { id: 'Bell', label: 'Notice / Announcements', icon: Bell },
  { id: 'Phone', label: 'Contact / Call', icon: Phone },
  { id: 'BookOpen', label: 'Books / Curriculum', icon: BookOpen },
  { id: 'Sparkles', label: 'Sparkles / Portal', icon: Sparkles },
  { id: 'ArrowRight', label: 'Arrow Right / Action', icon: ArrowRight },
  { id: 'Globe', label: 'Website / External Link', icon: Globe },
  { id: 'Info', label: 'Information / About', icon: Info },
];

export const AdminHomepage: React.FC = () => {
  const { settings, updateSchoolSettingsWithAudit, language, gallery } = useSchool();
  const { userProfile } = useAuth();

  // Headlines
  const [heroTitleHi, setHeroTitleHi] = useState(
    settings.heroBannerHeadlineHi || settings.schoolNameHi || 'कंपोजिट उच्च प्राथमिक विद्यालय हरसिंहपुर गोवा'
  );
  const [heroTitleEn, setHeroTitleEn] = useState(
    settings.heroBannerHeadlineEn || settings.schoolName || 'Composite JHS Harsinghpur Gova'
  );
  const [heroSubtitleHi, setHeroSubtitleHi] = useState(
    settings.heroBannerSubtitleHi || `ग्राम: ${settings.villageHi || 'हरसिंहपुर गोवा'} • विकास खंड: ${settings.blockHi || 'शमसाबाद'} • जनपद: ${settings.districtHi || 'फर्रुखाबाद'}`
  );
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(
    settings.heroBannerSubtitleEn || `Village: ${settings.village || 'Harsinghpur Gova'} • Block: ${settings.block || 'Shamsabad'} • District: ${settings.district || 'Farrukhabad'}, UP`
  );

  // Hero CTA Action Buttons State
  const [ctaEnabled, setCtaEnabled] = useState<boolean>(
    settings.heroBannerCtaEnabled !== undefined ? settings.heroBannerCtaEnabled : true
  );
  const [ctaTextHi, setCtaTextHi] = useState<string>(
    settings.heroBannerCtaTextHi || 'नि:शुल्क प्रवेश प्रक्रिया'
  );
  const [ctaTextEn, setCtaTextEn] = useState<string>(
    settings.heroBannerCtaTextEn || 'Free Admission'
  );
  const [ctaLink, setCtaLink] = useState<string>(
    settings.heroBannerCtaLink || 'admission'
  );
  const [ctaIcon, setCtaIcon] = useState<string>(
    settings.heroBannerCtaIcon || 'GraduationCap'
  );

  // Secondary CTA State
  const [secondaryCtaEnabled, setSecondaryCtaEnabled] = useState<boolean>(
    settings.heroBannerSecondaryCtaEnabled !== undefined ? settings.heroBannerSecondaryCtaEnabled : true
  );
  const [secondaryCtaTextHi, setSecondaryCtaTextHi] = useState<string>(
    settings.heroBannerSecondaryCtaTextHi || 'डीबीटी व योजनाएं'
  );
  const [secondaryCtaTextEn, setSecondaryCtaTextEn] = useState<string>(
    settings.heroBannerSecondaryCtaTextEn || 'Govt. Schemes'
  );
  const [secondaryCtaLink, setSecondaryCtaLink] = useState<string>(
    settings.heroBannerSecondaryCtaLink || 'schemes'
  );
  const [secondaryCtaIcon, setSecondaryCtaIcon] = useState<string>(
    settings.heroBannerSecondaryCtaIcon || 'Gift'
  );

  // Banner image & styling
  const [bannerImage, setBannerImage] = useState<string>(
    settings.heroBannerImage || 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=2000&q=80'
  );
  const [bannerRatio, setBannerRatio] = useState<'21:9' | '16:9' | '3:1' | '4:3' | '1:1' | 'free'>(
    settings.heroBannerAspectRatio || '21:9'
  );
  const [bannerLayout, setBannerLayout] = useState<'panoramic_header' | 'dual_column' | 'ambient_background'>(
    settings.heroBannerLayout || 'panoramic_header'
  );
  const [overlayOpacity, setOverlayOpacity] = useState<number>(
    settings.heroBannerOverlayOpacity !== undefined ? settings.heroBannerOverlayOpacity : 60
  );
  const [bannerTextColor, setBannerTextColor] = useState<'light' | 'dark'>(
    settings.heroBannerTextColor || 'light'
  );
  const [previewAnimKey, setPreviewAnimKey] = useState<number>(0);

  // Carousel Configuration State
  const [carouselEnabled, setCarouselEnabled] = useState<boolean>(
    settings.heroBannerCarouselEnabled !== undefined ? settings.heroBannerCarouselEnabled : true
  );
  const [carouselImages, setCarouselImages] = useState<string[]>(
    settings.heroBannerCarouselImages && settings.heroBannerCarouselImages.length > 0
      ? settings.heroBannerCarouselImages
      : DEFAULT_CAROUSEL_IMAGES
  );
  const [carouselInterval, setCarouselInterval] = useState<number>(
    settings.heroBannerCarouselInterval || 5
  );

  // Carousel Live Preview State
  const [previewSlideIndex, setPreviewSlideIndex] = useState<number>(0);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState<boolean>(true);

  // Media Library Selection Modal State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState<boolean>(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [selectedMediaCategory, setSelectedMediaCategory] = useState<string>('All');
  const [selectedGalleryUrls, setSelectedGalleryUrls] = useState<string[]>([]);

  // Add Custom URL Modal
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [customUrlInput, setCustomUrlInput] = useState<string>('');

  // Track if cropping single banner vs a specific carousel slide
  const [activeCropSlideIndex, setActiveCropSlideIndex] = useState<number | null>(null);

  // Section visibility
  const [visibility, setVisibility] = useState<SectionVisibility>(() => {
    try {
      const saved = localStorage.getItem('sms_homepage_sections_visibility');
      return saved ? JSON.parse(saved) : DEFAULT_VISIBILITY;
    } catch {
      return DEFAULT_VISIBILITY;
    }
  });

  // Cropper Modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const carouselFileInputRef = useRef<HTMLInputElement | null>(null);

  // UI state
  const [saved, setSaved] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'banner' | 'cta' | 'facilities' | 'videos' | 'visibility' | 'visitor'>('all');

  // Homepage 6 Facilities State
  const [homepageFacilities, setHomepageFacilities] = useState<HomepageFacilityItem[]>(
    settings.homepageFacilities && settings.homepageFacilities.length === 6
      ? settings.homepageFacilities
      : DEFAULT_HOMEPAGE_FACILITIES
  );

  const updateFacilityCard = (index: number, field: keyof HomepageFacilityItem, value: string) => {
    setHomepageFacilities(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Keep state in sync if settings update
  useEffect(() => {
    if (settings.heroBannerImage) setBannerImage(settings.heroBannerImage);
    if (settings.heroBannerAspectRatio) setBannerRatio(settings.heroBannerAspectRatio);
    if (settings.heroBannerLayout) setBannerLayout(settings.heroBannerLayout);
    if (settings.heroBannerOverlayOpacity !== undefined) setOverlayOpacity(settings.heroBannerOverlayOpacity);
    if (settings.heroBannerTextColor) setBannerTextColor(settings.heroBannerTextColor);
    if (settings.heroBannerHeadlineHi) setHeroTitleHi(settings.heroBannerHeadlineHi);
    if (settings.heroBannerHeadlineEn) setHeroTitleEn(settings.heroBannerHeadlineEn);
    if (settings.heroBannerSubtitleHi) setHeroSubtitleHi(settings.heroBannerSubtitleHi);
    if (settings.heroBannerSubtitleEn) setHeroSubtitleEn(settings.heroBannerSubtitleEn);
    if (settings.heroBannerCarouselEnabled !== undefined) setCarouselEnabled(settings.heroBannerCarouselEnabled);
    if (settings.heroBannerCarouselImages && settings.heroBannerCarouselImages.length > 0) {
      setCarouselImages(settings.heroBannerCarouselImages);
    }
    if (settings.heroBannerCarouselInterval) setCarouselInterval(settings.heroBannerCarouselInterval);
    if (settings.heroBannerCtaEnabled !== undefined) setCtaEnabled(settings.heroBannerCtaEnabled);
    if (settings.heroBannerCtaTextHi) setCtaTextHi(settings.heroBannerCtaTextHi);
    if (settings.heroBannerCtaTextEn) setCtaTextEn(settings.heroBannerCtaTextEn);
    if (settings.heroBannerCtaLink) setCtaLink(settings.heroBannerCtaLink);
    if (settings.heroBannerCtaIcon) setCtaIcon(settings.heroBannerCtaIcon);
    if (settings.heroBannerSecondaryCtaEnabled !== undefined) setSecondaryCtaEnabled(settings.heroBannerSecondaryCtaEnabled);
    if (settings.heroBannerSecondaryCtaTextHi) setSecondaryCtaTextHi(settings.heroBannerSecondaryCtaTextHi);
    if (settings.heroBannerSecondaryCtaTextEn) setSecondaryCtaTextEn(settings.heroBannerSecondaryCtaTextEn);
    if (settings.heroBannerSecondaryCtaLink) setSecondaryCtaLink(settings.heroBannerSecondaryCtaLink);
    if (settings.heroBannerSecondaryCtaIcon) setSecondaryCtaIcon(settings.heroBannerSecondaryCtaIcon);
    if (settings.homepageFacilities && settings.homepageFacilities.length === 6) {
      setHomepageFacilities(settings.homepageFacilities);
    }
  }, [settings]);

  // Preview Carousel Auto-Rotation Timer
  useEffect(() => {
    if (!carouselEnabled || !isPreviewPlaying || carouselImages.length <= 1) return;
    const intervalMs = Math.max(2, carouselInterval) * 1000;
    const timer = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % carouselImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [carouselEnabled, isPreviewPlaying, carouselImages.length, carouselInterval]);

  // Adjust preview slide index if images array changes
  useEffect(() => {
    if (previewSlideIndex >= carouselImages.length) {
      setPreviewSlideIndex(0);
    }
  }, [carouselImages.length, previewSlideIndex]);

  const toggleSection = (key: keyof SectionVisibility) => {
    setVisibility(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem('sms_homepage_sections_visibility', JSON.stringify(next));
      return next;
    });
  };

  // Handle local file selection -> open Cropper Modal
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, isForCarousel: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRawImageForCrop(result);
      if (isForCarousel) {
        setActiveCropSlideIndex(-1); // -1 signifies appending a new slide
      } else {
        setActiveCropSlideIndex(null);
      }
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);

    e.target.value = '';
  };

  // Handle Crop Complete from Modal
  const handleCropComplete = (result: CropResult) => {
    if (activeCropSlideIndex === -1) {
      setCarouselImages(prev => [...prev, result.dataUrl]);
      setPreviewSlideIndex(carouselImages.length);
    } else if (activeCropSlideIndex !== null && activeCropSlideIndex >= 0 && activeCropSlideIndex < carouselImages.length) {
      setCarouselImages(prev => {
        const next = [...prev];
        next[activeCropSlideIndex] = result.dataUrl;
        return next;
      });
    } else {
      setBannerImage(result.dataUrl);
      if (carouselImages.length > 0) {
        setCarouselImages(prev => [result.dataUrl, ...prev.slice(1)]);
      }
    }
    setBannerRatio(result.aspectRatio as any || '21:9');
    setActiveCropSlideIndex(null);
  };

  // Open cropper for current active image
  const handleCropCurrentImage = () => {
    const currentActiveUrl = carouselEnabled && carouselImages[previewSlideIndex] 
      ? carouselImages[previewSlideIndex] 
      : bannerImage;
    setRawImageForCrop(currentActiveUrl);
    if (carouselEnabled) {
      setActiveCropSlideIndex(previewSlideIndex);
    } else {
      setActiveCropSlideIndex(null);
    }
    setCropperOpen(true);
  };

  // Open cropper for a specific slide from the carousel manager list
  const handleCropSpecificSlide = (index: number) => {
    if (index >= 0 && index < carouselImages.length) {
      setRawImageForCrop(carouselImages[index]);
      setActiveCropSlideIndex(index);
      setCropperOpen(true);
    }
  };

  // Select pre-curated school banner
  const handleSelectPreset = (url: string, addToCarousel: boolean = false) => {
    if (addToCarousel) {
      if (!carouselImages.includes(url)) {
        setCarouselImages(prev => [...prev, url]);
      }
    } else {
      setRawImageForCrop(url);
      setActiveCropSlideIndex(null);
      setCropperOpen(true);
    }
  };

  // Carousel Slide Management Helpers
  const handleRemoveSlide = (index: number) => {
    if (carouselImages.length <= 1) {
      alert(language === 'hi' ? 'कम से कम एक मुख्य बैनर फोटो अनिवार्य है।' : 'At least one hero banner image is required.');
      return;
    }
    setCarouselImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= carouselImages.length) return;
    setCarouselImages(prev => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    setPreviewSlideIndex(targetIndex);
  };

  const handleMakeMainSlide = (index: number) => {
    if (index === 0) return;
    setCarouselImages(prev => {
      const selected = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
    setBannerImage(carouselImages[index]);
    setPreviewSlideIndex(0);
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    if (!customUrlInput.startsWith('http://') && !customUrlInput.startsWith('https://') && !customUrlInput.startsWith('data:')) {
      alert('Please enter a valid image URL starting with https://');
      return;
    }
    setCarouselImages(prev => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
    setIsUrlModalOpen(false);
  };

  // Open Media Library Picker
  const handleOpenMediaPicker = () => {
    setSelectedGalleryUrls([]);
    setMediaSearchQuery('');
    setSelectedMediaCategory('All');
    setIsMediaPickerOpen(true);
  };

  // Confirm selection from Media Library
  const handleConfirmMediaPicker = () => {
    if (selectedGalleryUrls.length > 0) {
      const newUrls = selectedGalleryUrls.filter(url => !carouselImages.includes(url));
      if (newUrls.length > 0) {
        setCarouselImages(prev => [...prev, ...newUrls]);
      }
    }
    setIsMediaPickerOpen(false);
  };

  // Toggle selection inside Media Library modal
  const toggleSelectGalleryUrl = (url: string) => {
    setSelectedGalleryUrls(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Save all settings to school context with audit log
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem('sms_homepage_sections_visibility', JSON.stringify(visibility));
      
      const effectiveMainImage = carouselEnabled && carouselImages.length > 0 
        ? carouselImages[0] 
        : bannerImage;

      await updateSchoolSettingsWithAudit(
        {
          heroBannerImage: effectiveMainImage,
          heroBannerAspectRatio: bannerRatio,
          heroBannerLayout: bannerLayout,
          heroBannerTextColor: bannerTextColor,
          heroBannerOverlayOpacity: overlayOpacity,
          heroBannerHeadlineHi: heroTitleHi,
          heroBannerHeadlineEn: heroTitleEn,
          heroBannerSubtitleHi: heroSubtitleHi,
          heroBannerSubtitleEn: heroSubtitleEn,
          heroBannerCarouselEnabled: carouselEnabled,
          heroBannerCarouselImages: carouselImages,
          heroBannerCarouselInterval: carouselInterval,
          heroBannerCtaEnabled: ctaEnabled,
          heroBannerCtaTextHi: ctaTextHi,
          heroBannerCtaTextEn: ctaTextEn,
          heroBannerCtaLink: ctaLink,
          heroBannerCtaIcon: ctaIcon,
          heroBannerSecondaryCtaEnabled: secondaryCtaEnabled,
          heroBannerSecondaryCtaTextHi: secondaryCtaTextHi,
          heroBannerSecondaryCtaTextEn: secondaryCtaTextEn,
          heroBannerSecondaryCtaLink: secondaryCtaLink,
          heroBannerSecondaryCtaIcon: secondaryCtaIcon,
          homepageFacilities: homepageFacilities,
        },
        {
          field: 'Homepage Hero Banner, CTA, Carousel & Facilities Settings',
          previousValue: settings.heroBannerCarouselEnabled ? 'Carousel Active' : 'Single Banner',
          newValue: carouselEnabled 
            ? `Carousel (${carouselImages.length} slides, ${carouselInterval}s interval), CTA: [${ctaTextEn} -> ${ctaLink}], Facilities: ${homepageFacilities.map(f => `${f.nameEn} (${f.icon})`).join(', ')}` 
            : `Single Banner (${bannerRatio}), CTA: [${ctaTextEn} -> ${ctaLink}], Facilities: ${homepageFacilities.map(f => `${f.nameEn} (${f.icon})`).join(', ')}`,
          source: 'Headmaster Administrative Panel',
          status: 'VERIFIED_CURRENT',
          notes: `Updated hero banner, CTA button ("${ctaTextEn}" -> ${ctaLink}), carousel mode (${carouselEnabled ? 'Enabled' : 'Disabled'}), ${carouselImages.length} slides, and 6 Facilities Icons (${homepageFacilities.map(f => f.icon).join(', ')}) by ${userProfile?.name || 'Admin'}`
        }
      );

      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
      alert('Failed to save homepage settings.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter gallery items for Media Library modal
  const filteredGallery = gallery.filter(item => {
    const matchesSearch = !mediaSearchQuery || 
      item.titleHi?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      item.titleEn?.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      item.tags?.some(t => t.toLowerCase().includes(mediaSearchQuery.toLowerCase())) ||
      item.albumName?.toLowerCase().includes(mediaSearchQuery.toLowerCase());
    
    const matchesCategory = selectedMediaCategory === 'All' || item.category === selectedMediaCategory;
    const isPhoto = item.mediaType === 'photo' || !item.mediaType;
    return matchesSearch && matchesCategory && isPhoto;
  });

  const activeDisplayImage = carouselEnabled && carouselImages.length > 0
    ? carouselImages[previewSlideIndex % carouselImages.length]
    : bannerImage;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {language === 'hi' ? 'मुख्य पृष्ठ प्रबंधक' : 'Homepage Content & Layout'}
              </span>
              <span className="text-xs font-mono text-slate-500">Live Website Sync</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {language === 'hi' ? 'मुख्य पृष्ठ (होमपेज) बैनर व कैरोसेल प्रबंधक' : 'Homepage Hero Banner & Carousel Manager'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {language === 'hi'
                ? 'वेबसाइट के मुख्य बैनर में एकल चित्र या बहु-चित्र स्लाइड शो (Carousel) सेट करें, समय अंतराल चुनें एवं शीर्षक संपादित करें।'
                : 'Configure single hero banner or rotating multi-image carousel with custom intervals, cropping, and live sync.'}
            </p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'hi' ? 'मुख्य बैनर, कैरोसेल व लेआउट सेटिंग्स सफलतापूर्वक सहेजी गईं!' : 'Homepage hero banner, carousel, and layout settings saved successfully!'}</span>
          </div>
        </div>
      )}

      {saveNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveNotice}</span>
          </div>
        </div>
      )}

      {/* Quick Jump & Filter Tabs for Homepage Modules */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', labelHi: 'सम्पूर्ण प्रबंधन (All Modules)', labelEn: 'All Modules', icon: Layers },
          { id: 'facilities', labelHi: 'विद्यालय सुविधाएं (6 कार्ड्स)', labelEn: 'Our Facilities (6 Cards)', icon: Building2, badge: '6 Cards' },
          { id: 'videos', labelHi: 'कक्षा 1-8 शैक्षिक वीडियो', labelEn: 'Educational Videos', icon: Video, badge: 'Class 1-8' },
          { id: 'banner', labelHi: 'बैनर व कैरोसेल', labelEn: 'Banner & Carousel', icon: ImageIcon },
          { id: 'cta', labelHi: 'कॉल-टू-एक्शन (CTA बटन)', labelEn: 'Hero CTA Buttons', icon: MousePointerClick, badge: 'Custom' },
          { id: 'visibility', labelHi: 'अनुभाग दृश्यता', labelEn: 'Sections Visibility', icon: Eye },
          { id: 'visitor', labelHi: 'विजिटर एनालिटिक्स', labelEn: 'Visitor Traffic', icon: Activity }
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeSectionTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSectionTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-400/40 scale-102'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <IconComp className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-amber-600'}`} />
              <span>{language === 'hi' ? tab.labelHi : tab.labelEn}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${isActive ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-900'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* EDUCATIONAL & MOTIVATIONAL VIDEOS COMPONENT (Class 1-8 YouTube Manager) */}
      {(activeSectionTab === 'all' || activeSectionTab === 'videos') && (
        <AdminEducationalVideos 
          onSaveNotice={(msg) => {
            setSaveNotice(msg);
            setTimeout(() => setSaveNotice(''), 3500);
          }} 
        />
      )}

      {/* Lightweight Private Visitor Analytics & Site Traffic Monitor */}
      {(activeSectionTab === 'all' || activeSectionTab === 'visitor') && (
        <AdminVisitorCounterWidget />
      )}

      {(activeSectionTab === 'all' || activeSectionTab === 'banner' || activeSectionTab === 'cta' || activeSectionTab === 'facilities' || activeSectionTab === 'visibility') && (
        <form onSubmit={handleSave} className="space-y-6">
        
        {/* HERO BANNER IMAGE & LIVE SIMULATION SECTION */}
        {(activeSectionTab === 'all' || activeSectionTab === 'banner' || activeSectionTab === 'cta') && (
        <>
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'मुख्य बैनर पूर्वावलोकन (Live Preview)' : 'Live Hero Banner Preview'}
                  </h3>
                  {carouselEnabled && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold flex items-center gap-1">
                      <Images className="w-3 h-3 text-blue-600" />
                      <span>{language === 'hi' ? `कैरोसेल सक्रिय (${carouselImages.length} स्लाइड्स)` : `Carousel Active (${carouselImages.length} Slides)`}</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'hi' 
                    ? 'अपलोड की गई इमेज को 21:9 पैनोरमिक या 16:9 अनुपात में लाइव प्रीव्यू करें।' 
                    : 'Interactive live preview simulating public homepage layout and rotation.'}
                </p>
              </div>
            </div>

            {/* Quick Action Upload & Crop Buttons */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelect(e, false)}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फोटो अपलोड' : 'Upload Photo'}</span>
              </button>
              
              <button
                type="button"
                onClick={handleCropCurrentImage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs border border-slate-800"
              >
                <Crop className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सक्रिय फोटो क्रॉप करें' : 'Crop Active (21:9)'}</span>
              </button>
            </div>
          </div>

          {/* Current Active Banner Live Display & Simulation */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {language === 'hi' ? 'सक्रिय बैनर डिस्प्ले:' : 'Active Banner Display:'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                  Aspect: {bannerRatio} • Layout: {bannerLayout}
                </span>
                {carouselEnabled && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-mono font-bold border border-indigo-200">
                    Slide {previewSlideIndex + 1} of {carouselImages.length} ({carouselInterval}s interval)
                  </span>
                )}
              </div>

              {/* Preview Device Selector */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Interactive Live Hero Banner Simulation Box */}
            <div className={`mx-auto transition-all duration-300 ${previewDevice === 'desktop' ? 'w-full' : 'max-w-xs'}`}>
              <div className="rounded-3xl border border-slate-200 overflow-hidden shadow-md bg-slate-950 relative group">
                
                {/* Banner Image Container with Aspect Ratio */}
                <div 
                  className={`relative w-full overflow-hidden ${
                    bannerRatio === '21:9' ? 'aspect-[21/9]' :
                    bannerRatio === '16:9' ? 'aspect-video' :
                    bannerRatio === '3:1' ? 'aspect-[3/1]' :
                    bannerRatio === '4:3' ? 'aspect-[4/3]' : 'aspect-[21/9]'
                  }`}
                >
                  {/* Layered Crossfading Images for Carousel Preview */}
                  {carouselEnabled && carouselImages.length > 0 ? (
                    carouselImages.map((img, idx) => (
                      <img
                        key={`preview-slide-${idx}-${img.slice(0, 30)}`}
                        src={img}
                        alt={`Hero Banner Slide ${idx + 1}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${
                          idx === previewSlideIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                      />
                    ))
                  ) : (
                    <img
                      src={activeDisplayImage}
                      alt="Hero Banner Preview"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Configurable Contrast Overlay */}
                  <div 
                    className={`absolute inset-0 flex flex-col justify-center p-6 sm:p-8 ${
                      bannerTextColor === 'dark'
                        ? 'bg-gradient-to-r from-white via-white/90 to-transparent'
                        : 'bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent'
                    }`}
                    style={{ opacity: overlayOpacity / 100 }}
                  >
                    <div 
                      key={`preview-hero-${previewAnimKey}-${language}`} 
                      className={`max-w-xl space-y-2 ${bannerTextColor === 'dark' ? 'text-slate-900' : 'text-white'}`}
                    >
                      <div className="flex flex-wrap items-center gap-2 animate-hero-badges">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          उत्तर प्रदेश शासन
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          bannerTextColor === 'dark'
                            ? 'bg-slate-900/10 text-slate-900 border border-slate-900/20'
                            : 'bg-white/20 backdrop-blur-xs text-white'
                        }`}>
                          कक्षा 1 से 8 (कंपोजिट)
                        </span>
                        <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          bannerTextColor === 'dark'
                            ? 'bg-slate-200 text-slate-900 border border-slate-300'
                            : 'bg-slate-900/80 text-amber-300'
                        }`}>
                          UDISE: {settings.schoolCode}
                        </span>
                      </div>
                      <h4 
                        key={`hero-title-${previewAnimKey}-${language}-${heroTitleHi}-${heroTitleEn}`}
                        className={`text-sm sm:text-xl md:text-2xl font-black tracking-tight leading-tight animate-hero-headline ${
                          bannerTextColor === 'dark' ? 'text-slate-950 drop-shadow-xs' : 'text-white drop-shadow-md'
                        }`}
                      >
                        {language === 'hi' ? heroTitleHi : heroTitleEn}
                      </h4>
                      <p 
                        key={`hero-sub-${previewAnimKey}-${language}-${heroSubtitleHi}-${heroSubtitleEn}`}
                        className={`text-[11px] sm:text-xs line-clamp-2 animate-hero-subtitle ${
                          bannerTextColor === 'dark' ? 'text-slate-700' : 'text-slate-300'
                        }`}
                      >
                        {language === 'hi' ? heroSubtitleHi : heroSubtitleEn}
                      </p>

                      {/* Live Simulated CTA Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 animate-hero-subtitle">
                        {ctaEnabled && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-[11px] sm:text-xs shadow-md">
                            <span>{language === 'hi' ? (ctaTextHi || 'नि:शुल्क प्रवेश') : (ctaTextEn || 'Free Admission')}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                        {secondaryCtaEnabled && (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-[11px] sm:text-xs shadow-xs">
                            <span>{language === 'hi' ? (secondaryCtaTextHi || 'योजनाएं') : (secondaryCtaTextEn || 'Govt. Schemes')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Carousel Live Interactive Arrows & Dots inside Preview */}
                  {carouselEnabled && carouselImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSlideIndex(prev => (prev === 0 ? carouselImages.length - 1 : prev - 1));
                        }}
                        className={`absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs cursor-pointer shadow-md transition-transform hover:scale-105 ${
                          bannerTextColor === 'dark'
                            ? 'bg-white/80 hover:bg-white text-slate-900 border border-slate-300'
                            : 'bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20'
                        }`}
                        title="Previous Slide"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewSlideIndex(prev => (prev + 1) % carouselImages.length);
                        }}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-xs cursor-pointer shadow-md transition-transform hover:scale-105 ${
                          bannerTextColor === 'dark'
                            ? 'bg-white/80 hover:bg-white text-slate-900 border border-slate-300'
                            : 'bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20'
                        }`}
                        title="Next Slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Navigation Dots and Slide Counter */}
                      <div className={`absolute bottom-3 right-3 z-20 flex items-center gap-2 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md ${
                        bannerTextColor === 'dark'
                          ? 'bg-white/90 border border-slate-300 text-slate-900'
                          : 'bg-slate-950/80 border border-white/20 text-white'
                      }`}>
                        <button
                          type="button"
                          onClick={() => setIsPreviewPlaying(p => !p)}
                          className={`text-[10px] pr-1 cursor-pointer ${
                            bannerTextColor === 'dark' ? 'text-amber-700 hover:text-amber-800' : 'text-amber-400 hover:text-amber-300'
                          }`}
                          title={isPreviewPlaying ? 'Pause Auto-Play' : 'Play Auto-Play'}
                        >
                          {isPreviewPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <div className="flex items-center gap-1">
                          {carouselImages.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPreviewSlideIndex(idx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                idx === previewSlideIndex 
                                  ? 'w-4 bg-amber-500' 
                                  : (bannerTextColor === 'dark' ? 'w-1.5 bg-slate-400 hover:bg-slate-600' : 'w-1.5 bg-white/50 hover:bg-white/80')
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-[9px] font-mono pl-1 border-l ${
                          bannerTextColor === 'dark' ? 'text-slate-800 border-slate-300' : 'text-white/90 border-white/20'
                        }`}>
                          {previewSlideIndex + 1}/{carouselImages.length}
                        </span>
                      </div>
                    </>
                  )}

                </div>

                {/* Simulation Footer Bar */}
                <div className="p-3 bg-slate-900 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Aspect Fitted
                    </span>
                    <span>• {carouselEnabled ? `Rotating ${carouselImages.length} Slides every ${carouselInterval}s` : 'Single Static Header'}</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono">
                      Text: {bannerTextColor === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewAnimKey((k) => k + 1)}
                      className="text-amber-300 hover:text-amber-200 font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors px-2 py-0.5 rounded-md hover:bg-slate-800/80"
                      title={language === 'hi' ? 'एनिमेशन दोबारा चलाएं' : 'Replay entry animations'}
                    >
                      <Play className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                      <span>{language === 'hi' ? 'एनिमेशन चलाएं' : 'Replay Animation'}</span>
                    </button>
                    <span className="text-slate-700">|</span>
                    <button
                      type="button"
                      onClick={handleCropCurrentImage}
                      className="text-amber-400 hover:underline font-bold text-[11px] cursor-pointer"
                    >
                      Open Canvas Cropper →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Banner Layout & Overlay Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              {/* Aspect Ratio Picker */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'बैनर पहलू अनुपात (Aspect Ratio)' : 'Banner Aspect Ratio'}
                </label>
                <select
                  value={bannerRatio}
                  onChange={(e) => setBannerRatio(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="21:9">21:9 Hero Panoramic (Recommended)</option>
                  <option value="16:9">16:9 Widescreen Banner</option>
                  <option value="3:1">3:1 Header Ribbon Strip</option>
                  <option value="4:3">4:3 Standard Photo</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  {language === 'hi' ? '21:9 अनुपात डेस्कटॉप और मोबाइल पर सबसे उपयुक्त दिखता है।' : '21:9 provides ideal panoramic framing without clipping text.'}
                </p>
              </div>

              {/* Homepage Hero Layout Mode */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'hi' ? 'होमपेज लेआउट शैली' : 'Homepage Hero Layout Style'}
                </label>
                <select
                  value={bannerLayout}
                  onChange={(e) => setBannerLayout(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 cursor-pointer"
                >
                  <option value="panoramic_header">Panoramic Banner Header (आधुनिक)</option>
                  <option value="dual_column">Dual-Column Classic Institutional (मानक)</option>
                  <option value="ambient_background">Full-Bleed Ambient Background</option>
                </select>
                <p className="text-[10px] text-slate-500">
                  {language === 'hi' ? 'होमपेज पर बैनर और सूचनाओं का प्रदर्शन प्रारूप।' : 'Choose how the hero image renders with text on the public homepage.'}
                </p>
              </div>

              {/* Overlay Text Color Theme (Light vs Dark) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{language === 'hi' ? 'ओवरले टेक्स्ट रंग (Text Theme)' : 'Overlay Text Color Theme'}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    bannerTextColor === 'dark' ? 'bg-slate-900 text-white' : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {bannerTextColor === 'dark' ? (language === 'hi' ? 'डार्क टेक्स्ट' : 'Dark Text') : (language === 'hi' ? 'सफेद टेक्स्ट' : 'Light Text')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setBannerTextColor('light')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerTextColor === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-white"></span>
                    <span>{language === 'hi' ? 'सफेद (Light)' : 'Light (White)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerTextColor('dark')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      bannerTextColor === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400"></span>
                    <span>{language === 'hi' ? 'डार्क (Dark)' : 'Dark (Navy)'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">
                  {language === 'hi' 
                    ? 'उजली/सफेद तस्वीरों के लिए डार्क टेक्स्ट और सामान्य/डार्क फोटो के लिए सफेद टेक्स्ट चुनें।' 
                    : 'Select dark text for bright/white photos, or light text for dark images.'}
                </p>
              </div>

              {/* Overlay Opacity Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{language === 'hi' ? 'ओवरले घनत्व' : 'Contrast Overlay'}</span>
                  <span className="font-mono text-amber-600 font-extrabold">{overlayOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  {bannerTextColor === 'dark'
                    ? (language === 'hi' ? 'डार्क टेक्स्ट को पढ़ने योग्य बनाने हेतु हल्का बैकड्रॉप।' : 'Adjusts translucent bright overlay density for dark text.')
                    : (language === 'hi' ? 'सफेद टेक्स्ट को स्पष्ट रूप से पढ़ने के लिए ओवरले बढ़ाएं।' : 'Darkens image behind white text for WCAG contrast.')}
                </p>
              </div>

            </div>

          </div>
        </div>

        {/* HERO BANNER CAROUSEL CONFIGURATION CARD */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-black">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'मुख्य बैनर कैरोसेल / स्लाइड शो मोड' : 'Hero Banner Carousel Mode'}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    carouselEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {carouselEnabled ? (language === 'hi' ? 'सक्रिय (Active)' : 'Enabled') : (language === 'hi' ? 'निष्क्रिय (Disabled)' : 'Disabled')}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'hi' 
                    ? 'मुख्य हेडर पर एक से अधिक तस्वीरों को स्वतः घूमने वाले स्लाइड शो के रूप में दिखाएं।' 
                    : 'Automatically rotate multiple school photographs in the hero header banner at a configurable interval.'}
                </p>
              </div>
            </div>

            {/* Carousel Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'कैरोसेल मोड:' : 'Carousel Mode:'}
              </span>
              <button
                type="button"
                onClick={() => setCarouselEnabled(prev => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-hidden ${
                  carouselEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                aria-pressed={carouselEnabled}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    carouselEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {carouselEnabled ? (
            <div className="space-y-6">
              {/* Slide Interval Selection */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-950">
                      {language === 'hi' ? 'स्लाइड रोटेशन समय अंतराल (Slide Rotation Interval)' : 'Slide Rotation Interval'}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-700/80">
                    {language === 'hi' 
                      ? 'प्रत्येक फोटो कितने सेकंड बाद अपने आप बदलेगी।' 
                      : 'Time duration each image stays on screen before transitioning to next slide.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {[3, 5, 8, 10, 15].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setCarouselInterval(sec)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        carouselInterval === sec
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white text-indigo-900 border border-indigo-200 hover:bg-indigo-100/50'
                      }`}
                    >
                      {sec}s {sec === 5 ? '(Standard)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Toolbar for adding images to carousel */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>{language === 'hi' ? `चयनित कैरोसेल स्लाइड्स (${carouselImages.length}):` : `Configured Carousel Slides (${carouselImages.length}):`}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {language === 'hi' ? '(क्रम बदलने के लिए तीर का उपयोग करें)' : '(Use arrows to reorder slides)'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="file"
                    ref={carouselFileInputRef}
                    onChange={(e) => handleFileSelect(e, true)}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                  />
                  
                  {/* Select from Media Library Modal Button */}
                  <button
                    type="button"
                    onClick={handleOpenMediaPicker}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Images className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'मीडिया लाइब्रेरी से चुनें' : 'Select from Media Library'}</span>
                  </button>

                  {/* Upload Local File Button */}
                  <button
                    type="button"
                    onClick={() => carouselFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{language === 'hi' ? 'फोटो अपलोड' : 'Upload Local'}</span>
                  </button>

                  {/* Add Image URL Button */}
                  <button
                    type="button"
                    onClick={() => setIsUrlModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                  >
                    <Link2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>{language === 'hi' ? 'URL से जोड़ें' : 'Add via URL'}</span>
                  </button>
                </div>
              </div>

              {/* Carousel Slides List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {carouselImages.map((imgUrl, index) => (
                  <div
                    key={`carousel-card-${index}`}
                    className={`p-3 rounded-2xl border transition-all bg-white relative group flex flex-col justify-between gap-3 ${
                      previewSlideIndex === index 
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-900">
                      <img
                        src={imgUrl}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-950/80 text-white font-mono text-[10px] font-black backdrop-blur-xs">
                          #{index + 1}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black uppercase">
                            Primary
                          </span>
                        )}
                      </div>

                      {/* Preview Indicator */}
                      {previewSlideIndex === index && (
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>Now Playing</span>
                        </div>
                      )}
                    </div>

                    {/* Controls Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1">
                        {/* Move Up / Left */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveSlide(index, 'up')}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Move earlier in rotation"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        {/* Move Down / Right */}
                        <button
                          type="button"
                          disabled={index === carouselImages.length - 1}
                          onClick={() => handleMoveSlide(index, 'down')}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Move later in rotation"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Make First */}
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMakeMainSlide(index)}
                            className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                            title="Set as first slide"
                          >
                            Set #1
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Crop Button */}
                        <button
                          type="button"
                          onClick={() => handleCropSpecificSlide(index)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 cursor-pointer"
                          title="Crop and frame this slide"
                        >
                          <Crop className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete Slide */}
                        <button
                          type="button"
                          onClick={() => handleRemoveSlide(index)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Remove slide from carousel"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick School Presets Selection */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{language === 'hi' ? 'विद्यालय फोटो बैंक से सीधे कैरोसेल में जोड़ें:' : 'Quick Add from Verified School Photo Bank:'}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">Click any photo to append to carousel</span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {PRESET_HERO_BANNERS.map((preset) => {
                    const isAlreadyAdded = carouselImages.includes(preset.url);
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.url, true)}
                        className={`group relative rounded-2xl overflow-hidden border transition-all text-left cursor-pointer shadow-xs aspect-[16/10] ${
                          isAlreadyAdded 
                            ? 'border-emerald-500 ring-2 ring-emerald-500/30' 
                            : 'border-slate-200 hover:border-indigo-500'
                        }`}
                      >
                        <img
                          src={preset.thumbnail}
                          alt={preset.titleEn}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-2 flex flex-col justify-between">
                          <div className="flex justify-end">
                            {isAlreadyAdded ? (
                              <span className="p-1 rounded-full bg-emerald-500 text-white shadow-xs">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            ) : (
                              <span className="p-1 rounded-full bg-slate-900/60 text-white group-hover:bg-indigo-600 transition-colors shadow-xs">
                                <Plus className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-white leading-tight line-clamp-2">
                            {language === 'hi' ? preset.titleHi : preset.titleEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                {language === 'hi' ? 'एकल मुख्य बैनर मोड सक्रिय है' : 'Single Static Banner Mode Active'}
              </div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                {language === 'hi' 
                  ? 'कैरोसेल मोड बंद होने पर होमपेज पर केवल एक प्राथमिक बैनर चित्र प्रदर्शित होगा।' 
                  : 'Currently showing a single static hero banner. Toggle on above to activate multi-slide rotation with custom intervals.'}
              </p>
            </div>
          )}
        </div>

        {/* HERO SECTION HEADLINES */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>{language === 'hi' ? 'मुख्य बैनर शीर्षक व विवरण (Hero Banner Headlines)' : 'Hero Banner Headlines & Description'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'मुख्य शीर्षक (हिंदी)' : 'Hero Main Title (Hindi)'}
              </label>
              <input
                type="text"
                value={heroTitleHi}
                onChange={(e) => setHeroTitleHi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'Main Title (English)' : 'Hero Main Title (English)'}
              </label>
              <input
                type="text"
                value={heroTitleEn}
                onChange={(e) => setHeroTitleEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'उप-शीर्षक (हिंदी)' : 'Hero Subtitle (Hindi)'}
              </label>
              <input
                type="text"
                value={heroSubtitleHi}
                onChange={(e) => setHeroSubtitleHi(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {language === 'hi' ? 'Subtitle (English)' : 'Hero Subtitle (English)'}
              </label>
              <input
                type="text"
                value={heroSubtitleEn}
                onChange={(e) => setHeroSubtitleEn(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* HERO BANNER CTA (CALL-TO-ACTION) BUTTONS CUSTOMIZATION SECTION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 flex items-center justify-center shadow-xs">
                <MousePointerClick className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'मुख्य एक्शन बटन प्रबंधन (Hero CTA Buttons)' : 'Hero Banner Primary Action Buttons (CTA)'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase">
                    Landing Page
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'hi' 
                    ? 'पब्लिक होमपेज के मुख्य बैनर पर दिखने वाले प्राथमिक व द्वितीयक एक्शन बटन का नाम, लिंक व आइकन कस्टमाइज़ करें।'
                    : 'Customize button text, target destination link (e.g., "Admission Now", "View Gallery"), and icons for the public hero section.'}
                </p>
              </div>
            </div>

            {/* Quick Live Status Badge */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 px-3 rounded-2xl border border-slate-200 text-xs">
              <span className="font-bold text-slate-600">Status:</span>
              <span className={`inline-flex items-center gap-1 font-extrabold ${ctaEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                {ctaEnabled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{ctaEnabled ? 'CTA Active' : 'CTA Hidden'}</span>
              </span>
            </div>
          </div>

          {/* Quick Preset Templates Bar */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/70 space-y-2.5">
            <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{language === 'hi' ? '1-क्लिक प्रीसेट टेम्पलेट्स (Quick Presets):' : '1-Click Quick Preset Presets:'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: '🎓 Free Admission Focus',
                  priTextHi: 'नि:शुल्क प्रवेश प्रक्रिया',
                  priTextEn: 'Free Admission Guidelines',
                  priLink: 'admission',
                  priIcon: 'GraduationCap',
                  secTextHi: 'डीबीटी व सरकारी योजनाएं',
                  secTextEn: 'Govt. Schemes & DBT',
                  secLink: 'schemes',
                  secIcon: 'Gift'
                },
                {
                  label: '🖼️ View Photo Gallery',
                  priTextHi: 'फोटो व वीडियो गैलरी',
                  priTextEn: 'View School Gallery',
                  priLink: 'gallery',
                  priIcon: 'Images',
                  secTextHi: 'विद्यालय सुविधाएं देखें',
                  secTextEn: 'Explore Facilities',
                  secLink: 'facilities',
                  secIcon: 'Building2'
                },
                {
                  label: '🏛️ Campus & Facilities',
                  priTextHi: 'विद्यालय सुविधाएं देखें',
                  priTextEn: 'School Facilities & Labs',
                  priLink: 'facilities',
                  priIcon: 'Building2',
                  secTextHi: 'विद्यालय परिचय',
                  secTextEn: 'About Our School',
                  secLink: 'about',
                  secIcon: 'Info'
                },
                {
                  label: '📢 Latest Notices & Alerts',
                  priTextHi: 'नवीनतम सूचनाएं देखें',
                  priTextEn: 'Public Notices & Circulars',
                  priLink: 'notices',
                  priIcon: 'Bell',
                  secTextHi: 'संपर्क व पता',
                  secTextEn: 'Contact Us',
                  secLink: 'contact',
                  secIcon: 'Phone'
                },
                {
                  label: '📄 Forms & Document Downloads',
                  priTextHi: 'दस्तावेज़ व फॉर्म डाउनलोड',
                  priTextEn: 'Official Forms & Downloads',
                  priLink: 'documents',
                  priIcon: 'FileText',
                  secTextHi: 'नि:शुल्क प्रवेश',
                  secTextEn: 'Admission',
                  secLink: 'admission',
                  secIcon: 'GraduationCap'
                },
              ].map((tpl, i) => (
                <button
                  key={`cta-tpl-${i}`}
                  type="button"
                  onClick={() => {
                    setCtaEnabled(true);
                    setCtaTextHi(tpl.priTextHi);
                    setCtaTextEn(tpl.priTextEn);
                    setCtaLink(tpl.priLink);
                    setCtaIcon(tpl.priIcon);
                    setSecondaryCtaEnabled(true);
                    setSecondaryCtaTextHi(tpl.secTextHi);
                    setSecondaryCtaTextEn(tpl.secTextEn);
                    setSecondaryCtaLink(tpl.secLink);
                    setSecondaryCtaIcon(tpl.secIcon);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 text-slate-800 border border-slate-200 text-xs font-bold transition-all shadow-2xs hover:border-amber-400 cursor-pointer"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* PRIMARY CTA CARD (मुख्य प्राथमिक बटन) */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-5 ${ctaEnabled ? 'bg-amber-50/40 border-amber-300 ring-1 ring-amber-400/20' : 'bg-slate-50/60 border-slate-200 opacity-80'}`}>
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'hi' ? 'प्राथमिक एक्शन बटन (Primary CTA)' : 'Primary Action Button (CTA)'}
                    </h4>
                    <p className="text-[11px] text-slate-500">Highlighted gold action button</p>
                  </div>
                </div>

                {/* Enable Toggle */}
                <button
                  type="button"
                  onClick={() => setCtaEnabled(!ctaEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    ctaEnabled ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {ctaEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{ctaEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {ctaEnabled && (
                <div className="space-y-4">
                  {/* Button Labels (Hindi & English) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'बटन का नाम (हिंदी)' : 'Button Label (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={ctaTextHi}
                        onChange={(e) => setCtaTextHi(e.target.value)}
                        placeholder="उदा. नि:शुल्क प्रवेश प्रक्रिया"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'Button Label (English)' : 'Button Label (English)'}
                      </label>
                      <input
                        type="text"
                        value={ctaTextEn}
                        onChange={(e) => setCtaTextEn(e.target.value)}
                        placeholder="e.g. Free Admission Now"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Destination Page Preset Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'hi' ? 'गंतव्य पृष्ठ चुनें (Select Destination Page):' : 'Select Target Destination Page:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {PRESET_CTA_PAGES.map((page) => {
                        const isSelected = ctaLink === page.id;
                        return (
                          <button
                            key={`pri-page-${page.id}`}
                            type="button"
                            onClick={() => {
                              setCtaLink(page.id);
                              if (page.icon) setCtaIcon(page.icon);
                              if (!ctaTextHi || ctaTextHi === 'नि:शुल्क प्रवेश प्रक्रिया' || ctaTextHi === 'फोटो व वीडियो गैलरी' || ctaTextHi === 'विद्यालय सुविधाएं देखें') {
                                setCtaTextHi(page.defaultTextHi);
                              }
                              if (!ctaTextEn || ctaTextEn === 'Free Admission' || ctaTextEn === 'View Gallery' || ctaTextEn === 'School Facilities') {
                                setCtaTextEn(page.defaultTextEn);
                              }
                            }}
                            className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                            }`}
                          >
                            <span className="truncate">{language === 'hi' ? page.labelHi : page.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom URL or Page Slug Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>{language === 'hi' ? 'या कस्टम लिंक / यूआरएल दर्ज करें (Custom Link or Page ID):' : 'Or Custom Link / Page ID:'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">e.g. admission, gallery, https://...</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={ctaLink}
                        onChange={(e) => setCtaLink(e.target.value)}
                        placeholder="admission or https://example.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:border-amber-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'hi' ? 'बटन का आइकन (Button Icon):' : 'Button Icon:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CTA_ICON_OPTIONS.map((ico) => {
                        const IconComponent = ico.icon;
                        const isSelected = ctaIcon === ico.id;
                        return (
                          <button
                            key={`pri-ico-${ico.id}`}
                            type="button"
                            onClick={() => setCtaIcon(ico.id)}
                            className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                            title={ico.label}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">{ico.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECONDARY CTA CARD (द्वितीयक एक्शन बटन) */}
            <div className={`p-5 sm:p-6 rounded-2xl border transition-all space-y-5 ${secondaryCtaEnabled ? 'bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-400/20' : 'bg-slate-50/60 border-slate-200 opacity-80'}`}>
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {language === 'hi' ? 'द्वितीयक एक्शन बटन (Secondary CTA)' : 'Secondary Action Button'}
                    </h4>
                    <p className="text-[11px] text-slate-500">Green secondary action button</p>
                  </div>
                </div>

                {/* Enable Toggle */}
                <button
                  type="button"
                  onClick={() => setSecondaryCtaEnabled(!secondaryCtaEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    secondaryCtaEnabled ? 'bg-emerald-600 text-white font-black shadow-xs' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {secondaryCtaEnabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{secondaryCtaEnabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>

              {secondaryCtaEnabled && (
                <div className="space-y-4">
                  {/* Button Labels (Hindi & English) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'बटन का नाम (हिंदी)' : 'Button Label (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={secondaryCtaTextHi}
                        onChange={(e) => setSecondaryCtaTextHi(e.target.value)}
                        placeholder="उदा. डीबीटी व योजनाएं"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'Button Label (English)' : 'Button Label (English)'}
                      </label>
                      <input
                        type="text"
                        value={secondaryCtaTextEn}
                        onChange={(e) => setSecondaryCtaTextEn(e.target.value)}
                        placeholder="e.g. Govt. Schemes & DBT"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Destination Page Preset Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'hi' ? 'गंतव्य पृष्ठ चुनें (Select Destination Page):' : 'Select Target Destination Page:'}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {PRESET_CTA_PAGES.map((page) => {
                        const isSelected = secondaryCtaLink === page.id;
                        return (
                          <button
                            key={`sec-page-${page.id}`}
                            type="button"
                            onClick={() => {
                              setSecondaryCtaLink(page.id);
                              if (page.icon) setSecondaryCtaIcon(page.icon);
                              if (!secondaryCtaTextHi || secondaryCtaTextHi === 'डीबीटी व योजनाएं') {
                                setSecondaryCtaTextHi(page.defaultTextHi);
                              }
                              if (!secondaryCtaTextEn || secondaryCtaTextEn === 'Govt. Schemes') {
                                setSecondaryCtaTextEn(page.defaultTextEn);
                              }
                            }}
                            className={`p-2 rounded-xl border text-left text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs font-black'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50'
                            }`}
                          >
                            <span className="truncate">{language === 'hi' ? page.labelHi : page.labelEn}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom URL or Page Slug Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                      <span>{language === 'hi' ? 'या कस्टम लिंक / यूआरएल दर्ज करें:' : 'Or Custom Link / Page ID:'}</span>
                      <span className="text-[10px] text-slate-500 font-normal">e.g. schemes, facilities, https://...</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Link2 className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={secondaryCtaLink}
                        onChange={(e) => setSecondaryCtaLink(e.target.value)}
                        placeholder="schemes or https://example.com"
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-900 focus:border-emerald-500 focus:outline-hidden shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'hi' ? 'बटन का आइकन (Button Icon):' : 'Button Icon:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {CTA_ICON_OPTIONS.map((ico) => {
                        const IconComponent = ico.icon;
                        const isSelected = secondaryCtaIcon === ico.id;
                        return (
                          <button
                            key={`sec-ico-${ico.id}`}
                            type="button"
                            onClick={() => setSecondaryCtaIcon(ico.id)}
                            className={`p-2 rounded-xl border flex items-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-emerald-300 border-slate-900 shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                            title={ico.label}
                          >
                            <IconComponent className="w-3.5 h-3.5" />
                            <span className="text-[11px] hidden sm:inline">{ico.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
        </>
        )}

        {/* HOMEPAGE 6 CORE FACILITIES CUSTOMIZATION & ICON PICKER */}
        {(activeSectionTab === 'all' || activeSectionTab === 'facilities') && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl md:rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'विद्यालय की 6 मुख्य सुविधाएं व आइकन चयनकर्ता' : 'Our Facilities (6 Cards & Icon Selector)'}
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    6 Cards Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {language === 'hi'
                    ? 'सार्वजनिक होमपेज पर प्रदर्शित 6 मुख्य सुविधाओं के नाम, विवरण एवं मनपसंद आइकन (पुस्तकालय, कंप्यूटर, खेल, आदि) चुनें।'
                    : 'Select icons (e.g., library book, computer, playground, drinking water) and edit details for each of the 6 facility cards.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setHomepageFacilities(DEFAULT_HOMEPAGE_FACILITIES)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Reset all 6 facilities to default settings"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'डिफ़ॉल्ट रीसेट करें' : 'Reset to Defaults'}</span>
            </button>
          </div>

          {/* 6 Facilities Cards List / Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
            {homepageFacilities.map((facility, index) => {
              const CurrentIconComp = getFacilityIconComponent(facility.icon);
              const defaultForThis = DEFAULT_HOMEPAGE_FACILITIES[index] || DEFAULT_HOMEPAGE_FACILITIES[0];

              const cardPresets = [
                {
                  border: 'border-amber-200/90 hover:border-amber-400 hover:shadow-amber-500/10',
                  bg: 'bg-gradient-to-br from-white via-amber-50/40 to-orange-50/20',
                  iconBg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600',
                  iconText: 'text-amber-300',
                  numBadge: 'bg-amber-500 text-slate-950',
                  badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
                  focusRing: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
                  accentColor: 'text-amber-700'
                },
                {
                  border: 'border-blue-200/90 hover:border-blue-400 hover:shadow-blue-500/10',
                  bg: 'bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/20',
                  iconBg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700',
                  iconText: 'text-blue-300',
                  numBadge: 'bg-blue-600 text-white',
                  badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
                  focusRing: 'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                  accentColor: 'text-blue-700'
                },
                {
                  border: 'border-emerald-200/90 hover:border-emerald-400 hover:shadow-emerald-500/10',
                  bg: 'bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/20',
                  iconBg: 'bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700',
                  iconText: 'text-emerald-300',
                  numBadge: 'bg-emerald-600 text-white',
                  badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  focusRing: 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                  accentColor: 'text-emerald-700'
                },
                {
                  border: 'border-purple-200/90 hover:border-purple-400 hover:shadow-purple-500/10',
                  bg: 'bg-gradient-to-br from-white via-purple-50/40 to-indigo-50/20',
                  iconBg: 'bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700',
                  iconText: 'text-purple-300',
                  numBadge: 'bg-purple-600 text-white',
                  badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
                  focusRing: 'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                  accentColor: 'text-purple-700'
                },
                {
                  border: 'border-cyan-200/90 hover:border-cyan-400 hover:shadow-cyan-500/10',
                  bg: 'bg-gradient-to-br from-white via-cyan-50/40 to-sky-50/20',
                  iconBg: 'bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-600',
                  iconText: 'text-cyan-300',
                  numBadge: 'bg-cyan-600 text-white',
                  badgeBg: 'bg-cyan-100 text-cyan-800 border-cyan-200',
                  focusRing: 'focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20',
                  accentColor: 'text-cyan-700'
                },
                {
                  border: 'border-rose-200/90 hover:border-rose-400 hover:shadow-rose-500/10',
                  bg: 'bg-gradient-to-br from-white via-rose-50/40 to-orange-50/20',
                  iconBg: 'bg-gradient-to-br from-rose-500 via-orange-600 to-amber-600',
                  iconText: 'text-rose-300',
                  numBadge: 'bg-rose-600 text-white',
                  badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
                  focusRing: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20',
                  accentColor: 'text-rose-700'
                }
              ];

              const preset = cardPresets[index % cardPresets.length];

              return (
                <div
                  key={facility.id || `fac-${index}`}
                  className={`p-5 sm:p-6 rounded-2xl md:rounded-3xl border-2 ${preset.border} ${preset.bg} card-hover-glow transition-all duration-300 shadow-xs hover:shadow-xl hover:-translate-y-1 space-y-4 relative overflow-hidden group`}
                >
                  {/* Card Top Bar with Unified Spacing */}
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-xl ${preset.numBadge} font-black text-xs flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform`}>
                        0{index + 1}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5 leading-snug">
                          <span>{language === 'hi' ? facility.nameHi : facility.nameEn}</span>
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-mono">
                            ID: {facility.id}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className={`text-[10px] font-bold ${preset.accentColor}`}>
                            {language === 'hi' ? `सुविधा कार्ड ०${index + 1}` : `Facility #${index + 1}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Active Icon Pill Preview */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-amber-300 text-xs font-bold shadow-xs">
                        <CurrentIconComp className="w-4 h-4 text-amber-400" />
                        <span className="text-[11px] font-mono tracking-tight">{facility.icon}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...homepageFacilities];
                          updated[index] = { ...defaultForThis };
                          setHomepageFacilities(updated);
                        }}
                        className="p-1.5 rounded-xl hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        title="Reset this facility card to default"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Icon Picker (Consistent with CTA button styles) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>{language === 'hi' ? 'आइकन चयनकर्ता (Select Facility Icon):' : 'Select Facility Icon:'}</span>
                      </label>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${preset.badgeBg}`}>
                        Active: {facility.icon}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-white/95 backdrop-blur-xs rounded-xl md:rounded-2xl border border-slate-200 shadow-inner custom-scrollbar">
                      {FACILITY_ICON_OPTIONS.map((ico) => {
                        const IconComponent = ico.icon;
                        const isSelected = facility.icon === ico.id;
                        return (
                          <button
                            key={`fac-${index}-ico-${ico.id}`}
                            type="button"
                            onClick={() => updateFacilityCard(index, 'icon', ico.id)}
                            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-md ring-2 ring-amber-400/40 font-black scale-105 z-10'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                            }`}
                            title={language === 'hi' ? `${ico.labelHi} (${ico.id})` : `${ico.label} (${ico.id})`}
                          >
                            <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-600'}`} />
                            <span className="text-[11px] whitespace-nowrap">{ico.id}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title Inputs (Hindi & English) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'सुविधा का नाम (हिंदी)' : 'Facility Name (Hindi)'}
                      </label>
                      <input
                        type="text"
                        value={facility.nameHi}
                        onChange={(e) => updateFacilityCard(index, 'nameHi', e.target.value)}
                        placeholder="उदा. पुस्तकालय (Library)"
                        className={`w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 ${preset.focusRing} focus:outline-hidden transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'सुविधा का नाम (अंग्रेजी)' : 'Facility Name (English)'}
                      </label>
                      <input
                        type="text"
                        value={facility.nameEn}
                        onChange={(e) => updateFacilityCard(index, 'nameEn', e.target.value)}
                        placeholder="e.g. Library & Reading Corner"
                        className={`w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-900 ${preset.focusRing} focus:outline-hidden transition-all`}
                      />
                    </div>
                  </div>

                  {/* Description Inputs (Hindi & English) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'विवरण (हिंदी)' : 'Description (Hindi)'}
                      </label>
                      <textarea
                        rows={2}
                        value={facility.descHi}
                        onChange={(e) => updateFacilityCard(index, 'descHi', e.target.value)}
                        placeholder="सुविधा का संक्षिप्त हिंदी विवरण..."
                        className={`w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 ${preset.focusRing} focus:outline-hidden resize-none transition-all`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {language === 'hi' ? 'विवरण (अंग्रेजी)' : 'Description (English)'}
                      </label>
                      <textarea
                        rows={2}
                        value={facility.descEn}
                        onChange={(e) => updateFacilityCard(index, 'descEn', e.target.value)}
                        placeholder="Short English description of facility..."
                        className={`w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 ${preset.focusRing} focus:outline-hidden resize-none transition-all`}
                      />
                    </div>
                  </div>

                  {/* Live Card Mini Preview with Unified Spacing System */}
                  <div className="p-4 rounded-xl md:rounded-2xl bg-white/95 border border-slate-200/90 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Public Live Preview</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono font-bold">
                        Card #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-start gap-3.5 pt-1">
                      <div className={`w-12 h-12 rounded-xl md:rounded-2xl ${preset.iconBg} text-white flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105`}>
                        <CurrentIconComp className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-sm font-black text-slate-900 tracking-tight leading-snug truncate">
                          {language === 'hi' ? facility.nameHi : facility.nameEn}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {language === 'hi' ? facility.descHi : facility.descEn}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
        )}

        {/* SECTION VISIBILITY TOGGLES */}
        {(activeSectionTab === 'all' || activeSectionTab === 'visibility') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {language === 'hi' ? 'होमपेज खंड दृश्यता नियंत्रण (Homepage Section Toggles)' : 'Homepage Section Visibility Controls'}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'hi' 
                  ? 'सार्वजनिक वेबसाइट पर जिन अनुभागों को दिखाना या छिपाना चाहते हैं, उन्हें चालू या बंद करें।'
                  : 'Toggle sections ON or OFF to control what is displayed to public visitors.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Toggle 1: Hero Quick Stats */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Hero Metrics Strip</div>
                <div className="text-[11px] text-slate-500">UDISE, Enrolled students, Class 1-8</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('heroStats')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.heroStats ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.heroStats ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 2: Principal Message */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Head Teacher Desk</div>
                <div className="text-[11px] text-slate-500">Smt. Kiran Shakya Welcome Message</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('principalMessage')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.principalMessage ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.principalMessage ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 3: Notice Ticker */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Circulars & Announcements</div>
                <div className="text-[11px] text-slate-500">Live notice board ticker</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('noticeTicker')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.noticeTicker ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.noticeTicker ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle: Educational & Motivational Videos (Class 1 to 8) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'hi' ? 'कक्षा 1-8 प्रेरक वीडियो ग्रिड' : 'Class 1-8 Motivation Videos'}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {language === 'hi' ? 'यूट्यूब वीडियो, FLN, विज्ञान प्रयोग व कलाम विचार' : 'YouTube curriculum videos & inspiration'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('educationalVideos')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.educationalVideos !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.educationalVideos !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 4: Facilities Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">School Facilities</div>
                <div className="text-[11px] text-slate-500">Drinking water, playground, ICT</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('facilitiesPreview')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.facilitiesPreview ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.facilitiesPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 5: Schemes Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Government Schemes</div>
                <div className="text-[11px] text-slate-500">PM POSHAN, DBT, Uniforms</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('schemesPreview')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.schemesPreview ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.schemesPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 6: Gallery Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Photo Gallery Highlights</div>
                <div className="text-[11px] text-slate-500">Recent events & celebrations</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('galleryPreview')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.galleryPreview ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.galleryPreview ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>

            {/* Toggle 7: Useful Government Links */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-xs text-slate-900">Official Portal Links</div>
                <div className="text-[11px] text-slate-500">UDISE+, Shala Kosh, Basic Shiksha</div>
              </div>
              <button
                type="button"
                onClick={() => toggleSection('officialLinks')}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  visibility.officialLinks ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {visibility.officialLinks ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Save Bar */}
        <div className="flex items-center justify-end p-5 bg-white rounded-3xl border border-slate-200 shadow-xs">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : language === 'hi' ? 'बैनर, कैरोसेल व लेआउट सेटिंग्स सहेजें' : 'Save Banner, Carousel & Homepage Settings'}</span>
          </button>
        </div>
      </form>
      )}

      {/* Media Library Selection Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <Images className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {language === 'hi' ? 'मीडिया लाइब्रेरी से फोटो चुनें' : 'Select Photos from Media Library'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'hi' 
                      ? 'विद्यालय गैलरी से फ़ोटो चुनकर मुख्य बैनर कैरोसेल में जोड़ें।' 
                      : 'Choose verified school photos from the media gallery to include in hero rotation.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  placeholder={language === 'hi' ? 'फोटो खोजें...' : 'Search photos...'}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                {['All', 'Classroom & Learning', 'School Building', 'Facilities', 'Events & Celebrations', 'Sports & Activities'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMediaCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap cursor-pointer transition-all ${
                      selectedMediaCategory === cat
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Media Grid */}
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {filteredGallery.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredGallery.map((item) => {
                    const itemUrl = item.imageUrl || item.imageURL;
                    const isSelected = selectedGalleryUrls.includes(itemUrl);
                    const isAlreadyInCarousel = carouselImages.includes(itemUrl);

                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleSelectGalleryUrl(itemUrl)}
                        className={`relative rounded-2xl overflow-hidden border cursor-pointer group aspect-[16/10] transition-all ${
                          isSelected 
                            ? 'border-indigo-600 ring-3 ring-indigo-500/30' 
                            : isAlreadyInCarousel
                            ? 'border-emerald-400 opacity-90'
                            : 'border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={item.thumbnailURL || itemUrl}
                          alt={item.titleEn || item.titleHi}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        
                        {/* Overlay with selection check */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent p-2.5 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            {isAlreadyInCarousel && (
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-bold">
                                Added
                              </span>
                            )}
                            <div className="ml-auto">
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-900/70 text-white/70 group-hover:bg-slate-900'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[10px] font-bold text-white line-clamp-1">
                              {language === 'hi' ? item.titleHi : item.titleEn}
                            </p>
                            <span className="text-[9px] text-slate-300 font-mono">
                              {item.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-xs font-bold text-slate-700">No matching photos found in media library</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">
                {selectedGalleryUrls.length} {language === 'hi' ? 'फोटो चयनित' : 'photos selected'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={selectedGalleryUrls.length === 0}
                  onClick={handleConfirmMediaPicker}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-40"
                >
                  {language === 'hi' ? `कैरोसेल में जोड़ें (${selectedGalleryUrls.length})` : `Add to Carousel (${selectedGalleryUrls.length})`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom URL Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Link2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900">
                  {language === 'hi' ? 'इमेज URL से फोटो जोड़ें' : 'Add Image via Direct URL'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {language === 'hi' ? 'फोटो का सीधा वेब लिंक (HTTPS URL):' : 'Direct Image HTTPS URL:'}
              </label>
              <input
                type="url"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
              />
              <p className="text-[10px] text-slate-500">
                Recommended 2000px widescreen resolution for high DPI screens.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!customUrlInput.trim()}
                onClick={handleAddCustomUrl}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-40"
              >
                Add to Carousel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Canvas Image Cropper Modal */}
      {cropperOpen && (
        <ImageCropperModal
          isOpen={cropperOpen}
          imageUrl={rawImageForCrop}
          onClose={() => setCropperOpen(false)}
          onCropComplete={handleCropComplete}
          initialAspectRatio={bannerRatio}
          title={language === 'hi' ? 'मुख्य बैनर इमेज क्रॉपर (21:9)' : 'Hero Banner Image Cropper (21:9)'}
          subtitle={language === 'hi' ? 'पैनोरमिक अनुपात में क्रॉप करें ताकि होमपेज हेडर पर बैनर बिना किसी विकृति के दिखे।' : 'Frame your image to fit the homepage widescreen hero header perfectly.'}
        />
      )}
    </div>
  );
};
