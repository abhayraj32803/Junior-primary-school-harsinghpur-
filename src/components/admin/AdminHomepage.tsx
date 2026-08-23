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
  Activity
} from 'lucide-react';
import { AdminVisitorCounterWidget } from './AdminVisitorCounterWidget';
import { AdminEducationalVideos } from './AdminEducationalVideos';
import { ImageCropperModal } from '../common/ImageCropperModal';
import { PRESET_HERO_BANNERS, CropResult } from '../../utils/cropUtils';

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
  const [activeSectionTab, setActiveSectionTab] = useState<'all' | 'banner' | 'videos' | 'visibility' | 'visitor'>('all');

  // Keep state in sync if settings update
  useEffect(() => {
    if (settings.heroBannerImage) setBannerImage(settings.heroBannerImage);
    if (settings.heroBannerAspectRatio) setBannerRatio(settings.heroBannerAspectRatio);
    if (settings.heroBannerLayout) setBannerLayout(settings.heroBannerLayout);
    if (settings.heroBannerOverlayOpacity !== undefined) setOverlayOpacity(settings.heroBannerOverlayOpacity);
    if (settings.heroBannerHeadlineHi) setHeroTitleHi(settings.heroBannerHeadlineHi);
    if (settings.heroBannerHeadlineEn) setHeroTitleEn(settings.heroBannerHeadlineEn);
    if (settings.heroBannerSubtitleHi) setHeroSubtitleHi(settings.heroBannerSubtitleHi);
    if (settings.heroBannerSubtitleEn) setHeroSubtitleEn(settings.heroBannerSubtitleEn);
    if (settings.heroBannerCarouselEnabled !== undefined) setCarouselEnabled(settings.heroBannerCarouselEnabled);
    if (settings.heroBannerCarouselImages && settings.heroBannerCarouselImages.length > 0) {
      setCarouselImages(settings.heroBannerCarouselImages);
    }
    if (settings.heroBannerCarouselInterval) setCarouselInterval(settings.heroBannerCarouselInterval);
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
          heroBannerOverlayOpacity: overlayOpacity,
          heroBannerHeadlineHi: heroTitleHi,
          heroBannerHeadlineEn: heroTitleEn,
          heroBannerSubtitleHi: heroSubtitleHi,
          heroBannerSubtitleEn: heroSubtitleEn,
          heroBannerCarouselEnabled: carouselEnabled,
          heroBannerCarouselImages: carouselImages,
          heroBannerCarouselInterval: carouselInterval,
        },
        {
          field: 'Homepage Hero Banner & Carousel Settings',
          previousValue: settings.heroBannerCarouselEnabled ? 'Carousel Active' : 'Single Banner',
          newValue: carouselEnabled 
            ? `Carousel (${carouselImages.length} slides, ${carouselInterval}s interval, ${bannerRatio})` 
            : `Single Banner (${bannerRatio}, ${bannerLayout})`,
          source: 'Headmaster Administrative Panel',
          status: 'VERIFIED_CURRENT',
          notes: `Updated hero banner, carousel mode (${carouselEnabled ? 'Enabled' : 'Disabled'}), ${carouselImages.length} slides, and headlines by ${userProfile?.name || 'Admin'}`
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
          { id: 'videos', labelHi: 'कक्षा 1-8 शैक्षिक वीडियो', labelEn: 'Educational Videos', icon: Video, badge: 'Class 1-8' },
          { id: 'banner', labelHi: 'बैनर व कैरोसेल', labelEn: 'Banner & Carousel', icon: ImageIcon },
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

      {(activeSectionTab === 'all' || activeSectionTab === 'banner' || activeSectionTab === 'visibility') && (
        <form onSubmit={handleSave} className="space-y-6">
        
        {/* HERO BANNER IMAGE & LIVE SIMULATION SECTION */}
        {(activeSectionTab === 'all' || activeSectionTab === 'banner') && (
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
                    className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent flex flex-col justify-center p-6 sm:p-8"
                    style={{ opacity: overlayOpacity / 100 }}
                  >
                    <div 
                      key={`preview-hero-${previewAnimKey}-${language}`} 
                      className="max-w-xl space-y-2 text-white"
                    >
                      <div className="flex flex-wrap items-center gap-2 animate-hero-badges">
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                          उत्तर प्रदेश शासन
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[10px] font-bold">
                          कक्षा 1 से 8 (कंपोजिट)
                        </span>
                        <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-slate-900/80 text-amber-300 text-[10px] font-mono font-bold">
                          UDISE: {settings.schoolCode}
                        </span>
                      </div>
                      <h4 
                        key={`hero-title-${previewAnimKey}-${language}-${heroTitleHi}-${heroTitleEn}`}
                        className="text-sm sm:text-xl md:text-2xl font-black tracking-tight leading-tight text-white drop-shadow-md animate-hero-headline"
                      >
                        {language === 'hi' ? heroTitleHi : heroTitleEn}
                      </h4>
                      <p 
                        key={`hero-sub-${previewAnimKey}-${language}-${heroSubtitleHi}-${heroSubtitleEn}`}
                        className="text-[11px] sm:text-xs text-slate-300 line-clamp-2 animate-hero-subtitle"
                      >
                        {language === 'hi' ? heroSubtitleHi : heroSubtitleEn}
                      </p>
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 cursor-pointer shadow-md transition-transform hover:scale-105"
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center backdrop-blur-xs border border-white/20 cursor-pointer shadow-md transition-transform hover:scale-105"
                        title="Next Slide"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Navigation Dots and Slide Counter */}
                      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        <button
                          type="button"
                          onClick={() => setIsPreviewPlaying(p => !p)}
                          className="text-amber-400 hover:text-amber-300 text-[10px] pr-1 cursor-pointer"
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
                                idx === previewSlideIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/50 hover:bg-white/80'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono text-white/90 pl-1 border-l border-white/20">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              
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

              {/* Overlay Opacity Slider */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{language === 'hi' ? 'डार्क ओवरले घनत्व' : 'Text Contrast Overlay'}</span>
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
                  {language === 'hi' ? 'सफेद टेक्स्ट को स्पष्ट रूप से पढ़ने के लिए ओवरले बढ़ाएं।' : 'Darkens image behind text for WCAG AAA accessibility.'}
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
        </>
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
